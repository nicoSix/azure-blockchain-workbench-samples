---
services: iot-hub
platforms: Nodejs
author: shizn
---

# IoT Hub Raspberry Pi 3 Client application
[![Build Status](https://travis-ci.com/Azure-Samples/iot-hub-node-raspberrypi-client-app.svg?token=5ZpmkzKtuWLEXMPjmJ6P&branch=master)](https://travis-ci.com/Azure-Samples/iot-hub-node-raspberrypi-client-app)

> This repo contains the source code to help you get familiar with Azure IoT using the Microsoft IoT Pack for Raspberry Pi 3 Starter Kit. You will find the [lesson-based tutorials on Azure.com](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-raspberry-pi-kit-node-get-started).

This repo contains an arduino application that runs on Raspberry Pi 3 with a BME280 temperature&humidity sensor, and then sends these data to your IoT hub. At the same time, this application receives Cloud-to-Device message from your IoT hub, and takes actions according to the C2D command. 

## Set up your Pi
### Enable SSH on your Pi
Follow [this page](https://www.raspberrypi.org/documentation/remote-access/ssh/) to enable SSH on your Pi.

### Enable I2C on your Pi
Follow [this page](https://learn.adafruit.com/adafruits-raspberry-pi-lesson-4-gpio-setup/configuring-i2c#installing-kernel-support-manually) to enable I2C on your Pi

### Install new nodejs new version
Check your nodejs version on your Pi:

```bash
node -v
```

If your nodejs' version is below v4.x, please follow the instruction to install a new version of nodejs

```bash
curl -sL http://deb.nodesource.com/setup_4.x | sudo -E bash
sudo apt-get -y install nodejs
```

## Connect your sensor with your Pi
### Connect with a physical BEM280 sensor and LED
You can follow the image to connect your BME280 and a LED with your Raspberry Pi 3.

![BME280](https://docs.microsoft.com/en-us/azure/iot-hub/media/iot-hub-raspberry-pi-kit-node-get-started/3_raspberry-pi-sensor-connection.png)

### DON'T HAVE A PHYSICAL BME280?
You can use the application to simulate temperature&humidity data and send to your IoT hub.
1. Open the `config.json` file.
2. Change the `simulatedData` value from `false` to `true`.


## Running this sample
### Install package
Install all packages by the following command:

```bash
npm install
```

### Run your client application
Run the client application with root priviledge, and you also need provide your Azure IoT hub device connection string, note your connection should be quoted in the command.

```bash
sudo node index.js '<your Azure IoT hub device connection string>'
```

### Send Cloud-to-Device command
You can send a C2D message to your device. You can see the device prints out the message and blinks once receiving the message.

### Send Device Method command
You can send `start` or `stop` device method command to your Pi to start/stop sending message to your IoT hub.
