const mysql = require('mysql2');

// Create the connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  // default XAMPP password is empty
    database: 'truck_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export promise-based pool
module.exports = pool.promise(); 