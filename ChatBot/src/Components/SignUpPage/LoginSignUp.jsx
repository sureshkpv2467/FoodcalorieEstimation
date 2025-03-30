import React, { useState } from "react";
import axios from "axios";
import './LoginSignUp.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const LoginSignUp = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ 
        name: "", 
        email: "", 
        password: "" 
    });

    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        // Validate signup fields
        if (!formData.name || !formData.email || !formData.password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            // Send signup data to server
            const response = await axios.post('http://localhost:5000/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            
            // Show success message
            alert(response.data.msg);
            
            // Switch to login after successful signup
            setIsSignUp(false);
            
            // Reset form
            setFormData({ name: "", email: "", password: "" });
        } catch (error) {
            // Handle signup errors
            const errorMsg = error.response?.data?.msg || "Signup failed";
            alert(errorMsg);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Validate login fields
        if (!formData.email || !formData.password) {
            alert("Please enter email and password");
            return;
        }

        try {
            // Send login credentials to server
            const response = await axios.post('http://localhost:5000/login', {
                email: formData.email,
                password: formData.password
            });
            
            // Store token
            localStorage.setItem("token", response.data.token);
            
            // Show success message
            alert("Login successful!");
            
            // Navigate to landing page
            navigate('/landing');
        } catch (error) {
            // Handle login errors
            const errorMsg = error.response?.data?.msg || "Login failed";
            alert(errorMsg);
        }
    };

    return (
        <div className="container">
            <div className="header">
                <div className="text">{isSignUp ? "Sign Up" : "Login"}</div>
                <div className="underline"></div>
            </div>
            
            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                <div className="inputs">
                    {isSignUp && (
                        <div className="input">
                            <FontAwesomeIcon icon={faUser} className="icon-style" />
                            <input 
                                type="text" 
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    
                    <div className="input">
                        <FontAwesomeIcon icon={faEnvelope} className="icon-style"/>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Email Id"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input">
                        <FontAwesomeIcon icon={faLock} className="icon-style" />
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                
                {!isSignUp && (
                    <div className="forgot-password">
                        Lost Password?<span>Click Here!</span>
                    </div>
                )}
                
                <div className="submit-container">
                    {!isSignUp && (
                        <div 
                            className="submit" 
                            onClick={() => setIsSignUp(true)}
                        >
                            Create Account
                        </div>
                    )}
                    
                    <button type="submit" className="submit">
                        {isSignUp ? "Sign Up" : "Login"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default LoginSignUp;