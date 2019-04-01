/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2017 - Licensed MIT
*/
'use strict';

const SHT31 = require('sht31');

function Sensor(opts) {
	this.sht31 = new SHT31(0x44, 1);
}

Sensor.prototype.init = function (callback) {
  this.sht31.init()
    .then(callback)
    .catch((err) => {
      console.error(err);
    });
}

Sensor.prototype.read = function (callback) {
  this.sht31.readSensorData()
    .then((data) => {
	  data.temperature = parseInt(data.temperature);
	  data.humidity = parseInt(data.humidity);
      callback(null, data);
    })
    .catch(callback);
}

module.exports = Sensor;
