import React, { useState } from 'react';
import axios from 'axios';
import './FoodImageUpload.css';

const FoodImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysis(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select an image first');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await axios.post('http://localhost:5174/api/analyze-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAnalysis(response.data);
        } catch (err) {
            setError('Failed to analyze image. Please try again.');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="food-image-upload">
            <h2>Food Image Analysis</h2>
            
            <div className="upload-section">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                />
                
                {previewUrl && (
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" className="preview-image" />
                    </div>
                )}

                <button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || loading}
                    className="upload-button"
                >
                    {loading ? 'Analyzing...' : 'Analyze Image'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {analysis && (
                <div className="analysis-results">
                    <h3>Analysis Results</h3>
                    
                    <div className="result-section">
                        <h4>Detected Food</h4>
                        <p>{analysis.detectedFood.replace(/_/g, ' ').toUpperCase()}</p>
                    </div>

                    <div className="result-section">
                        <h4>Calories</h4>
                        <p>{analysis.calories}</p>
                    </div>

                    <div className="result-section">
                        <h4>Nutrients</h4>
                        <div className="nutrients-list">
                            {analysis.nutrients.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>

                    <div className="result-section">
                        <h4>Health Analysis</h4>
                        <div className="health-analysis">
                            {analysis.healthAnalysis.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>

                    <div className="result-section">
                        <h4>Alternative Options</h4>
                        <div className="alternatives">
                            {analysis.alternatives.split('\n').map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodImageUpload; 