const uuid = require('uuid/v4');
const _ = require('underscore');

// store uuids here
uuidList = [];

// function that returns a UUID string based on timestamp
function GenerateUUID() {
    return uuid();
}

// function used to add uuidString to the list
function addUUIDToList(uuidString){
    uuidList.push(uuidString);
}

function removeUUIDFromList(uuidString){
    uuidList = _.without(uuidList, [uuidString]);
}

function containsInUUIDList(uuidString){
    return _.contains(uuidList, uuidString);
}

module.exports = {
    GenerateUUID, addUUIDToList, removeUUIDFromList, containsInUUIDList
};