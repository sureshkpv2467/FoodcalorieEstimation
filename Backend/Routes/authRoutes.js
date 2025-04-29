const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { check, validationResult } = require('express-validator');

// Register User
router.post('/signup', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('age', 'Age is required').isNumeric(),
    check('weight', 'Weight is required').isNumeric(),
    // Make height, occupation, and country optional but validate if provided
    check('height').optional().isNumeric().withMessage('Height must be a number'),
    check('occupation').optional(),
    check('country').optional()
], async (req, res) => {
    console.log('Signup route hit');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, age, weight, height, occupation, country, healthProblems } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with default values for optional fields
        user = new User({
            name,
            email,
            password,
            age,
            weight,
            height: height || null,
            occupation: occupation || '',
            country: country || '',
            healthProblems: healthProblems || ''
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login User
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    console.log('Login route hit');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret_key_here',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 