import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Food.css";

const Food = () => {
  const [foodData, setFoodData] = useState({
    foodItem: "",
    weight: "",
  });
  const [userData, setUserData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("text"); // 'text' or 'image'

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            "http://localhost:5174/user/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoodData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5174/api/analyze-food",
        {
          foodItem: foodData.foodItem,
          weight: foodData.weight,
          userData: {
            age: userData?.age || null,
            weight: userData?.weight || null,
            healthProblems: userData?.healthProblems || "",
          },
        }
      );

      if (response.data.error) {
        setResult({
          error: response.data.error,
        });
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      setResult({
        error:
          error.response?.data?.error ||
          "Failed to analyze food. Please try again.",
      });
    }
    setLoading(false);
  };

  const getHealthStatus = (calories, healthAnalysis) => {
    // Default status
    let status = {
      label: "Moderate",
      color: "#EAB308", // Yellow
      description: "Consume in moderation",
    };

    // Convert calories to number if it's a string
    const calorieNum =
      typeof calories === "number"
        ? calories
        : parseInt(calories.match(/\d+/)?.[0] || "0");

    // Check health analysis text for keywords
    const analysisText = healthAnalysis.toLowerCase();
    const hasHealthIssues =
      analysisText.includes("diabetes") ||
      analysisText.includes("blood pressure") ||
      analysisText.includes("cholesterol");

    if (hasHealthIssues && calorieNum > 300) {
      status = {
        label: "Caution",
        color: "#DC2626", // Red
        description: "Monitor portion size",
      };
    } else if (
      analysisText.includes("healthy") ||
      analysisText.includes("nutritious") ||
      analysisText.includes("beneficial")
    ) {
      status = {
        label: "Healthy",
        color: "#22C55E", // Green
        description: "Good nutritional value",
      };
    } else if (calorieNum > 500) {
      status = {
        label: "High Calorie",
        color: "#DC2626", // Red
        description: "Consider smaller portion",
      };
    } else if (calorieNum < 100) {
      status = {
        label: "Light",
        color: "#22C55E", // Green
        description: "Good for snacking",
      };
    }

    return status;
  };

  const renderCalorieChart = (calories) => {
    // Extract numeric value from calories string using a more robust regex
    let calorieValue = 0;
    if (typeof calories === "string") {
      // Match a range or a single value
      const rangeMatch = calories.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        calorieValue = Math.round(
          (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2
        );
      } else {
        const singleMatch = calories.match(/(\d+)/);
        calorieValue = singleMatch ? parseInt(singleMatch[1]) : 0;
      }
    } else if (typeof calories === "number") {
      calorieValue = calories;
    }

    // Calculate percentage for circle (assuming 2500 as daily recommended value)
    const percentage = Math.min((calorieValue / 2500) * 100, 100);

    // Calculate circle properties
    const radius = 85; // Slightly smaller than viewBox/2
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const healthStatus = getHealthStatus(
      calorieValue,
      result.healthAnalysis || ""
    );

    return (
      <div className="calorie-chart">
        <div
          className="health-status"
          style={{ backgroundColor: healthStatus.color }}
        >
          <span className="health-status-label">{healthStatus.label}</span>
        </div>
        <svg className="calorie-circle" viewBox="0 0 200 200">
          <circle className="calorie-circle-bg" cx="100" cy="100" r={radius} />
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
          <p className="daily-value-text">
            {Math.round(percentage)}% of daily value
          </p>
          <p className="health-description">{healthStatus.description}</p>
        </div>
      </div>
    );
  };

  const extractMacros = (nutrients) => {
    const macros = {
      protein: "0g",
      carbs: "0g",
      fat: "0g",
    };

    if (nutrients) {
      const lines = nutrients.split("\n");
      lines.forEach((line) => {
        const lowerLine = line.toLowerCase().trim();

        // Extract numbers and unit (e.g., "20-25g" or "20g" or "20 g")
        const extractValue = (text) => {
          const match = text.match(/(\d+)(?:\s*-\s*(\d+))?\s*g/);
          if (match) {
            if (match[2]) {
              // If range (e.g., "20-25g"), take average
              return (
                Math.round((parseInt(match[1]) + parseInt(match[2])) / 2) + "g"
              );
            }
            return match[1] + "g";
          }
          return "0g";
        };

        if (lowerLine.includes("protein")) {
          macros.protein = extractValue(lowerLine);
        }
        if (lowerLine.includes("carb")) {
          macros.carbs = extractValue(lowerLine);
        }
        if (lowerLine.includes("fat")) {
          macros.fat = extractValue(lowerLine);
        }
      });
    }

    // Convert the object to an array of objects
    return [
      { name: "Protein", value: macros.protein },
      { name: "Carbohydrates", value: macros.carbs },
      { name: "Fat", value: macros.fat },
    ];
  };

  const renderResult = () => {
    if (loading) {
      return (
        <div className="loading-spinner">
          <p>Analyzing food...</p>
        </div>
      );
    }

    if (!result) return null;

    if (result.error) {
      return <div className="error-message">{result.error}</div>;
    }

    // Extract numeric value from calories string
    let calorieValue = 0;
    if (typeof result.calories === "string") {
      const rangeMatch = result.calories.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        calorieValue = Math.round(
          (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2
        );
      } else {
        const singleMatch = result.calories.match(/(\d+)/);
        calorieValue = singleMatch ? parseInt(singleMatch[1]) : 0;
      }
    } else if (typeof result.calories === "number") {
      calorieValue = result.calories;
    }

    // Calculate percentage for circle (assuming 2500 as daily recommended value)
    const percentage = Math.min((calorieValue / 2500) * 100, 100);
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Extract macros
    const macros = extractMacros(result.nutrients);

    return (
      <div>
        <div className="analysis-title">Analysis Results</div>
        <div className="result-container">
          {/* Calorie Box */}
          <div className="result-box">
            <h3>Calories</h3>
            <div className="calorie-chart">
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
            </div>
            <div className="macro-stats">
              {macros.map((macro, index) => (
                <div key={index} className="macro-stat">
                  <p className="macro-value">{macro.value}</p>
                  <p className="macro-label">{macro.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Box */}
          <div className="result-box">
            <h3>Nutritional Details</h3>
            <div className="nutrition-list">
              {result.nutrients.split("\n").map(
                (nutrient, index) =>
                  nutrient.trim() && (
                    <div key={index} className="nutrition-item">
                      {nutrient.trim()}
                    </div>
                  )
              )}
            </div>
          </div>

          {/* Health Analysis Box */}
          <div className="result-box">
            <h3>Health Analysis</h3>
            <div className="analysis-content">
              {result.healthAnalysis
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => (
                  <p key={index}>{line.trim()}</p>
                ))}
            </div>
          </div>

          {/* Alternatives Box */}
          <div className="result-box">
            <h3>Alternatives</h3>
            <div className="analysis-content">
              {result.alternatives
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => (
                  <p key={index}>{line.trim()}</p>
                ))}
            </div>
          </div>
        </div>
        {!result.error && (
          <div className="eat-button-wrapper">
            <button className="eat-btn" onClick={handleEat}>
              Eat
            </button>
          </div>
        )}
      </div>
    );
  };

  // Add Eat button handler
  const handleEat = async () => {
    if (!result || !result.calories) return;
    // Extract calorie value as in renderCalorieChart
    let calorieValue = 0;
    if (typeof result.calories === "string") {
      const rangeMatch = result.calories.match(/(\d+)\s*-\s*(\d+)/);
      if (rangeMatch) {
        calorieValue = Math.round(
          (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2
        );
      } else {
        const singleMatch = result.calories.match(/(\d+)/);
        calorieValue = singleMatch ? parseInt(singleMatch[1]) : 0;
      }
    } else if (typeof result.calories === "number") {
      calorieValue = result.calories;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to record your calorie intake");
        return;
      }
      await axios.post(
        "http://localhost:5174/api/calorie/intake",
        {
          foodName: foodData.foodItem,
          calories: calorieValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Calorie intake recorded!");
      // Optionally: trigger dashboard update here (e.g., via context or event)
      window.location.reload(); // Simple way to update dashboard
    } catch (error) {
      alert("Failed to record calorie intake.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add("dragging");
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove("dragging");
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await axios.post(
        "http://localhost:5174/api/analyze-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.error) {
        setResult({
          error: response.data.error,
        });
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult({
        error:
          error.response?.data?.error ||
          "Failed to analyze image. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="food-container">
      <div className="food-card">
        <h2>Calculate Food Calories</h2>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "text" ? "active" : ""}`}
            onClick={() => setActiveTab("text")}
          >
            Text Input
          </button>
          <button
            className={`tab-button ${activeTab === "image" ? "active" : ""}`}
            onClick={() => setActiveTab("image")}
          >
            Image Upload
          </button>
        </div>

        {/* Text Input Form */}
        {activeTab === "text" && (
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

            <button type="submit" className="calculate-btn" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Food"}
            </button>
          </form>
        )}

        {/* Image Upload Section */}
        {activeTab === "image" && (
          <div className="image-upload-section">
            <div
              className="drop-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
                style={{ display: "none" }}
              />
              {!previewUrl ? (
                <div className="upload-prompt">
                  <p>Drag & drop an image here or</p>
                  <button
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="preview-container">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button className="remove-image-btn" onClick={removeImage}>
                    Remove Image
                  </button>
                </div>
              )}
            </div>
            <button
              className="analyze-image-btn"
              onClick={handleImageAnalysis}
              disabled={!selectedImage || loading}
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">Analyzing your food...</div>
        )}

        {result && !loading && (
          <div className="result-container">
            {/* <h3>Analysis Results</h3> */}
            {renderResult()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Food;
