// seeds/initial_roles.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('roles').del()
  await knex('roles').insert([
    { name: 'mentor' },
    { name: 'mentee' },
    { name: 'student' }
  ]);
}