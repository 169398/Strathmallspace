import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Configure neon to use fetch
neonConfig.fetchConnectionCache = true;

// Create connection string
const sql = neon(process.env.POSTGRES_URL!);

// Create database instance
const db = drizzle(sql, { schema });

export default db;
