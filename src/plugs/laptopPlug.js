const { POLL_INTERVAL, IS_CONSOLE_LOGGING } = require("../constants");
const deviceWrite = require('../writers/deviceWrite');

const laptopPlug = (client, host) => {

    client.getDevice({ host:host })
        .then(device => {
            
            device.on('emeter-realtime-update', (emeterRealtime) => {
                console.log('no?')
                deviceWrite({
                    id: device.deviceId,
                    time: Date.now(),
                    date: new Date(),
                    name: `${device.alias} - Laptop`,
                    model: device.model,
                    host,
                    watts: emeterRealtime.power
                }, IS_CONSOLE_LOGGING);
            });
            
            device.startPolling(POLL_INTERVAL);
            console.log('hi', host)
        })
        .catch(e => {
            deviceWrite({
                id: device?.id,
                time: Date.now(),
                date: new Date(),
                name: `Error - ${device?.alias} - laptop`,
                model: device?.model,
                host,
                watts: false,
                description: 'issue with connecting to laptop'
            }, IS_CONSOLE_LOGGING);
        });
}

module.exports = laptopPlug;