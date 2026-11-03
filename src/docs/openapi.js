const errorResponse = (description) => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
});

const jsonBody = (ref) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: ref } } },
});

const jsonResponse = (description, schema) => ({
  description,
  content: { 'application/json': { schema } },
});

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const listOf = (name) => ({ type: 'array', items: ref(name) });

const idParam = { $ref: '#/components/parameters/Id' };
const r400 = { $ref: '#/components/responses/BadRequest' };
const r401 = { $ref: '#/components/responses/Unauthorized' };
const r403 = { $ref: '#/components/responses/Forbidden' };
const r404 = { $ref: '#/components/responses/NotFound' };
const r409 = { $ref: '#/components/responses/Conflict' };

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Room Booking API',
    version: '4.0.0',
  },
  servers: [{ url: '/api' }],
  security: [{ bearerAuth: [] }],
  tags: [{ name: 'Auth' }, { name: 'Buildings' }, { name: 'Rooms' }, { name: 'Reservations' }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Rejestracja nowego użytkownika (rola USER)',
        security: [],
        requestBody: jsonBody('#/components/schemas/RegisterRequest'),
        responses: {
          201: jsonResponse('Utworzony użytkownik', ref('User')),
          400: r400,
          409: errorResponse('Email zajęty (EMAIL_TAKEN)'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Logowanie - zwraca token JWT',
        security: [],
        requestBody: jsonBody('#/components/schemas/LoginRequest'),
        responses: {
          200: jsonResponse('Token dostępu', ref('LoginResponse')),
          400: r400,
          401: errorResponse('Zły email lub hasło (INVALID_CREDENTIALS)'),
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dane zalogowanego użytkownika',
        responses: {
          200: jsonResponse('Zalogowany użytkownik', ref('User')),
          401: r401,
        },
      },
    },
    '/buildings': {
      get: {
        tags: ['Buildings'],
        summary: 'Lista budynków',
        responses: {
          200: jsonResponse('Lista budynków', listOf('Building')),
          401: r401,
        },
      },
      post: {
        tags: ['Buildings'],
        summary: 'Utworzenie budynku (ADMIN)',
        requestBody: jsonBody('#/components/schemas/CreateBuildingRequest'),
        responses: {
          201: jsonResponse('Utworzony budynek', ref('Building')),
          400: r400,
          401: r401,
          403: r403,
          409: errorResponse('Budynek o tej nazwie już istnieje (ALREADY_EXISTS)'),
        },
      },
    },
    '/buildings/{id}': {
      get: {
        tags: ['Buildings'],
        summary: 'Szczegóły budynku',
        parameters: [idParam],
        responses: {
          200: jsonResponse('Budynek', ref('Building')),
          400: r400,
          401: r401,
          404: r404,
        },
      },
    },
    '/buildings/{id}/rooms': {
      get: {
        tags: ['Buildings'],
        summary: 'Sale w budynku',
        parameters: [idParam],
        responses: {
          200: jsonResponse('Lista sal', listOf('Room')),
          400: r400,
          401: r401,
          404: r404,
        },
      },
    },
    '/rooms': {
      get: {
        tags: ['Rooms'],
        summary: 'Lista sal',
        responses: {
          200: jsonResponse('Lista sal', listOf('Room')),
          401: r401,
        },
      },
      post: {
        tags: ['Rooms'],
        summary: 'Utworzenie sali (ADMIN)',
        requestBody: jsonBody('#/components/schemas/CreateRoomRequest'),
        responses: {
          201: jsonResponse('Utworzona sala', ref('Room')),
          400: r400,
          401: r401,
          403: r403,
          404: errorResponse('Budynek nie istnieje (BUILDING_NOT_FOUND)'),
          409: errorResponse('Sala o tej nazwie już istnieje w budynku (ALREADY_EXISTS)'),
        },
      },
    },
    '/rooms/{id}': {
      get: {
        tags: ['Rooms'],
        summary: 'Szczegóły sali',
        parameters: [idParam],
        responses: {
          200: jsonResponse('Sala', ref('Room')),
          400: r400,
          401: r401,
          404: r404,
        },
      },
    },
    '/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'Lista rezerwacji (USER widzi tylko swoje)',
        parameters: [
          { name: 'roomId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'buildingId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'userId', in: 'query', description: 'Tylko dla ADMIN', schema: { type: 'integer', minimum: 1 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['startTime', '-startTime', 'createdAt', '-createdAt', 'participants', '-participants'],
              default: 'startTime',
            },
          },
        ],
        responses: {
          200: jsonResponse('Strona rezerwacji', ref('ReservationList')),
          400: r400,
          401: r401,
          403: errorResponse('Filtr userId dostępny tylko dla ADMIN'),
        },
      },
      post: {
        tags: ['Reservations'],
        summary: 'Utworzenie rezerwacji (userId z tokenu)',
        requestBody: jsonBody('#/components/schemas/CreateReservationRequest'),
        responses: {
          201: jsonResponse('Utworzona rezerwacja', ref('Reservation')),
          400: r400,
          401: r401,
          404: errorResponse('Sala nie istnieje (ROOM_NOT_FOUND)'),
          409: errorResponse('Kolizja terminu lub przekroczona pojemność sali'),
        },
      },
    },
    '/reservations/{id}': {
      get: {
        tags: ['Reservations'],
        summary: 'Szczegóły rezerwacji (właściciel lub ADMIN)',
        parameters: [idParam],
        responses: {
          200: jsonResponse('Rezerwacja', ref('Reservation')),
          400: r400,
          401: r401,
          404: r404,
        },
      },
    },
    '/reservations/{id}/cancel': {
      patch: {
        tags: ['Reservations'],
        summary: 'Anulowanie rezerwacji (właściciel lub ADMIN)',
        parameters: [idParam],
        responses: {
          200: jsonResponse('Anulowana rezerwacja', ref('Reservation')),
          400: r400,
          401: r401,
          404: r404,
          409: errorResponse('Rezerwacja już się rozpoczęła'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      Id: { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
    },
    responses: {
      BadRequest: errorResponse('Błąd walidacji lub niepoprawny JSON'),
      Unauthorized: errorResponse('Brak, niepoprawny lub wygasły token'),
      Forbidden: errorResponse('Brak uprawnień (wymagana rola ADMIN)'),
      NotFound: errorResponse('Zasób nie istnieje'),
      Conflict: errorResponse('Konflikt'),
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    location: { type: 'string', example: 'body' },
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Invalid email address' },
                  },
                },
              },
              requestId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email', example: 'jan.kowalski@example.com' },
          password: { type: 'string', minLength: 10, maxLength: 72, example: 'bardzo-dlugie-haslo' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email', example: 'jan.kowalski@example.com' },
          password: { type: 'string', example: 'bardzo-dlugie-haslo' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
          expiresIn: { type: 'string', example: '15m' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 7 },
          email: { type: 'string', example: 'jan.kowalski@example.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Building: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Budynek A' },
          address: { type: 'string', example: 'ul. Warszawska 24, Kraków' },
          roomsCount: { type: 'integer', example: 3 },
        },
      },
      CreateBuildingRequest: {
        type: 'object',
        required: ['name', 'address'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Budynek C' },
          address: { type: 'string', minLength: 1, maxLength: 200, example: 'ul. Długa 1, Kraków' },
        },
      },
      Room: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: '101' },
          capacity: { type: 'integer', example: 30 },
          building: {
            type: 'object',
            properties: { id: { type: 'integer' }, name: { type: 'string' } },
          },
        },
      },
      CreateRoomRequest: {
        type: 'object',
        required: ['buildingId', 'name', 'capacity'],
        additionalProperties: false,
        properties: {
          buildingId: { type: 'integer', minimum: 1, example: 1 },
          name: { type: 'string', minLength: 1, maxLength: 100, example: '301' },
          capacity: { type: 'integer', minimum: 1, example: 25 },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 6 },
          room: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              building: { type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } },
            },
          },
          user: {
            type: 'object',
            properties: { id: { type: 'integer' }, email: { type: 'string' } },
          },
          participants: { type: 'integer', example: 5 },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] },
          createdAt: { type: 'string', format: 'date-time' },
          cancelledAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreateReservationRequest: {
        type: 'object',
        required: ['roomId', 'participants', 'startTime', 'endTime'],
        additionalProperties: false,
        properties: {
          roomId: { type: 'integer', minimum: 1, example: 1 },
          participants: { type: 'integer', minimum: 1, example: 5 },
          startTime: { type: 'string', format: 'date-time', example: '2026-12-01T10:00:00Z' },
          endTime: { type: 'string', format: 'date-time', example: '2026-12-01T11:00:00Z' },
        },
      },
      ReservationList: {
        type: 'object',
        properties: {
          data: listOf('Reservation'),
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    },
  },
};

module.exports = { openapiSpec };
