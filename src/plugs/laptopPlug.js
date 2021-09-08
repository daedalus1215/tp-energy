const deviceWrite = require('../writers/deviceWrite');

const laptopPlug = (client, host, interval, filePath, isVerbose, isConsoleLogging) => {
    client.getDevice({ host })
        .then(device => {

            device.on('emeter-realtime-update', (emeterRealtime) => {
                deviceWrite(
                    {
                        id: device.deviceId,
                        time: Date.now(),
                        date: new Date(),
                        name: `${device.alias} - Laptop`,
                        model: device.model,
                        host,
                        watts: emeterRealtime.power
                    },
                    isConsoleLogging,
                    isVerbose,
                    filePath
                );
            });

            device.startPolling(interval);
        })
        .catch(e => {
            deviceWrite(
                {
                    id: 'no device id',
                    time: Date.now(),
                    date: new Date(),
                    name: `Error - ${device?.alias} - laptop`,
                    model: device?.model,
                    host,
                    watts: false,
                    description: 'issue with connecting to laptop'
                },
                isConsoleLogging,
                isVerbose,
                filePath
            );
        });
}

module.exports = laptopPlug;