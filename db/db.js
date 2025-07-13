// db/db.js
import knex from 'knex';
import knexConfig from '../knexfile.js'; // Use .js extension
const db = knex(knexConfig.development);
export default db; // Change module.exports to export default