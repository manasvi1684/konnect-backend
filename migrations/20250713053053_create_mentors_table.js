/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  try {
    await knex.schema.createTable('mentors', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('specialization'); // Example: Mentor-specific field
      table.timestamps(true, true);
    });
  } catch (error) {
    console.error("Error creating mentors table:", error);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  try {
    await knex.schema.dropTableIfExists('mentors');
  } catch (error) {
    console.error("Error dropping mentors table:", error);
  }
}