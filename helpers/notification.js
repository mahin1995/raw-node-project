const https = require('https');
const queryString = require('querystring');
const { twillo } = require('./environment');

const notification = {};
notification.sendTwiloSms = (phone, msg, callback) => {
    // input validation
    const userPhone =
        typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;
    if (userPhone && userMsg) {
        const payload = {
            From: twillo.fromPhon,
            To: `+880-${userPhone}`,
            Body: userMsg,
        };
        const stringifyPayload = queryString.stringify(payload);
        const requestDetails = {
            hostname: 'https://api.twilio.com',
            method: 'post',
            path: `/2010-04-01/Accounts/${twillo.accountSid}/Messages.json`,
            auth: `${twillo.accountSid}:${twillo.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };
        const req = https.request(requestDetails, (res) => {
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });
        req.on('error', (e) => {
            callback(e);
        });
        req.write(stringifyPayload);
        req.end();
    } else {
        callback('Given paramiter were missing or invalid!');
    }
};

module.exports = notification;
