import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-c">
        <div className="newsletter">
          <h2>Subscribe to our newsletter for the latest updates on new features and product releases.</h2>
          <div className="subscribe-form">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
          <p className="copyright">© 2025 FoodAI. All rights reserved.</p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h3>Company</h3>
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Contact Us</li>
              <li>Blog</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Explore</h3>
            <ul>
              <li>Terms of Use</li>
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
              <li>Sign Up</li>
              <li>Login</li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Follow Us</h3>
            <ul>
              <li data-social="facebook">
                <i className="fab fa-facebook"></i>
                Facebook
              </li>
              <li data-social="instagram">
                <i className="fab fa-instagram"></i>
                Instagram
              </li>
              <li data-social="twitter">
                <i className="fab fa-twitter"></i>
                Twitter
              </li>
              <li data-social="linkedin">
                <i className="fab fa-linkedin"></i>
                LinkedIn
              </li>
              <li data-social="youtube">
                <i className="fab fa-youtube"></i>
                YouTube
              </li>
            </ul>
          </div>
        </div>
        </div>
        <hr />
        <div className="footer-disclaimer">
          
          <p>Disclaimer: The information provided by FoodAI is for general informational purposes only.</p>
          <div className="footer-links">
            <span>/privacy-policy</span>
            <span>/terms-of-use</span>
            <span>/cookie-policy</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
