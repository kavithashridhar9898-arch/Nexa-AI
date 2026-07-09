import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const run = async () => {
  const password = process.argv[2];
  if (!password) {
    console.error('Error: Please provide your Clever Cloud database password as an argument.');
    console.log('Usage: node seed.js <your_database_password>');
    process.exit(1);
  }

  const config = {
    host: 'befkq0xngynyiyyjuyue-mysql.services.clever-cloud.com',
    port: 3306,
    user: 'uqy7xeiqgyy1adpa',
    database: 'befkq0xngynyiyyjuyue',
    password: password
  };

  console.log(`Connecting to Clever Cloud MySQL database at ${config.host}...`);

  try {
    const connection = await mysql.createConnection(config);
    console.log('Connected successfully to database container!');

    const sqlFilePath = path.join(__dirname, 'db.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split queries by semicolon, removing comments, CREATE DATABASE, and USE statements
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => {
        if (!q) return false;
        const upper = q.toUpperCase();
        // Skip comment headers
        if (q.startsWith('--')) return false;
        // Skip CREATE DATABASE and USE statements (since Clever Cloud databases are pre-created)
        if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) return false;
        return true;
      });

    console.log(`Found ${queries.length} database tables to build.`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      const tableMatch = query.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i);
      const tableName = tableMatch ? tableMatch[1] : `query ${i + 1}`;
      
      console.log(`Building table structure: [${tableName}]...`);
      await connection.query(query);
    }

    console.log('================================================================');
    console.log('🎉 SUCCESS: Clever Cloud MySQL Database initialized successfully!');
    console.log('================================================================');
    await connection.end();
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    process.exit(1);
  }
};

run();
