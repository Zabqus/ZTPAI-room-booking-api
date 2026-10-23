// Response DTO sali - jawnie wymienione pola
function toRoomResponse(room) {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
  };
}

module.exports = { toRoomResponse };
