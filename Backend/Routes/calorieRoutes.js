const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const requireAuth = require('../Middleware/auth'); // Use the existing Auth.js middleware

// UserCalorie Schema: one document per user
const UserCalorieSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    weeklyCalories: [
        {
            date: { type: String, required: true }, // e.g., '2025-04-26'
            calories: { type: Number, required: true }
        }
    ]
});

const UserCalorie = mongoose.models.UserCalorie || mongoose.model('UserCalorie', UserCalorieSchema, 'user_calories');

// POST /api/calorie/intake
router.post('/intake', requireAuth, async (req, res) => {
    try {
        const { calories } = req.body;
        const userId = req.user._id || req.user.id;
        const today = new Date();
        today.setHours(0,0,0,0); // Local midnight
        // Get local date string YYYY-MM-DD
        const todayStr = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');
        let userDoc = await UserCalorie.findOne({ userId });
        if (!userDoc) {
            userDoc = new UserCalorie({ userId, weeklyCalories: [{ date: todayStr, calories }] });
        } else {
            // Remove any entries older than 6 days ago
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 6);
            weekAgo.setHours(0,0,0,0);
            const weekAgoStr = weekAgo.getFullYear() + '-' +
                String(weekAgo.getMonth() + 1).padStart(2, '0') + '-' +
                String(weekAgo.getDate()).padStart(2, '0');
            userDoc.weeklyCalories = userDoc.weeklyCalories.filter(entry => entry.date >= weekAgoStr);
            // Find today's entry
            const todayEntry = userDoc.weeklyCalories.find(entry => entry.date === todayStr);
            if (todayEntry) {
                todayEntry.calories += calories;
            } else {
                userDoc.weeklyCalories.push({ date: todayStr, calories });
            }
            // Keep only the last 7 days
            userDoc.weeklyCalories = userDoc.weeklyCalories.slice(-7);
        }
        await userDoc.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to record calorie intake.' });
    }
});

// GET /api/calorie/weekly
router.get('/weekly', requireAuth, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const today = new Date();
        today.setHours(0,0,0,0); // Local midnight
        let userDoc = await UserCalorie.findOne({ userId });
        // Fill missing days (ending with today)
        const result = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() - 6 + i);
            d.setHours(0,0,0,0); // Local midnight
            const dateStr = d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0');
            const found = userDoc && userDoc.weeklyCalories.find(e => e.date === dateStr);
            result.push({ date: dateStr, calories: found ? found.calories : 0 });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weekly calorie data.' });
    }
});

module.exports = router; 