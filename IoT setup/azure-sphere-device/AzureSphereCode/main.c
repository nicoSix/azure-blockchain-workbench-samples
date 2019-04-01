#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <stdlib.h>

// applibs_versions.h defines the API struct versions to use for applibs APIs.
#include "applibs_versions.h"
#include "epoll_timerfd_utilities.h"

#include <applibs/gpio.h>
#include <applibs/log.h>
#include <applibs/wificonfig.h>

#include "mt3620_rdb.h"
#include "rgbled_utility.h"

#include "main.h"
#include "Grove.h"
#include "Sensors/GroveTempHumiSHT31.h"

// This application based on the sample C application for a MT3620 Reference Development Board (Azure Sphere) demonstrates how to
// connect an Azure Sphere device to an Azure IoT Hub and send telemetry from the SHT31 sensor. To use this sample, you must first
// add the Azure IoT Hub Connected Service reference to the project (right-click
// References -> Add Connected Service -> Azure IoT Hub), which populates this project
// with additional sample code used to communicate with an Azure IoT Hub.

#ifndef AZURE_IOT_HUB_CONFIGURED
#error \
    "WARNING: Please add a project reference to the Connected Service first \
(right-click References -> Add Connected Service)."
#endif

#include "azure_iot_utilities.h"

// An array defining the RGB GPIOs for each LED on the device
static const GPIO_Id ledsPins[3][3] = {
	{MT3620_RDB_LED1_RED, MT3620_RDB_LED1_GREEN, MT3620_RDB_LED1_BLUE}, {MT3620_RDB_LED2_RED, MT3620_RDB_LED2_GREEN, MT3620_RDB_LED2_BLUE}, {MT3620_RDB_LED3_RED, MT3620_RDB_LED3_GREEN, MT3620_RDB_LED3_BLUE} };

// File descriptors - initialized to invalid value
static int epollFd = -1;
static int led2BlinkTimerFd = -1;
static int azureIoTDoWorkTimerFd = -1;
static int azureTelemetryTimerFd = -1;

// Azure IoT poll periods
static const int AzureIoTDefaultPollPeriodSeconds = 5;
static const int AzureIoTMinReconnectPeriodSeconds = 60;
static const int AzureIoTMaxReconnectPeriodSeconds = 10 * 60;

static int azureIoTPollPeriodSeconds = -1;

// LED state
static RgbLed led1 = RGBLED_INIT_VALUE;
static RgbLed led2 = RGBLED_INIT_VALUE;
static RgbLed led3 = RGBLED_INIT_VALUE;
static RgbLed *rgbLeds[] = { &led1, &led2, &led3 };
static const size_t rgbLedsCount = sizeof(rgbLeds) / sizeof(*rgbLeds);

// A null period to not start the timer when it is created with CreateTimerFdAndAddToEpoll.
static const struct timespec nullPeriod = { 0, 0 };
static const struct timespec defaultBlinkTimeLed2 = { 0, 150 * 1000 * 1000 };
static const struct timespec telemetryTime = { 10, 0 };

// Connectivity state
static bool connectedToIoTHub = false;

// Termination state
static volatile sig_atomic_t terminationRequired = false;

//Temperature and humidity sensor
void* sht31;

/// <summary>
///     Signal handler for termination requests. This handler must be async-signal-safe.
/// </summary>
static void TerminationHandler(int signalNumber)
{
	// Don't use Log_Debug here, as it is not guaranteed to be async-signal-safe.
	terminationRequired = true;
}

/// <summary>
///     Show details of the currently connected WiFi network.
/// </summary>
static void DebugPrintCurrentlyConnectedWiFiNetwork(void)
{
	WifiConfig_ConnectedNetwork network;
	int result = WifiConfig_GetCurrentNetwork(&network);
	if (result < 0) {
		Log_Debug("INFO: Not currently connected to a WiFi network.\n");
	}
	else {
		Log_Debug("INFO: Currently connected WiFi network: \n");
		Log_Debug("INFO: SSID \"%.*s\", BSSID %02x:%02x:%02x:%02x:%02x:%02x, Frequency %dMHz.\n",
			network.ssidLength, network.ssid, network.bssid[0], network.bssid[1],
			network.bssid[2], network.bssid[3], network.bssid[4], network.bssid[5],
			network.frequencyMHz);
	}
}

/// <summary>
///     Helper function to blink LED2 once.
/// </summary>
static void BlinkLed2Once(void)
{
	RgbLedUtility_SetLed(&led2, RgbLedUtility_Colors_Red);
	SetTimerFdToSingleExpiry(led2BlinkTimerFd, &defaultBlinkTimeLed2);
}

/// <summary>
///     Send telemetry data (temperature and humidity) to our IoT Hub
/// </summary>
static void SendTelemetryToIoTHub(void)
{
	if (connectedToIoTHub) {
		// Send a message
		char telemetry[255] = "";
		char temperature[10] = "";
		char humidity[10] = "";

		GroveTempHumiSHT31_Read(sht31);

		sprintf(temperature, "%d", (int)GroveTempHumiSHT31_GetTemperature(sht31));
		sprintf(humidity, "%d", (int)GroveTempHumiSHT31_GetHumidity(sht31));

		strcat(telemetry, "{'deviceId':'AzureSphereDevice','temperature':");
		strcat(telemetry, temperature);
		strcat(telemetry, ",'humidity':");
		strcat(telemetry, humidity);
		strcat(telemetry, "}");

		Log_Debug("Sending telemetry data to the IoT Hub ...\n");
		Log_Debug(telemetry);
		Log_Debug("\n");
		AzureIoT_SendMessage(telemetry);

		// Set the send/receive LED2 to blink once immediately to indicate the message has been queued
		BlinkLed2Once();
	}
	else {
		Log_Debug("WARNING: Cannot send message: not connected to the IoT Hub.\n");
	}
}

/// <summary>
///     InitializeTempHumiSensor is in charge of enabling connection between the program and the sensor
/// </summary>
static void InitializeTempHumiSensor(void) {
	int i2cFd;
	GroveShield_Initialize(&i2cFd, 115200);
	sht31 = GroveTempHumiSHT31_Open(i2cFd);
	return;
}

/// <summary>
///     MessageReceived callback function, called when a message is received from the Azure IoT Hub.
/// </summary>
/// <param name="payload">The payload of the received message.</param>
static void MessageReceived(const char *payload)
{
	// Set the send/receive LED2 to blink once immediately to indicate a message has been received.
	BlinkLed2Once();
}

/// <summary>
///     IoT Hub connection status callback function.
/// </summary>
/// <param name="connected">'true' when the connection to the IoT Hub is established.</param>
static void IoTHubConnectionStatusChanged(bool connected)
{
	connectedToIoTHub = connected;
}

/// <summary>
///     Handle the blinking for LED2.
/// </summary>
static void Led2UpdateHandler(EventData *eventData)
{
	if (ConsumeTimerFdEvent(led2BlinkTimerFd) != 0) {
		terminationRequired = true;
		return;
	}

	// Clear the send/receive LED2.
	RgbLedUtility_SetLed(&led2, RgbLedUtility_Colors_Off);
}

/// <summary>
///     Hand over control periodically to send telemetry data
/// </summary>
static void AzureTelemetryHandler(EventData *eventData)
{
	if (ConsumeTimerFdEvent(azureTelemetryTimerFd) != 0) {
		terminationRequired = true;
		return;
	}

	if(connectedToIoTHub) SendTelemetryToIoTHub();
}

/// <summary>
///     Hand over control periodically to the Azure IoT SDK's DoWork.
/// </summary>
static void AzureIoTDoWorkHandler(EventData *eventData)
{
	if (ConsumeTimerFdEvent(azureIoTDoWorkTimerFd) != 0) {
		terminationRequired = true;
		return;
	}

	// Set up the connection to the IoT Hub client.
	// Notes it is safe to call this function even if the client has already been set up, as in
	//   this case it would have no effect
	if (AzureIoT_SetupClient()) {
		if (azureIoTPollPeriodSeconds != AzureIoTDefaultPollPeriodSeconds) {
			azureIoTPollPeriodSeconds = AzureIoTDefaultPollPeriodSeconds;

			struct timespec azureTelemetryPeriod = { azureIoTPollPeriodSeconds, 0 };
			SetTimerFdToPeriod(azureIoTDoWorkTimerFd, &azureTelemetryPeriod);
		}

		// AzureIoT_DoPeriodicTasks() needs to be called frequently in order to keep active
		// the flow of data with the Azure IoT Hub
		AzureIoT_DoPeriodicTasks();
	}
	else {
		// If we fail to connect, reduce the polling frequency, starting at
		// AzureIoTMinReconnectPeriodSeconds and with a backoff up to
		// AzureIoTMaxReconnectPeriodSeconds
		if (azureIoTPollPeriodSeconds == AzureIoTDefaultPollPeriodSeconds) {
			azureIoTPollPeriodSeconds = AzureIoTMinReconnectPeriodSeconds;
		}
		else {
			azureIoTPollPeriodSeconds *= 2;
			if (azureIoTPollPeriodSeconds > AzureIoTMaxReconnectPeriodSeconds) {
				azureIoTPollPeriodSeconds = AzureIoTMaxReconnectPeriodSeconds;
			}
		}

		struct timespec azureTelemetryPeriod = { azureIoTPollPeriodSeconds, 0 };
		SetTimerFdToPeriod(azureIoTDoWorkTimerFd, &azureTelemetryPeriod);

		Log_Debug("ERROR: Failed to connect to IoT Hub; will retry in %i seconds\n",
			azureIoTPollPeriodSeconds);
	}
}

// event handler data structures. Only the event handler field needs to be populated.
static EventData led2EventData = { .eventHandler = &Led2UpdateHandler };
static EventData azureIoTEventData = { .eventHandler = &AzureIoTDoWorkHandler };
static EventData azureTelemetryEventData = { .eventHandler = &AzureTelemetryHandler };

/// <summary>
///     Initialize peripherals, termination handler, and Azure IoT
/// </summary>
/// <returns>0 on success, or -1 on failure</returns>
static int InitPeripheralsAndHandlers(void)
{
	// Register a SIGTERM handler for termination requests
	struct sigaction action;
	memset(&action, 0, sizeof(struct sigaction));
	action.sa_handler = TerminationHandler;
	sigaction(SIGTERM, &action, NULL);

	// Open file descriptors for the RGB LEDs and store them in the rgbLeds array (and in turn in
	// the ledBlink, ledMessageEventSentReceived, ledNetworkStatus variables)
	RgbLedUtility_OpenLeds(rgbLeds, rgbLedsCount, ledsPins);
	InitializeTempHumiSensor();

	// Initialize the Azure IoT SDK
	if (!AzureIoT_Initialize()) {
		Log_Debug("ERROR: Cannot initialize Azure IoT Hub SDK.\n");
		return -1;
	}

	// Set the Azure IoT hub related callbacks
	AzureIoT_SetMessageReceivedCallback(&MessageReceived);
	AzureIoT_SetConnectionStatusCallback(&IoTHubConnectionStatusChanged);

	// Display the currently connected WiFi connection.
	DebugPrintCurrentlyConnectedWiFiNetwork();

	epollFd = CreateEpollFd();
	if (epollFd < 0) {
		return -1;
	}

	// Set up a timer for blinking LED2 once.
	led2BlinkTimerFd = CreateTimerFdAndAddToEpoll(epollFd, &nullPeriod, &led2EventData, EPOLLIN);
	if (led2BlinkTimerFd < 0) {
		return -1;
	}

	// Set up a timer for telemetry sending
	azureTelemetryTimerFd = CreateTimerFdAndAddToEpoll(epollFd, &telemetryTime, &azureTelemetryEventData, EPOLLIN);
	if (azureTelemetryTimerFd < 0) {
		return -1;
	}

	// Set up a timer for Azure IoT SDK DoWork execution.
	azureIoTPollPeriodSeconds = AzureIoTDefaultPollPeriodSeconds;
	struct timespec azureIoTDoWorkPeriod = { azureIoTPollPeriodSeconds, 0 };
	azureIoTDoWorkTimerFd =
		CreateTimerFdAndAddToEpoll(epollFd, &azureIoTDoWorkPeriod, &azureIoTEventData, EPOLLIN);
	if (azureIoTDoWorkTimerFd < 0) {
		return -1;
	}

	return 0;
}

/// <summary>
///     Close peripherals and Azure IoT
/// </summary>
static void ClosePeripheralsAndHandlers(void)
{
	Log_Debug("INFO: Closing GPIOs and Azure IoT client.\n");

	CloseFdAndPrintError(azureIoTDoWorkTimerFd, "IoTDoWorkTimer");
	CloseFdAndPrintError(led2BlinkTimerFd, "Led2BlinkTimer");
	CloseFdAndPrintError(epollFd, "Epoll");

	// Close the LEDs and leave then off
	RgbLedUtility_CloseLeds(rgbLeds, rgbLedsCount);

	// Destroy the IoT Hub client
	AzureIoT_DestroyClient();
	AzureIoT_Deinitialize();
}

/// <summary>
///     Main entry point for this application.
/// </summary>
int main(int argc, char *argv[])
{
	Log_Debug("INFO: Azure IoT application starting.\n");

	int initResult = InitPeripheralsAndHandlers();
	if (initResult != 0) {
		terminationRequired = true;
	}

	while (!terminationRequired) {
		if (WaitForEventAndCallHandler(epollFd) != 0) {
			terminationRequired = true;
		}
	}

	ClosePeripheralsAndHandlers();
	Log_Debug("INFO: Application exiting.\n");
	return 0;
}
