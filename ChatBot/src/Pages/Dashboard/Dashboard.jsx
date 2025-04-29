import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faCamera, faUser } from '@fortawesome/free-solid-svg-icons';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Dashboard = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        age: '',
        weight: '',
        height: '',
        occupation: '',
        country: '',
        healthProblems: '',
        profilePhoto: null
    });
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState({});
    const [photoPreview, setPhotoPreview] = useState(null);
    const navigate = useNavigate();

    // New state for calorie tracking
    const [calorieGoal, setCalorieGoal] = useState(2000);
    const [todayCalories, setTodayCalories] = useState(0);
    const [weeklyData, setWeeklyData] = useState({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Daily Calories',
            data: [1800, 2200, 1950, 2100, 1850, 2300, 2000],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.3,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.1)'
        }]
    });

    useEffect(() => {
        fetchUserData();
        fetchCalorieData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                alert('Please login to view your profile');
                navigate('/login');
                return;
            }

            console.log('Fetching user data with token:', token); // Debug log
            
            const response = await axios.get('http://localhost:5174/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            setUserData(response.data);
            setTempData(response.data);
            if (response.data.profilePhoto) {
                setPhotoPreview(response.data.profilePhoto);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            const errorMessage = error.response?.data?.message || error.message;
            
            if (error.response?.status === 401) {
                console.log('Token error:', errorMessage);
                localStorage.removeItem('token'); // Clear the invalid token
                alert(errorMessage || 'Session expired. Please login again.');
                navigate('/login');
            } else {
                alert('Failed to fetch user data: ' + errorMessage);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setTempData(prev => ({
                    ...prev,
                    profilePhoto: file
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to update your profile');
                navigate('/login');
                return;
            }

            const formData = new FormData();
            
            // Append all fields to formData
            Object.keys(tempData).forEach(key => {
                if (key === 'profilePhoto' && tempData[key] instanceof File) {
                    formData.append('profilePhoto', tempData[key]);
                } else {
                    formData.append(key, tempData[key]);
                }
            });

            const response = await axios.put('http://localhost:5174/user/profile', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUserData(response.data);
            setIsEditing(false);
            if (response.data.profilePhoto) {
                setPhotoPreview(response.data.profilePhoto);
            }
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || error.message;
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                alert('Session expired. Please login again.');
                navigate('/login');
            } else {
                alert('Failed to update profile: ' + errorMessage);
            }
        }
    };

    const handleEdit = () => {
        setTempData(userData);
        setIsEditing(true);
    };

    const fetchCalorieData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await axios.get('http://localhost:5174/api/calorie/weekly', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const weekly = response.data;
            console.log('Weekly data:', weekly);
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            console.log('Today:', todayStr);
            const todayEntry = weekly.find(entry => entry.date === todayStr);
            console.log('Today entry:', todayEntry);
            setTodayCalories(todayEntry ? todayEntry.calories : 0);
            // Update weekly chart data
            setWeeklyData(prev => ({
                ...prev,
                datasets: [{
                    ...prev.datasets[0],
                    data: weekly.map(entry => entry.calories)
                }]
            }));
        } catch (error) {
            console.error('Error fetching calorie data:', error);
        }
    };

    const handleCalorieGoalChange = (e) => {
        setCalorieGoal(parseInt(e.target.value));
    };

    const addCalories = (amount) => {
        setTodayCalories(prev => prev + amount);
    };

    const calculateProgress = () => {
        return (todayCalories / calorieGoal) * 100;
    };

    return (
        <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="user-greeting">
                    <div className="profile-photo">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" />
                        ) : (
                            <div className="default-photo">
                                <FontAwesomeIcon icon={faUser} />
                            </div>
                        )}
                    </div>
                    <div className="greeting-text">
                        <h1>Welcome back, {userData.name || 'User'}!</h1>
                        <p>Track your nutrition journey</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Calorie Goal Card */}
                <div className="dashboard-card goal-card">
                    <h3>Daily Calorie Goal</h3>
                    <div className="goal-input">
                        <input
                            type="number"
                            value={calorieGoal}
                            onChange={handleCalorieGoalChange}
                            className="calorie-input"
                        />
                        <span>calories</span>
                    </div>
                    <div className="progress-container">
                        <div 
                            className="progress-bar"
                            style={{ 
                                width: `${Math.min(calculateProgress(), 100)}%`,
                                backgroundColor: calculateProgress() > 100 ? '#ef4444' : '#4ade80'
                            }}
                        />
                    </div>
                    <div className="calorie-stats">
                        <span>{todayCalories} / {calorieGoal}</span>
                        <span>{Math.round(calculateProgress())}%</span>
                    </div>
                </div>

                {/* Health Stats Card */}
                <div className="dashboard-card stats-card">
                    <h3>Health Stats</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">BMI</span>
                            <span className="stat-value">
                                {userData.weight && userData.height 
                                    ? (userData.weight / Math.pow(userData.height/100, 2)).toFixed(1)
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Weight</span>
                            <span className="stat-value">{userData.weight || 'N/A'} kg</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Height</span>
                            <span className="stat-value">{userData.height || 'N/A'} cm</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Age</span>
                            <span className="stat-value">{userData.age || 'N/A'} years</span>
                        </div>
                    </div>
                </div>

                {/* Weekly Progress Card */}
                <div className="dashboard-card chart-card">
                    <h3>Weekly Progress</h3>
                    <div className="chart-container">
                        <Line 
                            data={weeklyData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            display: false
                                        }
                                    },
                                    x: {
                                        grid: {
                                            display: false
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                
            </div>

            {/* Profile Section - Collapsible */}
            <div className="profile-section">
                <div className="profile-details-container">
                    <h3 className="section-title">Profile Details</h3>
                    <div className="profile-photo-container">
                        <div className="profile-photo">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" />
                            ) : (
                                <div className="default-photo">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                            )}
                            {isEditing && (
                                <label className="photo-upload">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        style={{ display: 'none' }}
                                    />
                                    <FontAwesomeIcon icon={faCamera} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="profile-details">
                        {/* First Row */}
                        <div className="detail-row">
                            <span className="label">Name:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={tempData.name}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span className="value">{userData.name}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="label">Email:</span>
                            <span className="value">{userData.email}</span>
                        </div>

                        <div className="detail-row">
                            <span className="label">Age:</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="age"
                                    value={tempData.age}
                                    onChange={handleChange}
                                    min="1"
                                    max="120"
                                />
                            ) : (
                                <span className="value">{userData.age}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="label">Weight (kg):</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="weight"
                                    value={tempData.weight}
                                    onChange={handleChange}
                                    min="1"
                                    max="500"
                                />
                            ) : (
                                <span className="value">{userData.weight}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="label">Height (cm):</span>
                            {isEditing ? (
                                <input
                                    type="number"
                                    name="height"
                                    value={tempData.height}
                                    onChange={handleChange}
                                    min="50"
                                    max="300"
                                />
                            ) : (
                                <span className="value">{userData.height}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="label">Occupation:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="occupation"
                                    value={tempData.occupation}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span className="value">{userData.occupation}</span>
                            )}
                        </div>

                        <div className="detail-row">
                            <span className="label">Country:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="country"
                                    value={tempData.country}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span className="value">{userData.country}</span>
                            )}
                        </div>

                        {/* Health Problems - Full Width */}
                        <div className="detail-row">
                            <span className="label">Health Problems:</span>
                            {isEditing ? (
                                <textarea
                                    name="healthProblems"
                                    value={tempData.healthProblems}
                                    onChange={handleChange}
                                />
                            ) : (
                                <span className="value">{userData.healthProblems}</span>
                            )}
                        </div>

                        <div className="action-buttons">
                            {isEditing ? (
                                <button className="save-button" onClick={handleSave}>
                                    <FontAwesomeIcon icon={faSave} /> Save Changes
                                </button>
                            ) : (
                                <button className="edit-button" onClick={handleEdit}>
                                    <FontAwesomeIcon icon={faEdit} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
