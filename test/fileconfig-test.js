'use strict'

let assert  = require('assert');
let path    = require('path');

process.env.SERVER_NAME = 'DEFAULT SERVER';

let FileConfig = require('../lib/fileconfig');
let TestConfig = new FileConfig(path.resolve(__dirname, 'config'));

describe('fileconfig-json', () => {
    describe('#get', () => {
        it('should return data in jsonTest.json', () => {
            assert.equal(8080, TestConfig.servers.jsonTest.port);
            assert.equal(8080, TestConfig['servers/jsonTest/port']);
        });
        it('should resolve environment variables', () => {
            assert.equal(process.env.SERVER_NAME, TestConfig.servers.jsonTest.name);
        });
    });
});

describe('fileconfig-yml', () => {
    describe('#get', () => {
        it('should return data in ymlTest.yml', () => {
            assert.equal(9090, TestConfig.servers.ymlTest.port);
            assert.equal(9090, TestConfig['servers/ymlTest/port']);
        });
        it('should resolve environment variables', () => {
            assert.equal(process.env.SERVER_NAME, TestConfig.servers.ymlTest.name);
        })
    });
});