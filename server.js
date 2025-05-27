require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection and verify table structure
const initializeDatabase = async () => {
    try {
        // Test connection
        await db.query('SELECT 1');
        console.log('Database connection successful');

        // Check if trucks table exists
        const [tables] = await db.query('SHOW TABLES LIKE "trucks"');
        if (tables.length === 0) {
            console.log('Creating trucks table...');
            await db.query(`
                CREATE TABLE trucks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    truckNumber VARCHAR(50) NOT NULL UNIQUE,
                    loadCapacity DECIMAL(10,2),
                    status ENUM('Active', 'Inactive') DEFAULT 'Active'
                )
            `);
            console.log('Trucks table created successfully');
        } else {
            // Check if loadCapacity column exists
            const [columns] = await db.query('SHOW COLUMNS FROM trucks LIKE "loadCapacity"');
            if (columns.length === 0) {
                console.log('Adding loadCapacity column...');
                await db.query('ALTER TABLE trucks ADD COLUMN loadCapacity DECIMAL(10,2) AFTER truckNumber');
                console.log('loadCapacity column added successfully');
            }
            // Show table structure
            const [allColumns] = await db.query('SHOW COLUMNS FROM trucks');
            console.log('Trucks table structure:', allColumns);
        }
    } catch (error) {
        console.error('Database initialization error:', error);
        process.exit(1);
    }
};

// Initialize database before starting server
initializeDatabase();

// Trucks Routes
app.get('/api/trucks', async (req, res) => {
    console.log('GET /api/trucks request received');
    try {
        // Simple query to get all trucks with all fields
        const [trucks] = await db.query('SELECT * FROM trucks');
        console.log('Query result:', trucks);
        
        if (!trucks || trucks.length === 0) {
            console.log('No trucks found in database');
            return res.json([]);
        }
        
        console.log(`Found ${trucks.length} trucks`);
        res.json(trucks);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/trucks', async (req, res) => {
    try {
        const { truckNumber, loadCapacity, status = 'Active' } = req.body;
        const [result] = await db.query(
            'INSERT INTO trucks (truckNumber, loadCapacity, status) VALUES (?, ?, ?)',
            [truckNumber, loadCapacity, status]
        );
        const newTruck = { 
            id: result.insertId, 
            truckNumber, 
            loadCapacity,
            status 
        };
        res.status(201).json(newTruck);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/trucks/:id', async (req, res) => {
    try {
        const [result] = await db.query(
            'DELETE FROM trucks WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Truck not found' });
        } else {
            res.json({ message: 'Truck deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Trips Routes
app.get('/api/trips', async (req, res) => {
    try {
        const [trips] = await db.query('SELECT * FROM trips ORDER BY startDate DESC');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/trips', async (req, res) => {
    try {
        const {
            tripNumber,
            truckNumber,
            startDate,
            endDate,
            driverName,
            from,
            to,
            partyName,
            compressor,
            startKm,
            endKm,
            totalKm,
            dieselQty,
            dieselAmount,
            toll,
            driverSalary,
            advancedSalary,
            maintenance,
            freight,
            weight,
            totalFreight,
            totalExpenses,
            totalProfit,
            perDayProfit
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO trips (
                tripNumber, truckNumber, startDate, endDate, driverName,
                \`from\`, \`to\`, partyName, compressor, startKm,
                endKm, totalKm, dieselQty, dieselAmount, toll,
                driverSalary, advancedSalary, maintenance, freight, weight,
                totalFreight, totalExpenses, totalProfit, perDayProfit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                tripNumber, truckNumber, startDate, endDate, driverName,
                from, to, partyName, compressor, startKm,
                endKm, totalKm, dieselQty, dieselAmount, toll,
                driverSalary, advancedSalary, maintenance, freight, weight,
                totalFreight, totalExpenses, totalProfit, perDayProfit
            ]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Trip added successfully'
        });
    } catch (error) {
        console.error('Error adding trip:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get trips by truck number
app.get('/api/trips/truck/:truckNumber', async (req, res) => {
    try {
        const [trips] = await db.query(
            'SELECT * FROM trips WHERE truckNumber = ? ORDER BY startDate DESC',
            [req.params.truckNumber]
        );
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cities Routes
app.get('/api/cities', async (req, res) => {
    try {
        const [cities] = await db.query('SELECT name FROM cities');
        res.json(cities.map(city => city.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Materials Routes
app.get('/api/materials', async (req, res) => {
    try {
        const [materials] = await db.query('SELECT name FROM materials');
        res.json(materials.map(material => material.name));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 