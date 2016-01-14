'use strict'

let assert  = require('assert');
let path    = require('path');

process.env.SERVER_NAME = 'DEFAULT SERVER';

let FileConfig = require('../lib/fileconfig');
let TestConfig = new FileConfig(path.resolve(__dirname, 'config'));

describe('fileconfig-json', () => {
    it('should return data in jsonTest.json', () => {
        assert.equal(8080, TestConfig.servers.jsonTest.port);
        assert.equal(8080, TestConfig['servers/jsonTest/port']);
    });
    it('should resolve environment variables', () => {
        assert.equal(process.env.SERVER_NAME, TestConfig.servers.jsonTest.name);
    });
    it('should return an immutable copy of component["@value"]', () => {
        let server = TestConfig.servers.jsonTest['@value'];
        assert.equal(8080, server.port);
        assert.throws(() => {
            server.port = 9090;
        }, TypeError);
        assert.equal(8080, server.port);
        assert.equal(8080, TestConfig.servers.jsonTest.port);
    });
    it('should be read only', () => {
       let server = TestConfig.servers.jsonTest;
        server.port = 9090;
        assert.equal(8080, server.port);
    });
    it('should return component @path property', () => {
        let server = TestConfig.servers.jsonTest;
        let cpath  = path.resolve(__dirname, 'config/servers/jsonTest.json');
        assert.equal(cpath, server['@path']);
    });
});

describe('fileconfig-yml', () => {
    it('should return data in ymlTest.yml', () => {
        assert.equal(9090, TestConfig.servers.ymlTest.port);
        assert.equal(9090, TestConfig['servers/ymlTest/port']);
    });
    it('should resolve environment variables', () => {
        assert.equal(process.env.SERVER_NAME, TestConfig.servers.ymlTest.name);
    });
    it('should return an immutable copy of component["@value"]', () => {
        let server = TestConfig.servers.ymlTest['@value'];
        assert.equal(9090, server.port);
        assert.throws(() => {
            server.port = 8080;
        }, TypeError);
        assert.equal(9090, server.port);
        assert.equal(9090, TestConfig.servers.ymlTest.port);
    });
    it('should be read only', () => {
        let server = TestConfig.servers.ymlTest;
        server.port = 8080;
        assert.equal(9090, server.port);
    });
    it('should return component @path property', () => {
        let server = TestConfig.servers.ymlTest;
        let cpath  = path.resolve(__dirname, 'config/servers/ymlTest.yml');
        assert.equal(cpath, server['@path']);
    });
});

describe('fileconfig-dir', () => {
    it('should return component @path property', () => {
        let servers = TestConfig.servers;
        let cpath   = path.resolve(__dirname, 'config/servers');
        assert.equal(cpath, servers['@path']);
    });
    it('should not return an immutable copy of component["@value"] if component is directory', () => {
        let servers = TestConfig.servers['@value'];
        let lazyServer = servers.lazyServer;
        assert.equal(7070, lazyServer.port);
    });
});
