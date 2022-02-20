const { sampleHandaler } = require('./handalers/routerHandalers/simpleHandaler');
const { userHandaler } = require('./handalers/routerHandalers/userHandaler');
const { tokenHandaler } = require('./handalers/routerHandalers/tokenHandaler');
const { checkHandaler } = require('./handalers/routerHandalers/checkHandaler');

const routes = {
    sample: sampleHandaler,
    user: userHandaler,
    token: tokenHandaler,
    check: checkHandaler,
};
module.exports = routes;
