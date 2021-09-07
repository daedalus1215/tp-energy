const { Client } = require('tplink-smarthome-api');

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' }
});

const getClient = () => client;

module.exports = getClient;


