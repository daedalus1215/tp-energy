const writeLog = require("./writeLog");
/**
 * 
 * @param {Object} electricityData: {
                        time: Date.now(),
                        date: new Date(),
                        name: childPlug.alias,
                        DeviceModel: childPlug.model,
                        DeviceHost: childPlug.host,
                        id: childPlug.childId,
                        watts: power,
                    }
 * @param {boolean} consoleLogging 
 */
module.exports = (electricityData, consoleLogging = true, isVerbose = false, filePath = process.env.FILE_PATH) => {
    const { id, watts, time, name } = electricityData;
    const data = isVerbose ? electricityData : { watts, time };
    consoleLogging && console.log('childwrite - ', data);
    writeLog(`${filePath}${id} - ${name}.json`, data);
};