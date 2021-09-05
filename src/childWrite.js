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
module.exports = (electricityData, consoleLogging = true) => {
    consoleLogging && console.log('new - deviceWrite', electricityData);
    writeLog(`${process.env.FILE_PATH}${electricityData.id} - ${electricityData.name}.json`, electricityData);
};