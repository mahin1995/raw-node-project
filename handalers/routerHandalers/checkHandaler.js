/* eslint-disable no-underscore-dangle */
const handler = {};
const data = require('../../lib/data');
// const { hash } = require('../../helpers/utilities');
const { parseJSON, creteRendomString } = require('../../helpers/utilities');
const tokenHandaler = require('./tokenHandaler');
const { maxChecks } = require('../../helpers/environment');

handler.checkHandaler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};
handler._check = {};
handler._check.post = (requestProperties, callback) => {
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;
    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;
    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;
    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;
    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;
    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token =
            typeof requestProperties.headerObject.token === 'string'
                ? requestProperties.headerObject.token
                : false;

        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        tokenHandaler._token.verify(token, userPhone, (tokenisValid) => {
                            if (tokenisValid) {
                                const userObject = parseJSON(userData);
                                const userCheck =
                                    typeof userObject.checks === 'object' &&
                                    userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];
                                console.log(userCheck);
                                if (userCheck > maxChecks || userCheck[0] === undefined) {
                                    const checkId = creteRendomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    data.create('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            userObject.checks = userCheck;
                                            userObject.checks.push(checkId);
                                            data.update('users', userPhone, userObject, (err4) => {
                                                if (!err4) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a problem in the server side on checks',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a problem in the server side on check create',
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'user already maxcheck limitid',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication problem with token!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request.',
        });
    }
};
handler._check.get = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headerObject.token === 'string'
                        ? requestProperties.headerObject.token
                        : false;
                data.read('tokens', token, (err1, tokenData) => {
                    if (!err1 && tokenData) {
                        const userPhone = parseJSON(tokenData).phone;
                        data.read('users', userPhone, (err2, userData) => {
                            if (!err2 && userData) {
                                tokenHandaler._token.verify(token, userPhone, (tokenisValid) => {
                                    if (tokenisValid) {
                                        callback(200, parseJSON(checkData));
                                    } else {
                                        callback(403, {
                                            error: 'Authentication problem!',
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication problem with token!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'you have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};
handler._check.put = (requestProperties, callback) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;
    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;
    const method =
        typeof requestProperties.body.method === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;
    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;
    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
        requestProperties.body.timeoutSeconds % 1 === 0 &&
        requestProperties.body.timeoutSeconds >= 1 &&
        requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;
    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token =
                        typeof requestProperties.headerObject.token === 'string'
                            ? requestProperties.headerObject.token
                            : false;
                    tokenHandaler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            data.update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    callback(200);
                                } else {
                                    callback(403, {
                                        error: 'There was a server side error',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Token verification Error',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'there is problem in server request',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'you must provide at least on field to update',
            });
        }
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};
handler._check.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headerObject.token === 'string'
                        ? requestProperties.headerObject.token
                        : false;
                data.read('tokens', token, (err1, tokenData) => {
                    if (!err1 && tokenData) {
                        const userPhone = parseJSON(tokenData).phone;
                        data.read('users', userPhone, (err2, userData) => {
                            if (!err2 && userData) {
                                tokenHandaler._token.verify(token, userPhone, (tokenisValid) => {
                                    if (tokenisValid) {
                                        data.delete('checks', id, (err3) => {
                                            if (!err3) {
                                                data.read(
                                                    'users',
                                                    parseJSON(checkData).userPhone,
                                                    (err4, userDatas) => {
                                                        const userObject = parseJSON(userDatas);
                                                        if (!err4 && userDatas) {
                                                            const userCheck =
                                                                typeof userObject.checks ===
                                                                    'object' &&
                                                                userObject.checks instanceof Array
                                                                    ? userObject.checks
                                                                    : [];
                                                            const checkPostion =
                                                                userCheck.indexOf(id);
                                                            if (checkPostion > -1) {
                                                                userCheck.splice(checkPostion, 1);
                                                                userObject.checks = userCheck;
                                                                data.update(
                                                                    'users',
                                                                    userObject.phone,
                                                                    userObject,
                                                                    (err5) => {
                                                                        if (!err5) {
                                                                            callback(200);
                                                                        } else {
                                                                            callback(500, {
                                                                                error: 'There was a server side problem ',
                                                                            });
                                                                        }
                                                                    }
                                                                );
                                                            } else {
                                                                callback(500, {
                                                                    error: 'the check id that you want to remove not found',
                                                                });
                                                            }
                                                        } else {
                                                            callback(500, {
                                                                error: 'There was a server side problem ',
                                                            });
                                                        }
                                                    }
                                                );
                                            } else {
                                                callback(500, {
                                                    error: 'There was a server side problem ',
                                                });
                                            }
                                        });
                                    } else {
                                        callback(403, {
                                            error: 'Authentication problem!',
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authentication problem with token!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'you have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'you have a problem in your request',
        });
    }
};

module.exports = handler;
