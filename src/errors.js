export class ComponentNotFound extends Error {
  constructor(path) {
    // noinspection JSCheckFunctionSignatures
    super("component not found : " + path);
  }
}

export class InvalidComponentDefinition extends Error {
  constructor(path) {
    // noinspection JSCheckFunctionSignatures
    super("invalid component definition : " + path);
  }
}
