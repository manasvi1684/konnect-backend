/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  try {
    await knex.schema.createTable('roles', (table) => {
      table.increments('id').primary();
      table.string('name').unique().notNullable(); // e.g., 'mentor', 'mentee', 'student'
    });
  } catch (error) {
    console.error("Error creating roles table:", error);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  try {
    await knex.schema.dropTableIfExists('roles');
  } catch (error) {
    console.error("Error dropping roles table:", error);
  }
}