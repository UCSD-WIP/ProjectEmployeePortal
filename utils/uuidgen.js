const uuid = require('uuid/v4');

// function that returns a UUID string based on timestamp
function GenerateUUID() {
    return uuid();
}
module.exports = {
    GenerateUUID
};