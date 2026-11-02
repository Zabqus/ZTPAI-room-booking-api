exports.up = async function (knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 60).notNullable();
    table.string('role', 20).notNullable().defaultTo('USER');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.check("role IN ('USER', 'ADMIN')", [], 'users_role_check');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('users');
};
