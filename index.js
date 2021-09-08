require('dotenv').config();
const { Client } = require('tplink-smarthome-api');
const deviceWrite = require('./src/writers/deviceWrite');
const powerStrip = require('./src/plugs/powerStrip');
const laptopPlug = require('./src/plugs/laptopPlug');
const { POLL_INTERVAL, IS_CONSOLE_LOGGING } = require('./src/constants');

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' },
});

const run = async () => {

    // Laptop
    laptopPlug(client, process.env.LAPTOP_POWER)

    // Baggins
    client.getDevice({ host: process.env.BAGGINS_POWER })
        .then(device => {
            device.on('emeter-realtime-update', (emeterRealtime) => {
                const electricityData = {
                    id: device.id,
                    time: Date.now(),
                    date: new Date(),
                    name: `${device.alias} - 2 Mining Rigs`,
                    model: device.model,
                    host: process.env.BAGGINS_POWER,
                    watts: emeterRealtime.power
                };

                deviceWrite(electricityData, IS_CONSOLE_LOGGING);
            });

            device.startPolling(POLL_INTERVAL);
        })
        .catch(e => {
            const electricityData = {
                id: device?.id,
                time: Date.now(),
                date: new Date(),
                name: `${device?.alias} - 2 Mining Rigs`,
                model: device?.model,
                host: process.env.BAGGINS_POWER,
                watts: false,
                description: 'issue with connecting to Baggins'
            };

            deviceWrite(electricityData, IS_CONSOLE_LOGGING);
        });

    // Power Strip
    powerStrip(client, process.env.POWER_STRIP_IP_ADDRESS)

}


run();