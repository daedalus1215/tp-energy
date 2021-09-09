const util = require('util');
const { TOTAL_PLUGS_ON_STRIP } = require('../constants');
const { mailOptions, transporter } = require('../utils/email');
const childWrite = require('../writers/childWrite');
const deviceWrite = require('../writers/deviceWrite');

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

const VIOLATION_LIMIT = 4;
let powerThresholdMin = 1150;
let powerThresholdMax = 1350;
let violationThreshold = VIOLATION_LIMIT;

const powerStrip = (client, host, interval, filePath, isVerbose, isConsoleLogging, isEmailing) => {
    client.getDevice({ host: host })
        .then(device => {
            let summedChildrenPower = 0;
            let childIndex = 0;
            let failures = [];
            const childCount = device?._sysInfo.child_num;

            device.children?.forEach(async (child) => {
                const childPlug = await client.getDevice({ host: host, childId: child.id });

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
                        description: `index: ${childIndex} - ${summedChildrenPower}`
                    };

                    childWrite(electricityData, isConsoleLogging, isVerbose, filePath);

                    // Aggregation Feature
                    childIndex += 1;
                    if (childIndex === childCount) {
                        const data = {
                            id: device?.id,
                            time: Date.now(),
                            date: new Date(),
                            name: `${device?.alias} - power strip`,
                            model: device?.model,
                            host: host,
                            watts: summedChildrenPower,
                            description: 'Parent Strip'
                        };

                        deviceWrite(data, isConsoleLogging, isVerbose);

                        // Keeping track of violations
                        if (summedChildrenPower < powerThresholdMin || summedChildrenPower > powerThresholdMax && violationThreshold !== 0) {
                            violationThreshold -= 1;
                        } else if (violationThreshold < VIOLATION_LIMIT) {
                            violationThreshold += 1;
                        }
                        if (violationThreshold === 0) {
                            isEmailing && transporter.sendMail({ ...mailOptions, text: JSON.stringify(data) });
                            console.log('ERROR!!!')
                        }

                        isVerbose && console.log('violationThreshold', violationThreshold)
                        // Resetting the running tallies
                        summedChildrenPower = 0;
                        childIndex = 0;
                    }
                });

                childPlug.startPolling(interval);
            });
        })
        .catch(e => {
            deviceWrite({
                id: 'error in power strip',
                time: Date.now(),
                date: new Date(),
                name: `Error - power strip`,
                model: 'model',
                host: host,
                watts: false,
                description: 'issue with connecting to a child or power strip itself.'
            },
                isConsoleLogging,
                filePath);
        });
}


module.exports = powerStrip;