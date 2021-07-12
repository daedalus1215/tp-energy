const writeLog = require("./writeLog");

module.exports = (electricityData) => {
    console.log('logEvent', electricityData);

    writeLog(`${process.env.FILE_PATH}${electricityData.id} - ${electricityData.name}.json`, electricityData);
};