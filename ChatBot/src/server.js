require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

require('dotenv').config({ path: path.resolve(__dirname, "../../../.env") });
console.log("Resolved .env path:", path.resolve(__dirname, "../../../.env"));
console.log("API_KEY from .env:", process.env.API_KEY);


const { GoogleGenerativeAI } = require("@google/generative-ai");
app.use(cors());

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());

app.post('/ask', async (req, res) => {

    const prompt = req.body.question; 

    try {
        const result = await model.generateContent(prompt);
        const response = result.response; 
        const text = response.candidates[0]?.content?.parts[0]?.text || "No response";
        res.json({ response: text }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
