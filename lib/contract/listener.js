'use strict';

class Listener {
  constructor(app, ctx) {
    this.app = app;
    this.ctx = ctx;
  }

  static get isEventBus() {
    return true;
  }
}

module.exports = Listener;
