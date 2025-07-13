/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  try {
    await knex.schema.createTable('mentees', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('interests'); // Example: Mentee-specific field
      table.timestamps(true, true);
    });
  } catch (error) {
    console.error("Error creating mentees table:", error);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  try {
    await knex.schema.dropTableIfExists('mentees');
  } catch (error) {
    console.error("Error dropping mentees table:", error);
  }
}