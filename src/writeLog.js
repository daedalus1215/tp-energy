const fs = require('fs');

/**
 * 
 * @param {String} filePath 
 * @param {Object}} log 
 */
module.exports = (filePath, log) => {
    try {
        fs.appendFileSync(filePath, JSON.stringify(log) + ",");
    }
    catch (err) {
        console.warn('Error writing log for ' + log.name + ' [' + log.id + ']', err);
    }
}