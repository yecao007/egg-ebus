'use strict';

const ebus = require('./lib/ebus');

module.exports = app => {
  if (app.config.ebus.app) ebus(app);
};
