const { NotFoundError } = require('../../errors/errors');

// Logika sal - repository wstrzykiwane jako parametr
function createRoomsService({ roomsRepository }) {
  return {
    async listRooms() {
      return roomsRepository.findAll();
    },

    async getRoom(id) {
      const room = await roomsRepository.findById(id);
      if (!room) throw new NotFoundError(`Room ${id} not found`, 'ROOM_NOT_FOUND');
      return room;
    },
  };
}

module.exports = { createRoomsService };
