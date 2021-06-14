require('dotenv').config();
const util = require('util');
const fs = require('fs');
const { Client } = require('tplink-smarthome-api')

const FIVE_MINUTES = 300000;

const POLL_INTERVAL = FIVE_MINUTES;

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' },
});

const run = async () => {
    const device = await client.getDevice({ host: process.env.POWER_STRIP_IP_ADDRESS });
    console.log('power strip alias: ', device.alias);

    await Promise.all(
        device.children.forEach(async (child) => {
            const childPlug = await client.getDevice({ host: process.env.POWER_STRIP_IP_ADDRESS, childId: child.id });

            childPlug.on('emeter-realtime-update', (emeterRealtime) => {
                logEvent('emeter-realtime-update', childPlug, emeterRealtime, child.alias);
            });

            childPlug.startPolling(POLL_INTERVAL);
        })
    ).catch(e => console.log('Issue getting energy from children of power strip, ', e));
};

const logEvent = function logEvent(eventName, device, state, alias) {
    const stateString = state != null ? util.inspect(state) : '';

    const watts = getPower(stateString)

    if (watts !== '' && alias !== "aliasDummy") {
        console.log(`
                time: ${Date.now()}
                date: ${new Date()}
                Name: ${alias}
                eventName: ${eventName} 
                DeviceModel: ${device.model} 
                DeviceHost: ${device.host}:
                DeviceChildId: ${device.childId} 
                ${watts}
            `);

        const power = watts.substr(watts.indexOf(':') + 2, watts.length - 1);

        writeLog(`${process.env.FILE_PATH}${device.childId}.json`, {
            time: Date.now(),
            date: new Date(),
            Name: alias,
            eventName: eventName,
            DeviceModel: device.model,
            DeviceHost: device.host,
            DeviceChildId: device.childId,
            watts: power
        })
    }
};

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
const getPower = (stateString) => {
    const everythingFromPowerToEnd = stateString.substr(stateString.indexOf('power:'), stateString.length - 1);
    const endOfPowerSection = everythingFromPowerToEnd.indexOf(',');
    return everythingFromPowerToEnd.substr(0, endOfPowerSection);
}

const writeLog = (filePath, log) => {
    try {
        fs.appendFileSync(filePath, JSON.stringify(log) + ",");
    }
    catch (err) {
        console.warn('Error writing log for ' + device.alias + ' [' + device.deviceId + ']', err);
    }
}


// setInterval(log, POLL_INTERVAL);
run();