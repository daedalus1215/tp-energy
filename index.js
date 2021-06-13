require('dotenv').config();
const util = require('util');
const fs = require('fs');
const { Client } = require('tplink-smarthome-api')

const POLL_INTERVAL = 10000;

const logPlugs = () => {

    const client = new Client({
        defaultSendOptions: { timeout: 20000, transport: 'tcp' },
    });

    const logEvent = function logEvent(eventName, device, state, alias = "dummy", status) {
        const stateString = state != null ? util.inspect(state) : '';
        const watts = getPower(stateString)
        if (status === 'in-use-update' || status === 'power-update') {
            //
        }

        (watts) && console.log(`
            time: ${new Date().toISOString()} 
            Name: ${alias}
            eventName: ${eventName} 
            DeviceModel: ${device.model} 
            DeviceHost: ${device.host}:
            DevicePort: ${device.port} 
            DeviceChildId: ${device.childId} 
            ${getPower(stateString)}
            status: ${status}
            `);
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

    const monitorEvents = function monitorEvents(device, alias) {
        // Device (Common) Events
        device.on('emeter-realtime-update', (emeterRealtime) => {
            logEvent('emeter-realtime-update', device, emeterRealtime, alias);
        });

        // Plug Events
        device.on('power-on', () => {
            logEvent('power-on', device);
        });
        device.on('power-off', () => {
            logEvent('power-off', device);
        });
        device.on('power-update', (powerOn) => {
            logEvent('power-update', device, powerOn, alias, 'power-update');
        });
        device.on('in-use', () => {
            logEvent('in-use', device);
        });
        device.on('not-in-use', () => {
            logEvent('not-in-use', device);
        });
        device.on('in-use-update', (inUse) => {
            logEvent('in-use-update', device, inUse, alias, 'in-use-update');
        });

        device.startPolling(POLL_INTERVAL);
    };

    (async () => {
        const device = await client.getDevice({ host: process.env.HOST_ADDRESS });

        console.log(device.alias);

        if (!device.children) {
            console.log('device has no children');
            return;
        }

        device.children.forEach((child) => {
            console.log(child);
        });

        await Promise.all(
            device.children.forEach(async (child) => {
                // console.log('child:', child)
                const childPlug = await client.getDevice({ host: process.env.HOST_ADDRESS, childId: child.id });
                // childPlug.alias = child.alias;
                monitorEvents(childPlug, child.alias);
            })
        );

        monitorEvents(device);
    })();
}

setInterval(logPlugs, POLL_INTERVAL);
// logPlugs();