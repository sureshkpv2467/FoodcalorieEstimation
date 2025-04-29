import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import Contact from '../Contact/Contact';
import Review from '../Review/Review';
const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Smart Food Calorie Estimation</h1>
          <p>Track your nutrition with AI-powered food analysis</p>
          <div className="hero-buttons">
            <Link to="/get-started" className="cta-button">Get Started</Link>
            <Link to="/login" className="secondary-button">Sign In</Link>
          </div>
        </div>
        <div className="hero-image">
          {/* Add hero image here */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Image Analysis</h3>
            <p>Upload food images for instant calorie estimation</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Nutrition Tracking</h3>
            <p>Monitor your daily nutrition intake</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Get personalized nutrition advice</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Image</h3>
            <p>Take a photo of your meal</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>AI Analysis</h3>
            <p>Our AI analyzes the food items</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Results</h3>
            <p>Receive detailed nutrition information</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Your Health Journey?</h2>
        <p>Join thousands of users tracking their nutrition with our AI-powered platform</p>
        <Link to="/get-started" className="cta-button">Get Started Now</Link>
      </section>
      <Review/>

            <Contact/>
    </div>
  );
};

export default Home; 