require('dotenv').config();
const writeLog = require("./writeLog");

/**
 * 
 * @param {Object} data : {
            id,
            time,
            date,
            name,
            name,
            model,
            host,
            watts
        }
 * @param {boolean} consoleLogging
 */
module.exports = (data, consoleLogging = true, isVerbose = false, filePath = process.env.FILE_PATH) => {
    const { name, id, watts, time } = data;
    consoleLogging && console.log('deviceWrite', isVerbose ? data : { watts, time });
    !isVerbose && writeLog(`${filePath}${id} - ${name}.json`, isVerbose ? data : { watts, time });
}
