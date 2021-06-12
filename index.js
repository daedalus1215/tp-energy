const util = require('util');
const { Client } = require('tplink-smarthome-api')

const client = new Client({
    defaultSendOptions: { timeout: 20000, transport: 'tcp' },
});

const logEvent = function logEvent(eventName, device, state, alias = "dummy") {
    const stateString = state != null ? util.inspect(state) : '';
    console.log(
        `time: ${new Date().toISOString()} 
     Name: ${alias}
     eventName: ${eventName} 
     DeviceModel: ${device.model} 
     DeviceHost: ${device.host}:
     DevicePort: ${device.port} 
     DeviceChildId: ${device.childId} 
     StateString: ${stateString}`
    );
};

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
        logEvent('power-update', device, powerOn, alias);
    });
    device.on('in-use', () => {
        logEvent('in-use', device);
    });
    device.on('not-in-use', () => {
        logEvent('not-in-use', device);
    });
    device.on('in-use-update', (inUse) => {
        logEvent('in-use-update', device, inUse, alias);
    });

    device.startPolling(5000);
};

(async () => {
    const device = await client.getDevice({ host: '192.168.1.156' });

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
            const childPlug = await client.getDevice({ host: '192.168.1.156', childId: child.id });
            // childPlug.alias = child.alias;
            monitorEvents(childPlug, child.alias);
        })
    );

    monitorEvents(device);
})();
