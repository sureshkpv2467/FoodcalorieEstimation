import React, { useState } from "react";
import axios from "axios";
import './LoginSignUp.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faLock, faWeight, faCalendar, faHeartbeat } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const LoginSignUp = () => {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ 
        name: "", 
        email: "", 
        password: "",
        age: "",
        weight: "",
        healthProblems: ""
    });
    const [isLogin, setIsLogin] = useState(false);

    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        // Validate signup fields
        if (!formData.name || !formData.email || !formData.password || !formData.age || !formData.weight) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            // Send signup data to server
            const response = await axios.post('http://localhost:5174/auth/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                age: formData.age,
                weight: formData.weight,
                healthProblems: formData.healthProblems || "None"
            });
            
            // Show success message
            alert(response.data.msg);
            
            // Switch to login after successful signup
            setIsSignUp(false);
            
            // Reset form
            setFormData({ 
                name: "", 
                email: "", 
                password: "",
                age: "",
                weight: "",
                healthProblems: ""
            });
        } catch (error) {
            if (error.response?.data?.errors) {
                const allErrors = error.response.data.errors.map(err => err.msg).join("\n");
                alert(allErrors);
            } else {
                alert("Signup failed");
            }
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
            const response = await axios.post('http://localhost:5174/auth/login', {
                email: formData.email,
                password: formData.password
            });
            
            // Store token
            const token = response.data.token;
            if (!token) {
                throw new Error('No token received from server');
            }
            localStorage.setItem("token", token);
            console.log('Token stored:', token); // Debug log
            
            setIsLogin(true);
            
            // Show success message
            alert("Login successful!");
            
            // Navigate to dashboard instead of landing
            navigate('/dashboard');
        } catch (error) {
            // Handle login errors
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.msg || "Login failed";
            alert(errorMsg);
        }
    };

    return (
        <div className="container">
            <div className="headerr">
                <div className="text">{isSignUp ? "Sign Up" : "Login"}</div>
                <div className="underline"></div>
            </div>
            
            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                <div className="inputs">
                    {isSignUp && (
                        <>
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
                            <div className="input">
                                <FontAwesomeIcon icon={faCalendar} className="icon-style" />
                                <input 
                                    type="number" 
                                    name="age"
                                    placeholder="Age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="120"
                                />
                            </div>
                            <div className="input">
                                <FontAwesomeIcon icon={faWeight} className="icon-style" />
                                <input 
                                    type="number" 
                                    name="weight"
                                    placeholder="Weight (kg)"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    max="500"
                                />
                            </div>
                            <div className="input">
                                <FontAwesomeIcon icon={faHeartbeat} className="icon-style" />
                                <input 
                                    type="text" 
                                    name="healthProblems"
                                    placeholder="Health Problems (if any)"
                                    value={formData.healthProblems}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
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
                    {isSignUp ? (
                        <>
                            <button 
                                type="button" 
                                className="submit secondary"
                                onClick={() => setIsSignUp(false)}
                            >
                                Back to Login
                            </button>
                            <button type="submit" className="submit">
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                type="button" 
                                className="submit secondary"
                                onClick={() => setIsSignUp(true)}
                            >
                                Create Account
                            </button>
                            <button type="submit" className="submit">
                                Login
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    )
}

export default LoginSignUp;