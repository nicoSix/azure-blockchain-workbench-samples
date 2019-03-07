// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

// The device connection string to authenticate the device with your IoT hub.
//
// NOTE:
// For simplicity, this sample sets the connection string in code.
// In a production environment, the recommended approach is to use
// an environment variable to make it available to your application
// or use an HSM or an x509 certificate.
// https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-security

var DEVICE_ID = 'SimulatedDevice';

// Using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
var connectionString = 'HostName=myhubforworkbench.azure-devices.net;DeviceId=' + DEVICE_ID + ';SharedAccessKey=vLCcNiVZ7UCTDdlZ0CAr7qfH99AHSoOt0Tu48MAtHEE=';

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// Create a message and send it to the IoT hub every second
setInterval(function(){
  // Simulate telemetry.
  var temperature = parseInt(-20 + (Math.random() * 23));
  var humidity = parseInt(30 + (Math.random() * 23));

  var message = new Message(JSON.stringify({
    temperature: temperature,
    humidity: humidity,
    deviceId: DEVICE_ID
  }));

  // If temperature and humidity are too high, the property level of the message is set to critical
  message.properties.add('level', (temperature > 0 || humidity > 50) ? 'critical' : 'normal');

  console.log('Sending message: ' + message.getData() + ' ...');
  console.log('Message body : ' + JSON.stringify(message) + ' ...')

  // Send the message.
  client.sendEvent(message, function (err) {
    if (err) {
      console.error('Send error: ' + err.toString());
    } else {
      console.log('Message sent to the Hub !');
    }
  });
}, 3000);
