require('dotenv').config();
const { Client } = require('tplink-smarthome-api');
const deviceWrite = require('./src/writers/deviceWrite');
const powerStrip = require('./src/plugs/powerStrip');
const laptopPlug = require('./src/plugs/laptopPlug');
const { VERBOSE, IS_CONSOLE_LOGGING, INTERVAL } = require('./src/constants');

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' },
});

const run = async () => {
    const {
        POWER_STRIP_IP_ADDRESS,
        FILE_PATH,
        BAGGINS_POWER,
        LAPTOP_POWER,
    } = process.env;

    // Laptop
    laptopPlug(client, LAPTOP_POWER, INTERVAL, FILE_PATH, VERBOSE, IS_CONSOLE_LOGGING)

    // Baggins
    client.getDevice({ host: BAGGINS_POWER })
        .then(device => {
            device.on('emeter-realtime-update', (emeterRealtime) => {
                deviceWrite(
                    {
                        id: device.id,
                        time: Date.now(),
                        date: new Date(),
                        name: `${device.alias} - 2 Mining Rigs`,
                        model: device.model,
                        host: BAGGINS_POWER,
                        watts: emeterRealtime.power
                    },
                    IS_CONSOLE_LOGGING,
                    VERBOSE
                );
            });
            device.startPolling(INTERVAL);
        })
        .catch(e => {
            deviceWrite(
                {
                    id: 'no device id because of an error',
                    time: Date.now(),
                    date: new Date(),
                    name: `${device?.alias} - 2 Mining Rigs`,
                    model: device?.model,
                    host: BAGGINS_POWER,
                    watts: false,
                    description: 'Issue with connecting to Baggins'
                },
                IS_CONSOLE_LOGGING,
                VERBOSE
            );
        });

    // Power Strip
    powerStrip(client, POWER_STRIP_IP_ADDRESS, INTERVAL, FILE_PATH, VERBOSE, IS_CONSOLE_LOGGING)
}


run();