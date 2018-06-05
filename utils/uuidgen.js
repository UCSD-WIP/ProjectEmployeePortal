const uuidv1 = require('uuid/v1');

// function that returns a UUID string based on timestamp
function GenerateUUID() {
    return uuidv1();
}
module.exports = {
    GenerateUUID
};