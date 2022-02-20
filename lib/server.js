const http = require('http');
const { handaleReqRes } = require('../helpers/handaleReqRes');
// const environment = require('../helpers/environment');
// const data = require('./lib/data');
// const { sendTwiloSms } = require('../handalers/routerHandalers/notification');

const server = {};

// sendTwiloSms('1620182636', 'Hello bd', (err) => {
//     console.log(`this is an error from:::: ${err}`);
// });

server.config = {
    port: 3000,
};

server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
        console.log(`listen port no ${server.config.port}`);
    });
};
server.handleReqRes = handaleReqRes;

server.init = () => {
    server.createServer();
};

module.exports = server;
