const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

console.log('Membaca .env secara manual...');

let dbPassword = '';
try {
    const envPath = path.resolve(__dirname, '.env');
    const envFileContent = fs.readFileSync(envPath, { encoding: 'utf8' });
    const lines = envFileContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('DB_PASSWORD=')) {
            dbPassword = line.split('=')[1].trim();
            break;
        }
    }
} catch (e) {
    console.error('Gagal membaca file .env secara manual:', e);
    process.exit(1);
}

console.log('Mencoba menghubungkan ke basis data...');
console.log({
    host: 'localhost', // Hardcoded for test
    user: 'root',      // Hardcoded for test
    password: dbPassword ? '******' : '(kosong)',
    database: 'kantin_sekolah' // Hardcoded for test
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: dbPassword,
    database: 'kantin_sekolah',
});

connection.connect((err) => {
    if (err) {
        console.error('Koneksi basis data GAGAL:', err);
        process.exit(1);
    }

    console.log('Koneksi basis data BERHASIL!');
    connection.end();
});