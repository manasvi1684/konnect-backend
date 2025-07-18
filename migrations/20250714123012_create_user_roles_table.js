/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  try {
    await knex.schema.createTable('user_roles', (table) => {
      table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.integer('role_id').unsigned().notNullable().references('id').inTable('roles').onDelete('CASCADE');
      table.primary(['user_id', 'role_id']); // Composite primary key
    });
  } catch (error) {
    console.error("Error creating user_roles table:", error);
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  try {
    await knex.schema.dropTableIfExists('user_roles');
  } catch (error) {
    console.error("Error dropping user_roles table:", error);
  }
}