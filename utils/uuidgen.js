const uuid = require('uuid/v4');
const _ = require('underscore');

// store uuids here
uuidList = new Set([]);

/** function that returns a UUID string based on timestamp */
function GenerateUUID() {
    return uuid();
}

/** function used to add uuidString to the list
 * @param {string} uuidString uuid string to be stored in the list
*/
function addUUIDToList(uuidString){
    uuidList.add(uuidString);
}

/** function used to remove uuidString to the list
 * @param {string} uuidString uuid string to be removed from the list
*/
function removeUUIDFromList(uuidString){
    uuidList.delete(uuidString);
}

/** function that checks if uuid is in list or not
 * @param {string} uuidString uuid string to be check if it is in the list
 * @returns {boolean} true if uuid is in list, false otherwise
*/
function containsInUUIDList(uuidString){
    return uuidList.has(uuidString);
}

module.exports = {
    GenerateUUID, addUUIDToList, removeUUIDFromList, containsInUUIDList
};