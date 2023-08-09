'use strict';

const { Queue, QueueEvents, Worker } = require("bullmq");
const { LISTENER_TARGET } = require('./common');
exports.create = (app, name, config) => {
  const ctx = app.createAnonymousContext();
  if (!config) {
    config = {

    };
  }
  let host = config.host || '127.0.0.1';
  let port = config.port || 6379;
  let password = config.password || "";
  let db = config.db || 0;
  let concurrency = config.concurrency
  if (!name) {
    name = config.default || "ebus";
  }
  const connection = {
    host: host,
    port: port,
    password: password,
    db: db
  }

  const mqueue = new Queue(name, {
    connection: connection
  });
  const queueEvents = new QueueEvents(name, {
    connection: connection, autorun: true
  });
  const mworker = new Worker(name, async (job) => {

    console.log("worker 回调");
    if (job.data.type === 'event') {
      let Listener = app[LISTENER_TARGET];
      job.data.file.split('.').forEach(name => {
        Listener = Listener[name];
      });
      const instance = new Listener(app, ctx);
      if (instance && instance.run) {
        await instance.run(
          {
            name: job.data.name,
            data: job.data.payload,
          },
          job
        );
      }
    }
  }, {
    connection: connection,
    concurrency: concurrency,
    limiter: {
      max: 100,
      duration: 1000,
    }
  });
  mworker.on('failed', async (job, err) => {
    // job has failed 
    if (job.attemptsMade < job.data.attempts) {
      return;
    }

    let Listener = app[LISTENER_TARGET];
    job.data.file.split('.').forEach(name => {
      Listener = Listener[name];
    });
    const instance = new Listener(app, ctx);
    if (instance && instance.failed) {
      await instance.failed(
        {
          name: job.data.name,
          data: job.data.payload,
        },
        err,
        job
      );
    }
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    if (config.debug) {
      app.coreLogger.warn(`[egg-ebus] failedReason ${failedReason} job_id${jobId} .`);
    }
  });

  app.beforeStart(() => {
    app.coreLogger.info(`[egg-event-bus] ebus queue ${name} is OK.`);
  });


  return { mqueue, mworker };
};
