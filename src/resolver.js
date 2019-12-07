import path from "path";
import fs from "fs";
import jsonFile from "jsonfile";
import yamlJs from "yamljs";
import { ComponentNotFound, InvalidComponentDefinition } from "./errors";

class Vars {
  static resolveString(str) {
    let matcher = str.match(/\$\{env\..*?}/);
    if (matcher !== null) {
      let ln = matcher[0].length;
      let name = matcher[0].substring(6, ln - 1);
      return Vars.resolveString(str.replace(matcher[0], process.env[name]));
    }
    return str;
  }

  static resolve(object) {
    if (typeof object === "string") {
      return Vars.resolveString(object);
    }
    for (const prop in object) {
      object[prop] = Vars.resolve(object[prop]);
    }
    return object;
  }
}

class FileResolver {
  constructor(extension, reader) {
    this.extension = extension;
    this.reader = reader;
  }
  supports(filename) {
    let filepath =
      path.extname(filename) === this.extension
        ? filename
        : filename + this.extension;
    return fs.existsSync(filepath) ? filepath : undefined;
  }
  resolve(path) {
    let data;
    try {
      data = this.reader(path);
    } catch (error) {
      throw new InvalidComponentDefinition(path);
    }
    return {
      path: path,
      value: Vars.resolve(data),
      leaf: true
    };
  }
}

class JsonResolver extends FileResolver {
  constructor() {
    super(".json", path => jsonFile.readFileSync(path));
  }
}

class YamlResolver extends FileResolver {
  constructor() {
    super(".yml", path => yamlJs.load(path));
  }
}

class DirectoryResolver {
  supports(path) {
    return fs.existsSync(path) && fs.lstatSync(path).isDirectory()
      ? path
      : undefined;
  }

  resolve(path) {
    return {
      path: path,
      value: {},
      leaf: false
    };
  }
}

class Resolver {
  constructor() {
    this.delegates = [
      new DirectoryResolver(),
      new JsonResolver(),
      new YamlResolver()
    ];
  }

  resolve(path) {
    let supported = this.delegates
      .map(resolver => {
        return {
          instance: resolver,
          target: resolver.supports(path)
        };
      })
      .find(supported => supported.target !== undefined);

    if (!supported) {
      throw new ComponentNotFound(path);
    }
    return supported.instance.resolve(supported.target);
  }
}

export default new Resolver();
