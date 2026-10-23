// Daty zawsze jako ISO 8601 UTC, brakujące wartości jako null
const toIsoOrNull = (value) => (value ? new Date(value).toISOString() : null);

// Response DTO rezerwacji - jawnie wymienione pola (internalNote nigdy nie wychodzi na zewnątrz)
function toReservationResponse(reservation) {
  return {
    id: reservation.id,
    roomId: reservation.roomId,
    reservedBy: reservation.reservedBy,
    participants: reservation.participants,
    startTime: toIsoOrNull(reservation.startTime),
    endTime: toIsoOrNull(reservation.endTime),
    status: reservation.status,
    createdAt: toIsoOrNull(reservation.createdAt),
    cancelledAt: toIsoOrNull(reservation.cancelledAt),
  };
}

module.exports = { toReservationResponse };
