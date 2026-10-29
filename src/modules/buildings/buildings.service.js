const { NotFoundError } = require('../../errors/errors');

function createBuildingsService({ buildingsRepository }) {
  return {
    async listBuildings() {
      return buildingsRepository.findAll();
    },

    async getBuilding(id) {
      const building = await buildingsRepository.findById(id);
      if (!building) throw new NotFoundError(`Building ${id} not found`, 'BUILDING_NOT_FOUND');
      return building;
    },

    async createBuilding({ name, address }) {
      return buildingsRepository.create({ name, address });
    },
  };
}

module.exports = { createBuildingsService };
