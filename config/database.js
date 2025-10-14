const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Manual .env parsing
const envConfig = {};
try {
    const envPath = path.resolve(__dirname, '..', '.env');
    const envFileContent = fs.readFileSync(envPath, { encoding: 'utf8' });
    const lines = envFileContent.split('\n');
    for (const line of lines) {
        const match = line.match(/^([^#=]+)=(.+)/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            envConfig[key] = value;
        }
    }
} catch (e) {
    console.error('Could not read .env file manually', e);
    process.exit(1);
}

const pool = mysql.createPool({
    host: envConfig.DB_HOST || 'localhost',
    user: envConfig.DB_USER || 'root',
    password: envConfig.DB_PASSWORD || '',
    database: envConfig.DB_NAME || 'kantin_sekolah',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('Database pool created with manually parsed .env variables.');

module.exports = pool.promise();