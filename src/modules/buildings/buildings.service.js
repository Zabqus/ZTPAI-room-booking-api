const { NotFoundError } = require('../../errors/errors');

function createBuildingsService({ buildingsRepository, roomsRepository }) {
  async function getBuilding(id) {
    const building = await buildingsRepository.findById(id);
    if (!building) throw new NotFoundError(`Building ${id} not found`, 'BUILDING_NOT_FOUND');
    return building;
  }

  return {
    async listBuildings() {
      return buildingsRepository.findAll();
    },

    getBuilding,

    async listBuildingRooms(id) {
      await getBuilding(id);
      return roomsRepository.findByBuildingId(id);
    },

    async createBuilding({ name, address }) {
      return buildingsRepository.create({ name, address });
    },
  };
}

module.exports = { createBuildingsService };
