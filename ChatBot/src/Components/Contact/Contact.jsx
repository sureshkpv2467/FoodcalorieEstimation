import React from 'react';
import './Contact.css';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Contact = () => {
  return (
    <section className="contact-section">
      <h4 className="contact-subheading">CONNECT WITH US</h4>
      <h2 className="contact-heading">Get in Touch</h2>
      <p className="contact-description">
        Have questions or need assistance? We're here to help! Reach out to us through any of the following channels.
      </p>

      <div className="contact-cards">
        <div className="contact-card">
          <MdEmail className="contact-icon" />
          <h3>Email Support</h3>
          <p>For general inquiries and support, our team is ready to assist you via email.</p>
          <p className="contact-detail">support@foodai.com</p>
        </div>

        <div className="contact-card">
          <MdPhone className="contact-icon" />
          <h3>Phone Support</h3>
          <p>Need immediate assistance? Our support team is available during business hours.</p>
          <p className="contact-detail">+1 (555) 123-4567</p>
        </div>

        <div className="contact-card">
          <MdLocationOn className="contact-icon" />
          <h3>Visit Us</h3>
          <p>Feel free to visit our office during business hours for a face-to-face consultation.</p>
          <p className="contact-detail">123 Tech Park, Silicon Valley, CA 94025</p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
