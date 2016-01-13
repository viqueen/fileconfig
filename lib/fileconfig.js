'use strict'

let Reflect     = require('harmony-reflect');
let Path        = require('path');
let _           = require('underscore');

let Resolver    = require('./resolver');

class Component {
    constructor(path) {
        this.definition = Resolver.resolve(path);
    }

    lookup(queue) {
        if (queue.length === 0) {
            return this;
        }
        let property = queue.shift();

        if (property === 'inspect') {
            return this;
        }
        if (property.match(/^@path/)) {
            return this.definition.path;
        }
        if (property.match(/^@value$/)) {
            return Object.freeze(_.clone(this.definition.value));
        }
        if (!(property in this.definition.value)) {
            let path = Path.resolve(this.definition.path, property);
            this.definition.value[property] = new FileConfig(path);
        }
        return Component.lookupData(this.definition.value[property], queue);
    }

    static lookupData(data, queue) {
        if (data instanceof FileConfig) {
            return data[queue];
        }
        return Component.lookupObject(data, queue);
    }

    static lookupObject(data, queue) {
        if (queue.length === 0) {
            return data;
        }
        return Component.lookupData(data[queue.shift()], queue);
    }
}

class FileConfig {
    constructor(path) {
        return new Proxy(new Component(path), {
            get : function (component, property) {
                return component.lookup(property.split('/'));
            }
        })
    }
}

module.exports = FileConfig;