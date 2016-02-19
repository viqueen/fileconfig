'use strict'

class ComponentNotFound extends Error {
    constructor(path) {
        super('component not found : ' + path);
    }
}

class InvalidComponentDefinition extends Error {
    constructor(path) {
        super('invalid component definition : ' + path);
    }
}

exports.ComponentNotFound = ComponentNotFound;
exports.InvalidComponentDefinition = InvalidComponentDefinition;