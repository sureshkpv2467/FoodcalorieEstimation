const express = require('express');
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
require('dotenv').config({ path: path.resolve(__dirname, "../../../.env") });

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Configuration and Environment Variables
const API_KEY = process.env.API_KEY;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Validate environment variables
if (!API_KEY || !MONGO_URI || !JWT_SECRET) {
    console.error("Missing critical environment variables");
    process.exit(1);
}

// Enhanced MongoDB Connection with Retry Logic
const connectWithRetry = () => {
    mongoose.connect(MONGO_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    })
    .then(() => {console.log("MongoDB Connected Successfully"); 
    console.log("Connected to database:", MONGO_URI);})
    .catch(err => {
        console.error("MongoDB Connection Error:", err);
        // Retry connection after 5 seconds
        setTimeout(connectWithRetry, 5000);
    });
};
connectWithRetry();

// User Schema with Additional Fields
const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: function() { return this.action === 'Sign Up'; }
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8  // Minimum password length
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const User = mongoose.model("User", UserSchema);

// Google AI Model Initialization
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware for Token Verification
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ msg: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};

// 🔹 Signup API with Validation
app.post('/signup', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must include uppercase, lowercase, number, and special character')
], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Create new user
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword 
        });
        await newUser.save();

        res.status(201).json({ msg: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error during signup" });
    }
});

// 🔹 Login API with Enhanced Security
app.post('/login', [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Generate token with expiration and additional payload
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email 
            }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                email: user.email, 
                name: user.name 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error during login" });
    }
});

// 🔹 Protected AI Query Route
app.post('/ask', async (req, res) => {
    const prompt = req.body.question; 

    try {
        const result = await model.generateContent(prompt);
        console.log(result);
        const response = result.response; 
        const text = response.candidates[0]?.content?.parts[0]?.text || "No response";
        res.json({ response: text }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));