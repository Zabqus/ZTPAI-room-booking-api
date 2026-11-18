const { EventEmitter } = require('node:events');

// Błąd listenera jest tylko logowany - nie wpływa na odpowiedź API ani na inne listenery
function createEventBus() {
  const emitter = new EventEmitter();

  return {
    publish(eventType, payload) {
      emitter.emit(eventType, payload);
    },

    subscribe(eventType, listener) {
      emitter.on(eventType, async (payload) => {
        try {
          await listener(payload);
        } catch (err) {
          console.error(`[eventBus] listener for ${eventType} failed:`, err.stack);
        }
      });
    },
  };
}

module.exports = { createEventBus };
