'use strict';

const ebus = require('./lib/ebus');

module.exports = agent => {
  if (agent.config.ebus.agent) ebus(agent);
};
