/* eslint-disable no-param-reassign */
const handaler = {};
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandaler } = require('../handalers/routerHandalers/notFoundHandaler');
const { parseJSON } = require('./utilities');

handaler.handaleReqRes = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headerObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headerObject,
    };

    const decoder = new StringDecoder('utf8');
    let realData = '';

    const chossenHandeler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandaler;

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });
    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = parseJSON(realData);
        chossenHandeler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);
            console.log(payloadString);
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
};

module.exports = handaler;
