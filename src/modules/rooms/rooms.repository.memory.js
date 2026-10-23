// Repozytorium sal w pamięci - jedyne miejsce, gdzie istnieje tablica z salami
function createRoomsRepository() {
  const rooms = [
    { id: 1, name: 'A101', capacity: 30 },
    { id: 2, name: 'B202', capacity: 15 },
    { id: 3, name: 'C303', capacity: 50 },
    { id: 4, name: 'D404', capacity: 10 },
  ];

  return {
    async findAll() {
      return rooms;
    },

    async findById(id) {
      return rooms.find((r) => r.id === id) ?? null;
    },
  };
}

module.exports = { createRoomsRepository };
