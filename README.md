# fileconfig (v-3.0.0)

Library for configuration file loading

## install it

```bash
npm install fileconfig -g
```

## use it

assuming you have a configuration folder as follow:

```
+ /path/to/config/folder
    + share
        default.yml -> symlink to dev/alpha.yml
        + qa
        + dev
            alpha.yml
```

with this content

- share/dev/alpha.yml

```yaml
name: "alpha dev share"
port: 9090
dir: ${env.ALPHA_SHARE}
```

then you can fetch data as follow:

```javascript
var FileConfig  = require('fileconfig');
var config      = new FileConfig('/path/to/config/folder');

var defaultServer = config.share.default;
console.log(defaultServer.name);    // out : alpha dev share
console.log(defaultServer.port);    // out : 9090
```

## dev

```
npm run test:watch          # run tests and watch for changes
npm run coverage            # generate coverage reports
npm run lint                # generate lint report
```

## licence

Apache-2.0