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
  resolve(filepath) {
    let data;
    try {
      data = this.reader(filepath);
    } catch (error) {
      throw new InvalidComponentDefinition(filepath);
    }
    return {
      path: filepath,
      value: Vars.resolve(data),
      leaf: true
    };
  }
}

class JsonResolver extends FileResolver {
  constructor() {
    super(".json", filepath => jsonFile.readFileSync(filepath));
  }
}

class YamlResolver extends FileResolver {
  constructor() {
    super(".yml", filepath => yamlJs.load(filepath));
  }
}

class DirectoryResolver {
  supports(filepath) {
    return fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory()
      ? filepath
      : undefined;
  }

  resolve(filepath) {
    return {
      path: filepath,
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

  resolve(filepath) {
    let supported = this.delegates
      .map(resolver => {
        return {
          instance: resolver,
          target: resolver.supports(filepath)
        };
      })
      .find(s => s.target !== undefined);

    if (!supported) {
      throw new ComponentNotFound(filepath);
    }
    return supported.instance.resolve(supported.target);
  }
}

export default new Resolver();
