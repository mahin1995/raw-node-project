const handaler = {};
handaler.notFoundHandaler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your requested url not found',
    });
};

module.exports = handaler;
