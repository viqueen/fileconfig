import assert from "assert";
import path from "path";

process.env.SERVER_NAME = "DEFAULT SERVER";
process.env.NODE_FILECONFIG_DIR = path.resolve(__dirname, "config");

import { ComponentNotFound, InvalidComponentDefinition } from "../src/errors";
import FileConfig from "../src/fileconfig";

const testConfig = FileConfig.global();

describe("fileconfig-json", () => {
  it("should return data in jsonTest.json", () => {
    assert.equal(8080, testConfig.servers.jsonTest.port);
    assert.equal(8080, testConfig["servers/jsonTest/port"]);
  });
  it("should resolve environment variables", () => {
    assert.equal(process.env.SERVER_NAME, testConfig.servers.jsonTest.name);
  });
  it('should return an immutable copy of component["@value"]', () => {
    let server = testConfig.servers.jsonTest["@value"];
    assert.equal(8080, server.port);
    assert.throws(() => {
      server.port = 9090;
    }, TypeError);
    assert.equal(8080, server.port);
    assert.equal(8080, testConfig.servers.jsonTest.port);
  });
  it("should be read only", () => {
    let server = testConfig.servers.jsonTest;
    server.port = 9090;
    assert.equal(8080, server.port);
  });
  it("should return component @path property", () => {
    let server = testConfig.servers.jsonTest;
    let cpath = path.resolve(__dirname, "config/servers/jsonTest.json");
    assert.equal(cpath, server["@path"]);
  });
});

describe("fileconfig-yml", () => {
  it("should return data in ymlTest.yml", () => {
    assert.equal(9090, testConfig.servers.ymlTest.port);
    assert.equal(9090, testConfig["servers/ymlTest/port"]);
  });
  it("should resolve environment variables", () => {
    assert.equal(process.env.SERVER_NAME, testConfig.servers.ymlTest.name);
  });
  it('should return an immutable copy of component["@value"]', () => {
    let server = testConfig.servers.ymlTest["@value"];
    assert.equal(9090, server.port);
    assert.throws(() => {
      server.port = 8080;
    }, TypeError);
    assert.equal(9090, server.port);
    assert.equal(9090, testConfig.servers.ymlTest.port);
  });
  it("should be read only", () => {
    let server = testConfig.servers.ymlTest;
    server.port = 8080;
    assert.equal(9090, server.port);
  });
  it("should return component @path property", () => {
    let server = testConfig.servers.ymlTest;
    let cpath = path.resolve(__dirname, "config/servers/ymlTest.yml");
    assert.equal(cpath, server["@path"]);
  });
});

describe("fileconfig-dir", () => {
  it("should return component @path property", () => {
    let servers = testConfig.servers;
    let cpath = path.resolve(__dirname, "config/servers");
    assert.equal(cpath, servers["@path"]);
  });
  it('should not return an immutable copy of component["@value"] if component is directory', () => {
    let servers = testConfig.servers["@value"];
    let lazyServer = servers.lazyServer;
    assert.equal(7070, lazyServer.port);
  });
});

describe("fileconfig-errors", () => {
  it("should handle component not found", () => {
    assert.throws(() => {
      let notfound = testConfig.servers.notfound;
    }, ComponentNotFound);
  });
  it("should handle invalid json component definition", () => {
    assert.throws(() => {
      let invalid = testConfig.servers.jsonInvalid;
    }, InvalidComponentDefinition);
  });
});
