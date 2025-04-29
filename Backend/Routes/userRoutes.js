const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../Models/User');
const auth = require('../Middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-photos');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error in profile route:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, upload.single('profilePhoto'), async (req, res) => {
    try {
        const { name, age, weight, height, occupation, country, healthProblems } = req.body;
        const updateData = {
            name,
            age,
            weight,
            height,
            occupation,
            country,
            healthProblems
        };

        if (req.file) {
            updateData.profilePhoto = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in update profile route:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 