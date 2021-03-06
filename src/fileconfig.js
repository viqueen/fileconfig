import path from "path";
import resolver from "./resolver";

class Component {
  constructor(filepath) {
    this.definition = resolver.resolve(filepath);
  }

  lookup(queue) {
    if (queue.length === 0) {
      return this;
    }
    let property = queue.shift();

    if (property === "inspect") {
      return this;
    }
    if (property.match(/^@path/)) {
      return this.definition.path;
    }
    if (property.match(/^@value$/)) {
      return this.definition.leaf === true
        ? Object.freeze(Object.assign({}, this.definition.value, {}))
        : FileConfig.fromComponent(this);
    }
    if (!(property in this.definition.value)) {
      let filepath = path.resolve(this.definition.path, property);
      this.definition.value[property] = new FileConfig(filepath);
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

export default class FileConfig {
  constructor(filepath) {
    return new Proxy(new Component(filepath), FileConfig.handler());
  }

  static fromComponent(component) {
    return new Proxy(component, FileConfig.handler());
  }

  static handler() {
    return {
      get: function(component, property) {
        return component.lookup(property.split("/"));
      }
    };
  }

  static global() {
    return new FileConfig(process.env.NODE_FILECONFIG_DIR);
  }
}
