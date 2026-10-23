const { toRoomResponse } = require('./rooms.mapper');

// Controller tłumaczy HTTP <-> service; błędy łapie Express 5 i przekazuje do error handlera
function createRoomsController({ roomsService }) {
  return {
    async list(req, res) {
      const rooms = await roomsService.listRooms();
      res.json(rooms.map(toRoomResponse));
    },

    async getById(req, res) {
      const room = await roomsService.getRoom(req.validated.params.id);
      res.json(toRoomResponse(room));
    },
  };
}

module.exports = { createRoomsController };
