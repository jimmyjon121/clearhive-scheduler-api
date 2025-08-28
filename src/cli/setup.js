#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('Family First Therapeutic Outing Scheduler - Setup');
  console.log('================================================\n');

  try {
    // Get database connection details
    const dbHost = await question('Database host (default: localhost): ') || 'localhost';
    const dbPort = await question('Database port (default: 5432): ') || '5432';
    const dbName = await question('Database name (default: family_first_scheduler): ') || 'family_first_scheduler';
    const dbUser = await question('Database user (default: postgres): ') || 'postgres';
    const dbPassword = await question('Database password: ');

    // Create connection string
    const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

    // Test connection
    console.log('\nTesting database connection...');
    const pool = new Pool({ connectionString });
    
    try {
      await pool.query('SELECT 1');
      console.log('✓ Database connection successful\n');
    } catch (error) {
      console.error('✗ Database connection failed:', error.message);
      process.exit(1);
    }

    // Ask if user wants to create tables
    const createTables = await question('Create database tables? (y/n): ');
    
    if (createTables.toLowerCase() === 'y') {
      console.log('\nCreating database tables...');
      const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      try {
        await pool.query(schema);
        console.log('✓ Database tables created successfully\n');
      } catch (error) {
        console.error('✗ Error creating tables:', error.message);
        process.exit(1);
      }
    }

    // Ask about email configuration
    const configureEmail = await question('Configure email notifications? (y/n): ');
    
    let emailConfig = null;
    if (configureEmail.toLowerCase() === 'y') {
      const emailHost = await question('SMTP host (default: smtp.gmail.com): ') || 'smtp.gmail.com';
      const emailPort = await question('SMTP port (default: 587): ') || '587';
      const emailUser = await question('SMTP username/email: ');
      const emailPass = await question('SMTP password: ');
      
      emailConfig = {
        host: emailHost,
        port: parseInt(emailPort),
        secure: false,
        user: emailUser,
        pass: emailPass
      };
    }

    // Ask about Google Sheets integration
    const configureSheets = await question('Configure Google Sheets integration? (y/n): ');
    
    let sheetsConfig = null;
    if (configureSheets.toLowerCase() === 'y') {
      console.log('\nTo use Google Sheets integration, you need to:');
      console.log('1. Go to Google Cloud Console (https://console.cloud.google.com)');
      console.log('2. Create a new project or select existing');
      console.log('3. Enable Google Sheets API');
      console.log('4. Create a service account');
      console.log('5. Download the JSON credentials file\n');
      
      const credentialsPath = await question('Path to Google service account credentials JSON file: ');
      
      if (fs.existsSync(credentialsPath)) {
        sheetsConfig = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        console.log('✓ Google Sheets credentials loaded\n');
      } else {
        console.log('✗ Credentials file not found\n');
      }
    }

    // Generate .env file
    console.log('Generating .env file...');
    
    let envContent = `# Database Configuration
DATABASE_URL=${connectionString}

# Server Configuration
PORT=3000
NODE_ENV=development

`;

    if (emailConfig) {
      envContent += `# Email Configuration
EMAIL_CONFIG=${JSON.stringify(emailConfig)}

`;
    }

    if (sheetsConfig) {
      envContent += `# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS=${JSON.stringify(sheetsConfig)}

`;
    }

    fs.writeFileSync(path.join(__dirname, '..', '..', '.env'), envContent);
    console.log('✓ .env file created successfully\n');

    // Create a test facility
    const createTestData = await question('Create test data? (y/n): ');
    
    if (createTestData.toLowerCase() === 'y') {
      console.log('\nCreating test facility...');
      
      const facilityName = await question('Facility name (default: Family First Program): ') || 'Family First Program';
      const facilityEmail = await question('Facility email: ') || 'admin@familyfirst.org';
      
      await pool.query(
        'UPDATE facilities SET name = $1, email = $2 WHERE id = 1',
        [facilityName, facilityEmail]
      );
      
      console.log('✓ Test data created successfully\n');
    }

    console.log('\n🎉 Setup complete!\n');
    console.log('You can now start the server with: npm start');
    console.log('\nAPI Endpoints:');
    console.log('- GET  /api/v1/programs - List all programs');
    console.log('- GET  /api/v1/vendors - List all vendors');
    console.log('- POST /api/v1/advanced-schedules/generate-year - Generate yearly schedule');
    console.log('- GET  /api/v1/advanced-schedules/:date/details - Get schedule details');
    console.log('- GET  /api/v1/advanced-schedules/:date/pdf - Download PDF');
    console.log('- POST /api/v1/advanced-schedules/sync-sheets - Sync with Google Sheets');
    
    pool.end();
    rl.close();
  } catch (error) {
    console.error('\nSetup error:', error);
    rl.close();
    process.exit(1);
  }
}

setup();
