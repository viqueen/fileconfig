'use strict'

let FS          = require('fs');
let Path        = require('path');
let JsonFile    = require('jsonfile');
let YamlJS      = require('yamljs');

let ComponentNotFound = require('./errors').ComponentNotFound;

class Vars {

    static resolveString(str) {
        let matcher = str.match(/\$\{env\..*?}/);
        if (matcher !== null) {
            let ln      = matcher[0].length;
            let name    = matcher[0].substring(6, ln - 1);
            return Vars.resolveString(str.replace(matcher[0], process.env[name]));
        }
        return str;
    }

    static resolve (object) {
        if (typeof object === 'string') {
            return Vars.resolveString(object);
        }
        for (var prop in object) {
            object[prop] = Vars.resolve(object[prop]);
        }
        return object;
    }
}

class FileResolver {
    constructor(extension, reader) {
        this.extension  = extension;
        this.reader     = reader;
    }
    supports(path) {
        let filepath = Path.extname(path) === this.extension ? path : path + this.extension;
        return FS.existsSync(filepath) ? filepath : undefined;
    }
    resolve(path) {
        return {
            path    : path
            , value   : Vars.resolve(this.reader(path))
            , leaf  : true
        }
    }
}

class JsonResolver extends FileResolver {
    constructor() {
        super('.json', path => JsonFile.readFileSync(path));
    }
}

class YamlResolver extends FileResolver {
    constructor() {
        super('.yml', path => YamlJS.load(path));
    }
}

class DirectoryResolver {
    supports (path) {
        return FS.existsSync(path) && FS.lstatSync(path).isDirectory() ? path : undefined;
    }

    resolve (path) {
        return {
            path    : path
            , value   : {}
            , leaf  : false
        };
    }
}

class Resolver {
    constructor() {
        this.delegates = [
            new DirectoryResolver()
            , new JsonResolver()
            , new YamlResolver()
        ];
    }

    resolve(path) {
        let supported = this.delegates
                .map(resolver => {
                        return {
                            instance    : resolver,
                            target      : resolver.supports(path)
                        }
                })
                .find(supported => supported.target !== undefined);

        if (!supported) {
            throw new ComponentNotFound(path);
        }
        return supported.instance.resolve(supported.target);
    }
}

module.exports = new Resolver();