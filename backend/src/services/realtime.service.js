const { EventEmitter } = require("events");

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

function publish(eventName, payload) {
  emitter.emit(eventName, payload);
  emitter.emit("all", { event: eventName, payload, timestamp: new Date().toISOString() });
}

module.exports = { emitter, publish };
