const fs = require('fs');
const path = require('path');

const lib = {};
lib.basedir = path.join(__dirname, '../.data');
lib.create = (dir, file, data, callback) => {
    fs.open(`${lib.basedir}/${dir}/${file}.json`, 'wx+', (err, fileDescription) => {
        if (!err && fileDescription) {
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescription, stringData, (err2) => {
                if (!err2) {
                    fs.close(fileDescription, (err3) => {
                        if (!err3) {
                            callback(false);
                        } else {
                            callback('Error closing ');
                        }
                    });
                } else {
                    callback('error', err);
                }
            });
        } else {
            // eslint-disable-next-line no-undef
            callback('Could not create new file, it may already exists! ');
        }
    });
};
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.basedir}/${dir}/${file}.json`, 'utf8', (err, data) => {
        callback(err, data);
    });
};

lib.update = (dir, file, data, callback) => {
    fs.open(`${lib.basedir}/${dir}/${file}.json`, 'r+', (err, fileDescription) => {
        if (!err && fileDescription) {
            const stringData = JSON.stringify(data);
            fs.ftruncate(fileDescription, (err1) => {
                if (!err1) {
                    fs.writeFile(fileDescription, stringData, (err2) => {
                        if (!err2) {
                            fs.close(fileDescription, (err3) => {
                                if (!err3) {
                                    callback(false);
                                } else {
                                    callback('errorr closing file');
                                }
                            });
                        } else {
                            callback('Error Writing the file');
                        }
                    });
                } else {
                    callback('Error trancating file');
                }
            });
        } else {
            console.log(`Error updating , File may not exists`);
        }
    });
};

lib.delete = (dir, file, callback) => {
    fs.unlink(`${lib.basedir}/${dir}/${file}.json`, (err) => {
        if (!err) {
            callback(err);
        } else {
            callback('Error deleting file');
        }
    });
};

lib.list = (dir, callback) => {
    console.log(`${lib.basedir}/${dir}`);
    fs.readFile(`${lib.basedir}/${dir}`, (err, fileName) => {
        if (!err && fileName && fileName.length > 0) {
            const trimFileNames = {};
            fileName.forEach((fileNames) => {
                trimFileNames.push(fileNames.replace('.json', ''));
            });
        } else {
            callback(err);
        }
    });
};

module.exports = lib;
