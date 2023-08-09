'use strict';

const path = require('path');
const { LISTENER_TARGET } = require('./common');

exports.load = (app, config) => {
  const dir = path.join(app.baseDir, 'app', config.listener.baseDir);
  const listeners = [];
  const events = Object.create(null);
  const methods = Object.create(null);
  const queueListeners = Object.create(null);

  app.loader.loadToApp(dir, LISTENER_TARGET, {
    ignore: config.listener.ignore,
    filter: listener => listener.isEventBus,
    initializer(listener, pathInfo) {
      const name = pathInfo.pathName.replace(config.listener.baseDir + '.', '');
      const queue = config.queue.prefix + ':' + (listener.queue || config.queue.default);
      listeners.push({
        name,
        queue,
        attempts: listener.attempts,
        watch: listener.watch,
      });
      if (!queueListeners) {
        queueListeners[queue] = {};
      }
      queueListeners[queue] = name;
      for (const event of listener.watch) {
        if (!events[event]) {
          events[event] = [];
        }
        if (!methods[queue]) {
          methods[queue] = [];
        }
        methods[queue].push({ name: event, attempts: listener.attempts });

        events[event].push({ name, queue, attempts: listener.attempts });
      }

      return listener;
    },
  });

  return { events, listeners, methods, queueListeners };
};
