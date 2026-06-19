const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read the schema.sql file
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const baseHost = 'aws-1-eu-central-1.pooler.supabase.com';
const username = 'postgres.oozjmusanrefclvajglq';

// Test both passwords (with and without brackets) and ports (pooled 6543 and direct 5432)
const configurations = [
  { port: 5432, password: 'takami@1221' },
  { port: 6543, password: 'takami@1221' },
  { port: 5432, password: '[takami@1221]' },
  { port: 6543, password: '[takami@1221]' }
];

async function tryConnect(config) {
  const encodedPassword = encodeURIComponent(config.password);
  const connectionString = `postgresql://${username}:${encodedPassword}@${baseHost}:${config.port}/postgres`;
  
  console.log(`Attempting connection on port ${config.port} with password: ${config.password}...`);
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  
  try {
    await client.connect();
    console.log(`Successfully connected!`);
    return client;
  } catch (err) {
    console.log(`Connection failed: ${err.message}`);
    return null;
  }
}

async function run() {
  let client = null;
  
  for (const config of configurations) {
    client = await tryConnect(config);
    if (client) break;
  }

  if (!client) {
    console.error("Error: Could not connect to the database with any configuration. Please make sure database is online and accessible.");
    process.exit(1);
  }

  try {
    console.log("Creating database schema...");
    await client.query(schemaSql);
    console.log("Schema created successfully.");

    // Check if patients already exist
    const checkRes = await client.query('SELECT COUNT(*) FROM "Patient"');
    const count = parseInt(checkRes.rows[0].count, 10);
    
    if (count > 0) {
      console.log("Database already contains data. Skipping seed.");
    } else {
      console.log("Seeding database with mock data...");
      
      // Insert Patients
      const patientsSql = `
        INSERT INTO "Patient" ("fullName", age, gender, phone) VALUES
        ('Jane Smith', 28, 'Female', '+1 (555) 019-8834') RETURNING id;
        INSERT INTO "Patient" ("fullName", age, gender, phone) VALUES
        ('Robert Johnson', 45, 'Male', '+1 (555) 014-9921') RETURNING id;
        INSERT INTO "Patient" ("fullName", age, gender, phone) VALUES
        ('Emily Davis', 8, 'Female', '+1 (555) 011-3342') RETURNING id;
      `;
      
      // We run queries sequentially to capture returned IDs
      const p1 = await client.query(`INSERT INTO "Patient" ("fullName", age, gender, phone) VALUES ('Jane Smith', 28, 'Female', '+1 (555) 019-8834') RETURNING id`);
      const p2 = await client.query(`INSERT INTO "Patient" ("fullName", age, gender, phone) VALUES ('Robert Johnson', 45, 'Male', '+1 (555) 014-9921') RETURNING id`);
      const p3 = await client.query(`INSERT INTO "Patient" ("fullName", age, gender, phone) VALUES ('Emily Davis', 8, 'Female', '+1 (555) 011-3342') RETURNING id`);
      
      const p1Id = p1.rows[0].id;
      const p2Id = p2.rows[0].id;
      const p3Id = p3.rows[0].id;

      // Insert Visits for today
      await client.query(`
        INSERT INTO "Visit" ("patientId", "queueNumber", symptoms, status) VALUES
        (${p1Id}, 1, 'Follow-up checkup for throat infection', 'COMPLETED'),
        (${p2Id}, 2, 'Severe lower back pain for 2 days', 'IN_PROGRESS'),
        (${p3Id}, 3, 'Mild fever and skin rash', 'WAITING')
      `);
      
      console.log("Mock data seeded successfully.");
    }

    await client.end();
    console.log("Database initialization completed successfully.");
  } catch (err) {
    console.error("Error executing queries:", err.message);
    try { await client.end(); } catch(e) {}
    process.exit(1);
  }
}

run();
