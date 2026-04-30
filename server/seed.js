import { initializeDatabase } from './db/queries.js';

initializeDatabase({ forceSeed: true });
console.log('Database seeded successfully.');
