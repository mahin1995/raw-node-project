const handler = {};

handler.sampleHandaler = (requestProperties, callback) => {
    callback(200, { message: 'this is sample heade' });
};
module.exports = handler;
