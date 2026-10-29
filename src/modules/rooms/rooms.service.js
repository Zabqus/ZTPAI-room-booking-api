const { NotFoundError } = require('../../errors/errors');

// Logika sal - repository wstrzykiwane jako parametr
function createRoomsService({ roomsRepository, buildingsRepository }) {
  return {
    async listRooms() {
      return roomsRepository.findAll();
    },

    async getRoom(id) {
      const room = await roomsRepository.findById(id);
      if (!room) throw new NotFoundError(`Room ${id} not found`, 'ROOM_NOT_FOUND');
      return room;
    },

    async createRoom({ buildingId, name, capacity }) {
      const building = await buildingsRepository.findById(buildingId);
      if (!building) throw new NotFoundError(`Building ${buildingId} not found`, 'BUILDING_NOT_FOUND');
      return roomsRepository.create({ buildingId, name, capacity });
    },
  };
}

module.exports = { createRoomsService };
