'use strict';

const bull = require('./bull');
const assert = require('assert');
const listener = require('./listener');
const { merge } = require('lodash');

module.exports = app => {
  const config = app.config.ebus;
  const ctx = app.createAnonymousContext();

  const { events, listeners } = listener.load(app, config);
  // console.log(listeners);
  // console.log(events);
  //  listener 的队列
  const queues = Object.create(null);
  Array.from(
    new Set([
      config.queue.default,
      ...listeners.map(_ => _.queue)
    ])
  ).forEach(queue => {
    const originalName = queue.replace(config.queue.prefix + ':', '');

    const options = merge({}, config.redis, config.queue, config.queues.worker, config.queues[originalName]);
    const { mqueue, queueEvents, mworker } = bull.create(app, queue, options);
    queues[queue] = mqueue;
  });

  //发送队列
  const emit = (name, payload, options) => {

    const listeners = events[name];
    if (!listeners) {
      if (config.debug) {
        app.coreLogger.warn(`[egg-ebus] event ${name} has no listeners.`);
      }

      return;
    }

    for (const listener of listeners) {
      //removeOnComplete: 1000 
      /**
       *  removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    }
   
    {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  }
       */
      const defaultOpt = config.listener.options;

      let conf = merge(
        { removeOnComplete: true, removeOnFail: true },
        defaultOpt,
        { removeOnComplete: true, removeOnFail: 500, maxLenEvents: 8 },
        { attempts: typeof listener.attempts === 'number' ? listener.attempts : config.listener.options.attempts },
        options
        , {
          settings: {
            stalledInterval: 2 * 60 * 1000, // 2 分钟
            maxStalledCount: 0
          }
        }

      );
      config.debug &&
        app.logger.info(
          `[egg-ebus:event] ${name}: ${listener.name} use (${listener.queue})`
        );
      queues[listener.queue].add(name, {
        type: 'event',
        file: listener.name,
        attempts: conf.attempts,
        name,
        payload,
      }, conf);
    }
  };
  const cleanOn = (name, state) => {
    //Removes jobs in a specific state, but keeps jobs within a certain grace period.
    const listeners = events[name];
    if (!listeners) {
      if (config.debug) {
        app.coreLogger.warn(`[egg-ebus] event ${name} has no listeners.`);
      }

      return;
    }

    for (const listener of listeners) {
      config.debug &&
        app.logger.info(
          `[egg-ebus:event  clear all] ${name}: ${listener.name} use (${listener.queue})`
        );
      queues[listener.queue].clean(
        6000, // 1 minute
        1000, // max number of jobs to clean
        state);
    }
  }
  const delAll = (name) => {
    //Completely obliterates a queue and all of its contents.
    const listeners = events[name];
    if (!listeners) {
      if (config.debug) {
        app.coreLogger.warn(`[egg-ebus] event ${name} has no listeners.`);
      }

      return;
    }

    for (const listener of listeners) {
      config.debug &&
        app.logger.info(
          `[egg-ebus:event  clear all] ${name}: ${listener.name} use (${listener.queue})`
        );
      queues[listener.queue].obliterate();
    }

  };
  const drain = (name) => {
    //Removes all jobs that are waiting or delayed, but not active, waiting-children, completed or failed.
    const listeners = events[name];
    if (!listeners) {
      if (config.debug) {
        app.coreLogger.warn(`[egg-ebus] event ${name} has no listeners.`);
      }

      return;
    }

    for (const listener of listeners) {
      config.debug &&
        app.logger.info(
          `[egg-ebus:event  clear all] ${name}: ${listener.name} use (${listener.queue})`
        );
      queues[listener.queue].drain();
    }

  };


  const get = name => queues[`${config.queue.prefix}:${name}`];
  // process.on("unhandledRejection", (reason, promise) => {
  //   // Handle the error safely
  //   app.logger.error({ promise, reason }, "Unhandled Rejection at: Promise");
  // });
  // process.on("uncaughtException", function (err) {
  //   // Handle the error safely
  //   app.logger.error(err, "Uncaught exception");
  // });
  app.ebus = { listeners, queueEvents, mworker, events, queues, get, emit, cleanOn, delAll, drain };
};
