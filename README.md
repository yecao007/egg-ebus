# egg-ebus

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bullMq-egg.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bullMq-egg
[travis-image]: https://img.shields.io/travis/eggjs/egg-bullMq-egg.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-bullMq-egg
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-bullMq-egg.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-bullMq-egg?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-bullMq-egg.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bullMq-egg
[snyk-image]: https://snyk.io/test/npm/egg-bullMq-egg/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bullMq-egg
[download-image]: https://img.shields.io/npm/dm/egg-bullMq-egg.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bullMq-egg

<!--
Description here.
-->

## Install

```bash
$ npm i egg-ebus --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.ebus = {
  enable: true,
  package: 'egg-ebus',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.ebus = {
};
例如
exports.ebus = {
    app: true,
    agent: true,
    debug: true,
    concurrency: 2,
    listener: {
      baseDir: 'events',
      options: {
        attempts: 5,
        backoff: {
          delay: 1000,
          type: 'fixed',
        },
      },
    },
    limiter: {
      max: 10,
      duration: 1000
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: "",
      db: 0,
    },
    queue: {
      default: 'default_bus', // 默认队列名称
      prefix: 'ebus', // 队列前缀
    },
    queues: {
      worker: {
        concurrency: 2,
      },
    },
  }
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->
get 获取队列
emit 添加队列  
例如
 const point = await this.app.ebus.emit("order_action", { ord_no: 123 }, { delay: 1000, removeOnComplete: true, removeOnFail: true });此用例用于发送延时队列

cleanOn （Removes jobs in a specific state, but keeps jobs within a certain grace period） 
 delAll  （Completely obliterates a queue and all of its contents.）
 drain （Removes all jobs that are waiting or delayed, but not active, waiting-children, completed or failed.）

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
