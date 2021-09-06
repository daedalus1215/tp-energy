require('dotenv').config();
const { Client } = require('tplink-smarthome-api');
const util = require('util');
const deviceWrite = require('./src/writers/deviceWrite');
const writeLog = require('./src/writers/writeLog');
const childWrite = require('./src/writers/childWrite');
const { mailOptions, transporter } = require('./utils/email');

const FIVE_MINUTES = 300000;
const POLL_INTERVAL = FIVE_MINUTES;
const isConsoleLogging = true;
const isEmailing = false;

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' },
});

const run = async () => {

    // Laptop
    client.getDevice({ host: process.env.LAPTOP_POWER })
        .then(device => {
            device.on('emeter-realtime-update', (emeterRealtime) => {
                const electricityData = {
                    id: device.deviceId,
                    time: Date.now(),
                    date: new Date(),
                    name: `${device.alias} - Laptop`,
                    model: device.model,
                    host: process.env.LAPTOP_POWER,
                    watts: emeterRealtime.power
                };

                deviceWrite(electricityData, isConsoleLogging);
            });

            device.startPolling(POLL_INTERVAL);
        })
        .catch(e => {
            const electricityData = {
                id: device?.id,
                time: Date.now(),
                date: new Date(),
                name: `${device?.alias} - laptop`,
                model: device?.model,
                host: process.env.LAPTOP_POWER,
                watts: false,
                description: 'issue with connecting to laptop'
            };

            deviceWrite(electricityData, isConsoleLogging);
        });


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

                deviceWrite(electricityData, false);
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

            deviceWrite(electricityData, isConsoleLogging);
        });

    // Power Strip
    client.getDevice({ host: process.env.POWER_STRIP_IP_ADDRESS })
        .then(device => {
            let summedChildrenPower = 0;

            device.children?.forEach(async (child) => {
                const childPlug = await client.getDevice({ host: process.env.POWER_STRIP_IP_ADDRESS, childId: child.id });

                childPlug.on('emeter-realtime-update', (emeterRealtime) => {
                    const stateString = emeterRealtime != null ? util.inspect(emeterRealtime) : undefined;
                    const watts = stateString && getChildPower(stateString);

                    if (watts === undefined) return '';
                    const power = watts.substr(watts.indexOf(':') + 2, watts.length - 1);

                    summedChildrenPower += parseInt(power);

                    const electricityData = {
                        time: Date.now(),
                        date: new Date(),
                        name: childPlug.alias,
                        DeviceModel: childPlug.model,
                        DeviceHost: childPlug.host,
                        id: childPlug.childId,
                        watts: power,
                    };

                    childWrite(electricityData, isConsoleLogging);
                });

                childPlug.startPolling(POLL_INTERVAL);
            });

            //@TODO: To avoid a race condition (for the moment).
            setTimeout(() => {
                deviceWrite({
                    id: device?.id,
                    time: Date.now(),
                    date: new Date(),
                    name: `${device?.alias} - power strip`,
                    model: device?.model,
                    host: process.env.LAPTOP_POWER,
                    watts: summedChildrenPower,
                    description: 'Parent Strip'
                }, isConsoleLogging);
                summedChildrenPower = 0;

                isEmailing && transporter.sendMail(mailOptions)
            }, 10000);
        })
        .catch(e => {
            const electricityData = {
                id: device?.id,
                time: Date.now(),
                date: new Date(),
                name: `${device?.alias} - power strip`,
                model: device?.model,
                host: process.env.LAPTOP_POWER,
                watts: false,
                description: 'issue with connecting to a child or power strip itself.'
            };

            deviceWrite(electricityData, false);
        });

}

/**
 * 
 * @param {Object} stateString {
                    voltage_mv: 111399,
                    current_ma: 1651,
                    power_mw: 183194,
                    total_wh: 9465,
                    err_code: 0,
                    current: 1.651,
                    power: 183.194,
                    total: 9.465,
                    voltage: 111.399 }
 * @returns String: power: 183.194
 */
const getChildPower = (stateString) => {
    const everythingFromPowerToEnd = stateString.substr(stateString.indexOf('power:'), stateString.length - 1);
    const endOfPowerSection = everythingFromPowerToEnd.indexOf(',');
    return everythingFromPowerToEnd.substr(0, endOfPowerSection);
}

run();