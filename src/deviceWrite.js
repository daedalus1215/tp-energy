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
module.exports = (data, consoleLogging = true) => {
    const { name, id } = data;
    consoleLogging && console.log('new - deviceWrite', data);
    writeLog(`${process.env.FILE_PATH}${id} - ${name}.json`, data);
}
