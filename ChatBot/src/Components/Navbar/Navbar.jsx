import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('token') !== null;

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
        setIsProfileOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsProfileOpen(false);
        navigate('/');
        window.location.reload(); // Refresh the page to update the UI
    };

    const handleProfileClick = () => {
        if (isLoggedIn) {
            setIsProfileOpen(!isProfileOpen);
        } else {
            handleNavigation('/signup');
        }
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <span 
                        className="logo-text"
                        onClick={() => handleNavigation('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        FoodAI
                    </span>
                </div>

                <nav className={`nav ${isOpen ? 'active' : ''}`}>
                    <ul className="nav-list">
                        <li className="nav-item">
                            <span 
                                className="nav-link"
                                onClick={() => handleNavigation('/')}
                            >
                                Home
                            </span>
                        </li>
                        <li className="nav-item">
                            <span 
                                className="nav-link"
                                onClick={() => handleNavigation('/features')}
                            >
                                Features
                            </span>
                        </li>
                        <li className="nav-item">
                            <span 
                                className="nav-link"
                                onClick={() => handleNavigation('/about')}
                            >
                                About
                            </span>
                        </li>
                        <li className="nav-item">
                            <span 
                                className="nav-link"
                                onClick={() => handleNavigation('/contact')}
                            >
                                Contact
                            </span>
                        </li>
                    </ul>
                </nav>

                <div className="cta-container">
                    <span 
                        className="cta-button"
                        onClick={() => handleNavigation('/food')}
                    >
                        Get Started
                    </span>
                </div>
                <div className="profile-container">
                    <span 
                        className="cta-button"
                        onClick={handleProfileClick}
                    >
                        {isLoggedIn ? 'Profile' : 'Sign in/Login'}
                    </span>
                    {isLoggedIn && isProfileOpen && (
                        <div className="profile-dropdown">
                            <div 
                                className="dropdown-item"
                                onClick={() => handleNavigation('/dashboard')}
                            >
                                <FontAwesomeIcon icon={faChartLine} className="dropdown-icon" />
                                Dashboard
                            </div>
                            <div 
                                className="dropdown-item"
                                onClick={handleLogout}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} className="dropdown-icon" />
                                Logout
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    className={`hamburger ${isOpen ? 'active' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
