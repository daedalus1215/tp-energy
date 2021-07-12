require('dotenv').config();
const util = require('util');
const { Client } = require('tplink-smarthome-api');
const deviceWrite = require('./src/deviceWrite');
const writeLog = require('./src/writeLog');
const childWrite = require('./src/childWrite');

const FIVE_MINUTES = 300000;
const POLL_INTERVAL = FIVE_MINUTES;

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' },
});

const run = async () => {

    // Power Strip combined
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

                deviceWrite(electricityData);
            });

            device.startPolling(POLL_INTERVAL);
        })
        .catch(e => console.log('Issue getting plug, ', e));

    // Power Strip
    client.getDevice({ host: process.env.POWER_STRIP_IP_ADDRESS })
        .then(device => {
            device.children?.forEach(async (child) => {
                const childPlug = await client.getDevice({ host: process.env.POWER_STRIP_IP_ADDRESS, childId: child.id });

                childPlug.on('emeter-realtime-update', (emeterRealtime) => {
                    const stateString = emeterRealtime != null ? util.inspect(emeterRealtime) : undefined;
                    const watts = stateString && getChildPower(stateString);

                    if (watts === undefined) return '';
                    const power = watts.substr(watts.indexOf(':') + 2, watts.length - 1);

                    const electricityData = {
                        time: Date.now(),
                        date: new Date(),
                        name: childPlug.alias,
                        DeviceModel: childPlug.model,
                        DeviceHost: childPlug.host,
                        idx: childPlug.childId,
                        watts: power,
                    };

                    childWrite(electricityData);
                });

                childPlug.startPolling(POLL_INTERVAL);
            })
        })
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