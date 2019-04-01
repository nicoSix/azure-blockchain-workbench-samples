// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. 
// To get started please visit https://microsoft.github.io/azure-iot-developer-kit/docs/projects/remote-monitoring/?utm_source=ArduinoExtension&utm_medium=ReleaseNote&utm_campaign=VSCode
#include "Arduino.h"
#include "Sensor.h"
#include "AzureIotHub.h"
#include "AZ3166WiFi.h"
#include "DevKitMQTTClient.h"
#include "Telemetry.h"
#include "SystemTime.h"
#include "SystemTickCounter.h"

#define INTERVAL 20000

static bool isConnected = false;

DevI2C *ext_i2c;
HTS221Sensor *ht_sensor;
LPS22HBSensor *lp_sensor;

char wifiBuff[128];

float temperature = 50;
char temperatureUnit = 'C';
float humidity = 50;
char humidityUnit = '%';
const char *deviceId = "MXChipDevice";

#define RECONNECT_THRESHOLD 3

void InitWiFi()
{
  Screen.print("WiFi \r\n \r\nConnecting...\r\n             \r\n");
  
  if(WiFi.begin() == WL_CONNECTED)
  {
    IPAddress ip = WiFi.localIP();
    sprintf(wifiBuff, "WiFi \r\n %s\r\n %s \r\n \r\n",WiFi.SSID(),ip.get_address());
    Screen.print(wifiBuff);
    isConnected = true;
  }
  else
  {
    sprintf(wifiBuff, "WiFi  \r\n             \r\nNo connection\r\n                 \r\n");
    Screen.print(wifiBuff);
  }
}

void sendData(const char *data){
  time_t t = time(NULL);
  char buf[sizeof "2011-10-08T07:07:09Z"];
  strftime(buf, sizeof buf, "%FT%TZ", gmtime(&t));
  LogInfo(data);
  EVENT_INSTANCE* message = DevKitMQTTClient_Event_Generate(data, MESSAGE);

  DevKitMQTTClient_Event_AddProp(message, "$$CreationTimeUtc", buf);
  DevKitMQTTClient_Event_AddProp(message, "$$ContentType", "JSON");
  
  DevKitMQTTClient_SendEventInstance(message);
}

void showSensors()
{
  try
  {
    ht_sensor->reset();
    ht_sensor->getTemperature(&temperature);
    ht_sensor->getHumidity(&humidity);
    
    char buff[128];
    sprintf(buff, "Environment \r\n dId: %s \r\n Temp:%s%c    \r\n Humidity:%s%c  \r\n",deviceId, f2s(temperature, 1),temperatureUnit, f2s(humidity, 1), humidityUnit);
    Screen.print(buff);

    char sensorData[200];
    sprintf_s(sensorData, sizeof(sensorData), "{\"temperature\":%s,\"temperature_unit\":\"%c\",\"humidity\":%s,\"humidity_unit\":\"%c\",\"deviceid\":\"%s\"}", f2s((int) temperature, 1), temperatureUnit,f2s((int) humidity, 1), humidityUnit, deviceId);
    sendData(sensorData);
  }
  catch(int error)
  {
    LogError("*** Read sensor failed: %d",error);
  }
}

void setup() {

  ext_i2c = new DevI2C(D14, D15);
  
  ht_sensor = new HTS221Sensor(*ext_i2c);
  ht_sensor->init(NULL);

  lp_sensor= new LPS22HBSensor(*ext_i2c);
  lp_sensor->init(NULL);
  
  //Scan networks and print them into console
  int numSsid = WiFi.scanNetworks();
  for (int thisNet = 0; thisNet < numSsid; thisNet++) {
     Serial.print(thisNet);
     Serial.print(") ");
     Serial.print(WiFi.SSID(thisNet));
     Serial.print("\tSignal: ");
     Serial.print(WiFi.RSSI(thisNet));
     Serial.print("\tEnc type: ");
     Serial.println(WiFi.encryptionType(thisNet));
  }   

  InitWiFi();

  if (isConnected)
  {
    // Microsoft collects data to operate effectively and provide you the best experiences with our products. 
    // We collect data about the features you use, how often you use them, and how you use them.
    send_telemetry_data_async("", "RemoteMonitoringSetupV2", "");

    //setup the MQTT Client
    DevKitMQTTClient_Init(false); //set to false, we are not using twin device here
  }
}



static uint64_t send_interval_ms;

void loop() {
  // put your main code here, to run repeatedly:
  if(isConnected)
  {
    if((int)(SystemTickCounterRead() - send_interval_ms)>INTERVAL)
    {
      //read and send temperature and humidity every n seconds, depending of the interval
      showSensors();
      send_interval_ms = SystemTickCounterRead();
    }
  }
}
