require('dotenv').config();
const writeLog = require("./writeLog");

/**
 * 
 * @param {Object} data : {
    id: string,
    time: number,
    date: Date,
    name: string,
    model: string,
    host: string,
    watts: number
 * }
 */
module.exports = (data) => {
    const { time, date, name, id, model, host, watts } = data;

    console.log(
        'deviceWrite',
        {
            id,
            time,
            date,
            name,
            name,
            model,
            host,
            watts
        });

    writeLog(`${process.env.FILE_PATH}${id} - ${name}.json`);
}
