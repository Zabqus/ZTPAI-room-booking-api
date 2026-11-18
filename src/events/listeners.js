const RESERVATION_EVENTS = ['reservation.created', 'reservation.cancelled'];

function registerListeners({ eventBus, auditRepository, usersRepository }) {
  for (const eventType of RESERVATION_EVENTS) {
    eventBus.subscribe(eventType, (payload) => auditRepository.create({ eventType, payload }));
  }

  eventBus.subscribe('reservation.cancelled', async ({ reservationId, userId, cancelledBy }) => {
    if (cancelledBy === userId) return;

    const canceller = await usersRepository.findById(cancelledBy);
    if (canceller?.role !== 'ADMIN') return;

    const owner = await usersRepository.findById(userId);
    console.log(`[notification] to: ${owner.email} - your reservation ${reservationId} was cancelled by an administrator`);
  });
}

module.exports = { registerListeners };
