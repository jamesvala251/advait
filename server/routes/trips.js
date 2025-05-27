const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all trips
router.get('/trips', async (req, res) => {
    try {
        const [trips] = await db.query('SELECT * FROM trips ORDER BY startDate DESC');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new trip
router.post('/trips', async (req, res) => {
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
router.get('/trips/truck/:truckNumber', async (req, res) => {
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

// Get trips by date range
router.get('/trips/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const [trips] = await db.query(
            'SELECT * FROM trips WHERE startDate BETWEEN ? AND ? ORDER BY startDate DESC',
            [startDate, endDate]
        );
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 