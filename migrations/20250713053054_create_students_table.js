/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  try {
    await knex.schema.createTable('students', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('major'); // Example: Student-specific field
      table.timestamps(true, true);
    });
  } catch (error) {
    console.error("Error creating students table:", error);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  try {
    await knex.schema.dropTableIfExists('students');
  } catch (error) {
    console.error("Error dropping students table:", error);
  }
}