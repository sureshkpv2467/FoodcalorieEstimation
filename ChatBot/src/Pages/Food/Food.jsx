import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Food.css';

const Food = () => {
    const [foodData, setFoodData] = useState({
        foodItem: '',
        weight: ''
    });
    const [userData, setUserData] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:5174/user/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setUserData(response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFoodData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5174/api/analyze-food', {
                foodItem: foodData.foodItem,
                weight: foodData.weight,
                userData: {
                    age: userData?.age || null,
                    weight: userData?.weight || null,
                    healthProblems: userData?.healthProblems || ''
                }
            });

            setResult(response.data);
        } catch (error) {
            console.error('Error analyzing food:', error);
            setResult({
                error: 'Failed to analyze food. Please try again.'
            });
        }
        setLoading(false);
    };

    const getHealthStatus = (calories, healthAnalysis) => {
        // Default status
        let status = {
            label: 'Moderate',
            color: '#EAB308', // Yellow
            description: 'Consume in moderation'
        };

        // Convert calories to number if it's a string
        const calorieNum = typeof calories === 'number' ? calories : 
            parseInt(calories.match(/\d+/)?.[0] || '0');

        // Check health analysis text for keywords
        const analysisText = healthAnalysis.toLowerCase();
        const hasHealthIssues = analysisText.includes('diabetes') || 
            analysisText.includes('blood pressure') ||
            analysisText.includes('cholesterol');

        if (hasHealthIssues && calorieNum > 300) {
            status = {
                label: 'Caution',
                color: '#DC2626', // Red
                description: 'Monitor portion size'
            };
        } else if (analysisText.includes('healthy') || 
            analysisText.includes('nutritious') ||
            analysisText.includes('beneficial')) {
            status = {
                label: 'Healthy',
                color: '#22C55E', // Green
                description: 'Good nutritional value'
            };
        } else if (calorieNum > 500) {
            status = {
                label: 'High Calorie',
                color: '#DC2626', // Red
                description: 'Consider smaller portion'
            };
        } else if (calorieNum < 100) {
            status = {
                label: 'Light',
                color: '#22C55E', // Green
                description: 'Good for snacking'
            };
        }

        return status;
    };

    const renderCalorieChart = (calories) => {
        // Extract numeric value from calories string using a more robust regex
        let calorieValue = 0;
        if (typeof calories === 'string') {
            // Match a range or a single value
            const rangeMatch = calories.match(/(\d+)\s*-\s*(\d+)/);
            if (rangeMatch) {
                calorieValue = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
            } else {
                const singleMatch = calories.match(/(\d+)/);
                calorieValue = singleMatch ? parseInt(singleMatch[1]) : 0;
            }
        } else if (typeof calories === 'number') {
            calorieValue = calories;
        }
        
        // Calculate percentage for circle (assuming 2500 as daily recommended value)
        const percentage = Math.min((calorieValue / 2500) * 100, 100);
        
        // Calculate circle properties
        const radius = 85; // Slightly smaller than viewBox/2
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        const healthStatus = getHealthStatus(calorieValue, result.healthAnalysis || '');

        return (
            <div className="calorie-chart">
                <div className="health-status" style={{ backgroundColor: healthStatus.color }}>
                    <span className="health-status-label">{healthStatus.label}</span>
                </div>
                <svg className="calorie-circle" viewBox="0 0 200 200">
                    <circle
                        className="calorie-circle-bg"
                        cx="100"
                        cy="100"
                        r={radius}
                    />
                    <circle
                        className="calorie-circle-progress"
                        cx="100"
                        cy="100"
                        r={radius}
                        strokeDasharray={strokeDasharray}
                        style={{ strokeDashoffset }}
                    />
                </svg>
                <div className="calorie-text">
                    <p className="calorie-number">{calorieValue}</p>
                    <p className="calorie-label">calories</p>
                </div>
                <div className="daily-value">
                    <p className="daily-value-text">{Math.round(percentage)}% of daily value</p>
                    <p className="health-description">{healthStatus.description}</p>
                </div>
            </div>
        );
    };

    const extractMacros = (nutrients) => {
        const macros = {
            protein: '0g',
            carbs: '0g',
            fat: '0g'
        };

        if (nutrients) {
            const lines = nutrients.split('\n');
            lines.forEach(line => {
                const lowerLine = line.toLowerCase().trim();
                
                // Extract numbers and unit (e.g., "20-25g" or "20g" or "20 g")
                const extractValue = (text) => {
                    const match = text.match(/(\d+)(?:\s*-\s*(\d+))?\s*g/);
                    if (match) {
                        if (match[2]) {
                            // If range (e.g., "20-25g"), take average
                            return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2) + 'g';
                        }
                        return match[1] + 'g';
                    }
                    return '0g';
                };

                if (lowerLine.includes('protein')) {
                    macros.protein = extractValue(lowerLine);
                }
                if (lowerLine.includes('carb')) {
                    macros.carbs = extractValue(lowerLine);
                }
                if (lowerLine.includes('fat')) {
                    macros.fat = extractValue(lowerLine);
                }
            });
        }

        return macros;
    };

    const renderResult = () => {
        if (!result) return null;
        if (result.error) return <div className="error-message">{result.error}</div>;

        const macros = extractMacros(result.nutrients);
        console.log('Extracted macros:', macros); // Add this for debugging

        return (
            <div className="result-details">
                <div className="result-section">
                    <h4>Caloric Information</h4>
                    <div className="info-box calories">
                        {renderCalorieChart(result.calories)}
                        <div className="macro-nutrients">
                            <div className="macro-nutrient">
                                <p className="macro-value">{macros.protein}</p>
                                <p className="macro-label">Protein</p>
                            </div>
                            <div className="macro-nutrient">
                                <p className="macro-value">{macros.carbs}</p>
                                <p className="macro-label">Carbs</p>
                            </div>
                            <div className="macro-nutrient">
                                <p className="macro-value">{macros.fat}</p>
                                <p className="macro-label">Fat</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="result-section">
                    <h4>Nutritional Details</h4>
                    <div className="info-box nutrients">
                        <ul className="nutrient-list">
                            {result.nutrients.split('\n').map((line, index) => (
                                line.trim() && <li key={index}>{line.trim()}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="result-section">
                    <h4>Health Analysis</h4>
                    <div className="info-box health-analysis">
                        {result.healthAnalysis.split('\n').map((line, index) => (
                            line.trim() && <p key={index}>{line.trim()}</p>
                        ))}
                    </div>
                </div>

                <div className="result-section">
                    <h4>Alternatives</h4>
                    <div className="info-box alternatives">
                        <ul className="alternatives-list">
                            {result.alternatives.split('\n').map((line, index) => (
                                line.trim() && <li key={index}>{line.trim()}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    // Add Eat button handler
    const handleEat = async () => {
        if (!result || !result.calories) return;
        // Extract calorie value as in renderCalorieChart
        let calorieValue = 0;
        if (typeof result.calories === 'string') {
            const rangeMatch = result.calories.match(/(\d+)\s*-\s*(\d+)/);
            if (rangeMatch) {
                calorieValue = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
            } else {
                const singleMatch = result.calories.match(/(\d+)/);
                calorieValue = singleMatch ? parseInt(singleMatch[1]) : 0;
            }
        } else if (typeof result.calories === 'number') {
            calorieValue = result.calories;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to record your calorie intake');
                return;
            }
            await axios.post('http://localhost:5174/api/calorie/intake', {
                foodName: foodData.foodItem,
                calories: calorieValue
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Calorie intake recorded!');
            // Optionally: trigger dashboard update here (e.g., via context or event)
            window.location.reload(); // Simple way to update dashboard
        } catch (error) {
            alert('Failed to record calorie intake.');
        }
    };

    return (
        <div className="food-container">
            <div className="food-card">
                <h2>Calculate Food Calories</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Food Item</label>
                        <input
                            type="text"
                            name="foodItem"
                            value={foodData.foodItem}
                            onChange={handleChange}
                            placeholder="Enter food item name"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Approximate Weight (in grams)</label>
                        <input
                            type="number"
                            name="weight"
                            value={foodData.weight}
                            onChange={handleChange}
                            placeholder="Enter weight in grams"
                            min="1"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="calculate-btn"
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Food'}
                    </button>
                </form>

                {loading && (
                    <div className="loading-spinner">
                        Analyzing your food...
                    </div>
                )}

                {result && !loading && (
                    <div className="result-container">
                        <h3>Analysis Results</h3>
                        {renderResult()}
                        <button className="eat-btn" onClick={handleEat} style={{marginTop: '1.5rem', width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'}}>Eat</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Food;
