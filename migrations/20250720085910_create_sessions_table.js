// migrations/YYYYMMDDHHMMSS_create_sessions_table.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('sessions', (table) => {
    table.increments('id').primary(); // Unique ID for the session
    table.integer('mentor_id') // ID of the user (mentor) offering the session
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('users') // Foreign key to the users table
         .onDelete('CASCADE'); // If mentor user is deleted, their sessions are too

    table.string('title').notNullable(); // e.g., "SAP FICO Basics", "Career Path Guidance"
    table.text('description'); // Detailed description of the session content
    table.string('sap_module'); // e.g., 'FICO', 'SD', 'MM', 'ABAP' - consider making this a foreign key to a 'sap_modules' table later
    table.timestamp('start_time').notNullable(); // When the session starts
    table.timestamp('end_time').notNullable();   // When the session ends
    table.decimal('price', 8, 2).defaultTo(0.00); // Price of the session (e.g., 50.00)
    table.integer('duration_minutes'); // Optional: store duration for convenience

    table.timestamps(true, true); // created_at and updated_at
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('sessions');
}