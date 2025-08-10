// migrations/YYYYMMDDHHMMSS_create_bookings_table.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary(); // Unique ID for the booking
    table.integer('session_id') // The session being booked
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('sessions')
         .onDelete('CASCADE'); // If session is deleted, associated bookings are too

    table.integer('student_id') // The user (student) who booked the session
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('users')
         .onDelete('CASCADE'); // If student user is deleted, their bookings are too

    table.enum('status', ['pending', 'confirmed', 'cancelled', 'completed']).notNullable().defaultTo('pending'); // Booking status
    table.string('payment_status').defaultTo('unpaid'); // Example: 'unpaid', 'paid', 'refunded' (can be expanded later)

    table.timestamps(true, true); // created_at and updated_at

    // Ensure a session can only be booked by a student once (optional, depends on your business logic)
    // For 1-on-1 sessions, this is generally a good idea. For group sessions, it might not be.
    table.unique(['session_id', 'student_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists('bookings');
}