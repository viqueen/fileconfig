'use strict'

class ComponentNotFound extends Error {
    constructor(path) {
        super('component not found : ' + path);
    }
}

exports.ComponentNotFound = ComponentNotFound;