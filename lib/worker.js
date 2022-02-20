const worker = {};
const url = require('url');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwiloSms } = require('../helpers/notification');

worker.gatherAllChecks = () => {
    data.list('checks', (err1, checks) => {
        if (!err1 && checks && checks.length > 0) {
            checks.forEach((check) => {
                console.log(check);
                data.read('checks', check, (err2, orginalCheckData) => {
                    if (!err2 && orginalCheckData) {
                        worker.validateCheckData(parseJSON(orginalCheckData));
                    } else {
                        console.log('Error:Reading one of the checks data');
                    }
                });
            });
        } else {
            console.log('Error: could not find any checks to process', err1);
        }
    });
};

worker.validateCheckData = (orginalCheckData) => {
    const orginalData = orginalCheckData;
    if (orginalCheckData && orginalCheckData.id) {
        orginalData.state =
            typeof orginalCheckData.state === 'string' &&
            ['up', 'down'].indexOf(orginalCheckData.state) > -1
                ? orginalCheckData.state
                : 'down';
        orginalData.lastCheckData =
            typeof orginalCheckData.lastCheckData === 'number' && orginalCheckData.lastCheckData > 0
                ? orginalCheckData.lastCheckData
                : false;

        worker.performCheckData(orginalData);
    } else {
        console.log('Error:Check was invalid or not properly formated');
    }
};

worker.performCheckData = (orginalCheckData) => {
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    let outComeSent = false;
    const parsedUrl = url.parse(`${orginalCheckData.protocol}://${orginalCheckData.url}`, true);
    const { hostname } = parsedUrl;
    const { path } = parsedUrl;
    const requestDetails = {
        protocol: `${orginalCheckData.protocol}`,
        hostname,
        method: orginalCheckData.method.toUpperCase(),
        path,
        timeout: orginalCheckData.timeoutSeconds + 1000,
    };
    const protocolToUse = orginalCheckData.protocol === 'http' ? http : https;
    const req = protocolToUse.reuest(requestDetails, (res) => {
        const status = res.statusCode;
        checkOutCome.responseCode = status;
        if (!outComeSent) {
            worker.processCheckOutcome(orginalCheckData, checkOutCome);
            outComeSent = true;
        }
    });
    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        if (!outComeSent) {
            worker.processCheckOutcome(orginalCheckData, checkOutCome);
            outComeSent = true;
        }
    });
    req.on('timeout', (e) => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        if (!outComeSent) {
            worker.processCheckOutcome(orginalCheckData, checkOutCome);
            outComeSent = true;
        }
    });
    req.end();
};

worker.processCheckOutcome = (orginalCheckData, checkOutCome) => {
    const state =
        !checkOutCome.error &&
        checkOutCome.responseCode &&
        orginalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
            ? 'up'
            : 'down';
    const alertWanted = !!(orginalCheckData.lastCheckData && orginalCheckData.state !== state);
    const newCheckData = orginalCheckData;
    newCheckData.state = state;
    newCheckData.lastCheckData = Date.now();
    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (err) {
            if (alertWanted) {
                // send the check data to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no statge change');
            }
        } else {
            console.log('Error: trying to save check data of one of  the checks');
        }
    });
};

worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert : Your check for ${newCheckData.method.toUpperCase()} ${
        newCheckData.protocol
    }://${newCheckData.url} is currently ${newCheckData.state}`;
    sendTwiloSms(newCheckData.userPhone, msg, (err) => {
        if (err) {
            console.log(`user was alerted a status change via sms ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user');
        }
    });
};

worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

worker.init = () => {
    worker.gatherAllChecks();
    worker.loop();
    console.log('workers.');
};
module.exports = worker;
