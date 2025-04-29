require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'profile-photos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/Customer_Details';
console.log('Connecting to MongoDB at:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected to Customer_Details database');
    // Log all collections in the database
    mongoose.connection.db.listCollections().toArray()
        .then(collections => {
            console.log('Available collections:', collections.map(c => c.name));
        })
        .catch(err => console.error('Error listing collections:', err));
})
.catch(err => console.log('MongoDB Connection Error:', err));

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Import and use routes
console.log('Loading routes...');
const userRoutes = require('./Routes/userRoutes');
const authRoutes = require('./Routes/authRoutes');
const foodRoutes = require('./Routes/foodRoutes');
console.log('Routes loaded');

// Register routes
console.log('Registering routes...');
app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/api', foodRoutes);
// Register calorie intake routes
app.use('/api/calorie', require('./Routes/calorieRoutes'));
console.log('Routes registered');

// Debug route to test server
app.get('/test', (req, res) => {
    console.log('Test route hit');
    res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}/test`);
    console.log(`Try accessing: http://localhost:${PORT}/user/debug/users`);
}); 