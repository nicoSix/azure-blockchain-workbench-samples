# 1 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
# 1 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. 
// To get started please visit https://microsoft.github.io/azure-iot-developer-kit/docs/projects/remote-monitoring/?utm_source=ArduinoExtension&utm_medium=ReleaseNote&utm_campaign=VSCode
# 5 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 6 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 7 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 8 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 9 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 10 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 11 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2
# 12 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 2



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
  time_t t = time(
# 50 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 3 4
                 __null
# 50 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
                     );
  char buf[sizeof "2011-10-08T07:07:09Z"];
  strftime(buf, sizeof buf, "%FT%TZ", gmtime(&t));
  do{{ if (0) { (void)printf(data); } { LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 53 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 3 4
 __null
# 53 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
 ) l(AZ_LOG_INFO, "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino", __func__, 53, 0x01, data); } }; }while((void)0,0);
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
    do{ { if (0) { (void)printf("*** Read sensor failed: %d",error); } { LOGGER_LOG l = xlogging_get_log_function(); if (l != 
# 80 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 3 4
   __null
# 80 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
   ) l(AZ_LOG_ERROR, "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino", __func__, 80, 0x01, "*** Read sensor failed: %d",error); } }; }while((void)0,0);
  }
}

void setup() {

  ext_i2c = new DevI2C(D14, D15);

  ht_sensor = new HTS221Sensor(*ext_i2c);
  ht_sensor->init(
# 89 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 3 4
                 __null
# 89 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
                     );

  lp_sensor= new LPS22HBSensor(*ext_i2c);
  lp_sensor->init(
# 92 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino" 3 4
                 __null
# 92 "c:\\Users\\t-nisix\\Documents\\Development\\refrigerated-sc-sample\\IoT setup\\mxchip-device\\Device\\device.ino"
                     );

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
    if((int)(SystemTickCounterRead() - send_interval_ms)>20000)
    {
      //read and send temperature and humidity every n seconds, depending of the interval
      showSensors();
      send_interval_ms = SystemTickCounterRead();
    }
  }
}
