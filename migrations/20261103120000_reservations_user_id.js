const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.up = async function (knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.integer('user_id').references('id').inTable('users').onDelete('RESTRICT');
  });

  // Każda osoba z reserved_by dostaje własne konto USER z losowym hasłem (bez możliwości logowania);
  // jeśli reserved_by to email istniejącego konta (np. po rollbacku), rezerwacja trafia do tego konta
  const owners = await knex('reservations').distinct('reserved_by').orderBy('reserved_by');
  let legacyCount = 0;
  for (const { reserved_by } of owners) {
    let user = await knex('users').where({ email: reserved_by }).first('id');
    if (!user) {
      legacyCount++;
      [user] = await knex('users')
        .insert({
          email: `legacy-${legacyCount}@example.com`,
          password_hash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
          role: 'USER',
        })
        .returning('id');
    }
    await knex('reservations').where({ reserved_by }).update({ user_id: user.id });
  }

  await knex.schema.alterTable('reservations', (table) => {
    table.dropNullable('user_id');
    table.dropColumn('reserved_by');
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('reservations', (table) => {
    table.string('reserved_by', 100);
  });

  await knex.raw('UPDATE reservations SET reserved_by = users.email FROM users WHERE users.id = reservations.user_id');

  await knex.schema.alterTable('reservations', (table) => {
    table.dropNullable('reserved_by');
    table.dropColumn('user_id');
  });
};
