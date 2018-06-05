const uuidv1 = require('uuid/v1');

module.export = {
    // function that returns a UUID string based on timestamp
    GenerateUUID: function () {
        return uuidv1();
    }
};