import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DiabetesPredictor = () => {
  const [formData, setFormData] = useState({
    HighBP: '',
    BMI: '',
    GenHlth: '',
    MentHlth: '',
    PhysHlth: '',
    Age: '',
    Education: '',
    Income: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Update the diabetesStats state
  const [diabetesStats] = useState({
    globalCases: '537M',
    annualDeaths: '6.7M',
    riskIncrease: '16%',
    preventionRate: '58%',
    descriptions: {
      globalCases: 'People Living with Diabetes Worldwide',
      annualDeaths: 'Annual Deaths from Diabetes',
      riskIncrease: 'Annual Increase in Risk',
      preventionRate: 'Cases Preventable Through Lifestyle Changes'
    }
  });

  const [bmiData, setBmiData] = useState({
    height: '',
    weight: '',
    calculatedBmi: null
  });

  const [showBmiCalculator, setShowBmiCalculator] = useState(false);

  const fieldInfo = {
    HighBP: {
      label: 'High Blood Pressure',
      description: 'Indicate if you have been diagnosed with high blood pressure (hypertension)',
      tooltip: '0 for No, 1 for Yes',
      range: 'Select Yes or No',
      validate: (value) => value === '0' || value === '1' || value === 0 || value === 1,
      options: [
        { value: '', label: 'Select an option' },
        { value: '0', label: 'No' },
        { value: '1', label: 'Yes' }
      ]
    },
    BMI: {
      label: 'Body Mass Index',
      description: 'Your Body Mass Index (BMI) - a measure of body fat based on height and weight',
      tooltip: 'Healthy BMI range is typically between 18.5 and 24.9',
      range: 'Range: 15 - 50',
      validate: (value) => value >= 15 && value <= 50
    },
    GenHlth: {
      label: 'General Health',
      description: 'Rate your general health on a scale from excellent to poor',
      tooltip: '1 = Excellent, 2 = Very Good, 3 = Good, 4 = Fair, 5 = Poor',
      range: 'Scale: 1 (Excellent) - 5 (Poor)',
      validate: (value) => value >= 1 && value <= 5,
      options: [
        { value: '', label: 'Select your general health' },
        { value: '1', label: 'Excellent' },
        { value: '2', label: 'Very Good' },
        { value: '3', label: 'Good' },
        { value: '4', label: 'Fair' },
        { value: '5', label: 'Poor' }
      ]
    },
    MentHlth: {
      label: 'Mental Health',
      description: 'Number of days in the past 30 days when your mental health was not good',
      tooltip: 'Include days affected by stress, depression, and emotional problems',
      range: 'Range: 0 - 30 days',
      validate: (value) => value >= 0 && value <= 30
    },
    PhysHlth: {
      label: 'Physical Health',
      description: 'Number of days in the past 30 days when your physical health was not good',
      tooltip: 'Include days affected by physical illness and injury',
      range: 'Range: 0 - 30 days',
      validate: (value) => value >= 0 && value <= 30
    },
    Age: {
      label: 'Age Group',
      description: 'Select your age group category',
      tooltip: 'Age groups from 18-24 (1) to 80 or older (13)',
      range: 'Categories: 1 (18-24) - 13 (80 or older)',
      validate: (value) => value >= 1 && value <= 13,
      options: [
        { value: '', label: 'Select your age group' },
        { value: '1', label: '18-24' },
        { value: '2', label: '25-29' },
        { value: '3', label: '30-34' },
        { value: '4', label: '35-39' },
        { value: '5', label: '40-44' },
        { value: '6', label: '45-49' },
        { value: '7', label: '50-54' },
        { value: '8', label: '55-59' },
        { value: '9', label: '60-64' },
        { value: '10', label: '65-69' },
        { value: '11', label: '70-74' },
        { value: '12', label: '75-79' },
        { value: '13', label: '80 or older' }
      ]
    },
    Education: {
      label: 'Education Level',
      description: 'Your highest level of education completed',
      tooltip: 'Education levels from Never attended school to College graduate',
      range: 'Levels: 1 (Never attended) - 6 (College graduate)',
      validate: (value) => value >= 1 && value <= 6,
      options: [
        { value: '', label: 'Select your education level' },
        { value: '1', label: 'Never attended school' },
        { value: '2', label: 'Elementary' },
        { value: '3', label: 'Some high school' },
        { value: '4', label: 'High school graduate' },
        { value: '5', label: 'Some college' },
        { value: '6', label: 'College graduate' }
      ]
    },
    Income: {
      label: 'Income Level',
      description: 'Your annual household income category',
      tooltip: 'Income categories from less than $10,000 to more than $75,000',
      range: 'Categories: 1 (< $10,000) - 8 (> $75,000)',
      validate: (value) => value >= 1 && value <= 8,
      options: [
        { value: '', label: 'Select your income level' },
        { value: '1', label: 'Less than $10,000' },
        { value: '2', label: '$10,000 - $15,000' },
        { value: '3', label: '$15,000 - $20,000' },
        { value: '4', label: '$20,000 - $25,000' },
        { value: '5', label: '$25,000 - $35,000' },
        { value: '6', label: '$35,000 - $50,000' },
        { value: '7', label: '$50,000 - $75,000' },
        { value: '8', label: 'More than $75,000' }
      ]
    }
  };

  const getChartData = (probability) => {
    return {
      labels: ['Risk', 'No Risk'],
      datasets: [{
        data: [probability * 100, (1 - probability) * 100],
        backgroundColor: [
          'rgba(231, 76, 60, 0.8)',
          'rgba(46, 204, 113, 0.8)'
        ],
        borderColor: [
          'rgba(231, 76, 60, 1)',
          'rgba(46, 204, 113, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  const getFeatureImportance = () => {
    const values = {
      'High Blood Pressure': parseFloat(formData.HighBP) === 1 ? 80 : 20,
      'BMI': (parseFloat(formData.BMI) > 30 ? 70 : 30),
      'General Health': (parseFloat(formData.GenHlth) / 5) * 100,
      'Age': (parseFloat(formData.Age) / 13) * 100
    };
    return Object.entries(values).sort((a, b) => b[1] - a[1]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    for (const [field, value] of Object.entries(formData)) {
      if (!value) {
        setError(`Please enter a value for ${fieldInfo[field].label}`);
        return false;
      }
      const numValue = parseFloat(value);
      if (!fieldInfo[field].validate(value) && !fieldInfo[field].validate(numValue)) {
        setError(`Invalid value for ${fieldInfo[field].label}. ${fieldInfo[field].tooltip}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setPrediction(null);
    setChartData(null);

    try {
      // Convert form data to numbers
      const requestData = {
        HighBP: parseInt(formData.HighBP),
        BMI: parseFloat(formData.BMI),
        GenHlth: parseInt(formData.GenHlth),
        MentHlth: parseInt(formData.MentHlth),
        PhysHlth: parseInt(formData.PhysHlth),
        Age: parseInt(formData.Age),
        Education: parseInt(formData.Education),
        Income: parseInt(formData.Income)
      };

      console.log('Sending data:', requestData); // Debug log

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Received response:', data); // Debug log
      
      if (response.ok) {
        setPrediction(data.prediction);
        setChartData(getChartData(data.probability || 0.5));
      } else {
        setError(data.error || 'Failed to get prediction');
      }
    } catch (err) {
      console.error('Error:', err); // Debug log
      setError('Failed to connect to the server. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (e) => {
    e.preventDefault();
    if (bmiData.height && bmiData.weight) {
      const heightInMeters = bmiData.height / 100;
      const bmi = (bmiData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setBmiData(prev => ({ ...prev, calculatedBmi: bmi }));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="side-image left"></div>

      <div className="main-content">
        <div className="container">
          <h2>Diabetes Risk Assessment</h2>
          <p className="developer-credit">Developed by Sriram Reddy</p>
          <p className="form-description">
            This tool helps assess your risk of diabetes based on various health factors. 
            Please fill in the information below for an accurate assessment.
          </p>
          
          {/* Diabetes Information Section */}
          <section className="info-section">
            <h3>Important Note</h3>
            <div className="note-content">
              <p>This assessment tool is for informational purposes only and should not replace professional medical advice. 
              Please consult with a healthcare provider for proper diagnosis and treatment.</p>
            </div>
          </section>

          {/* Real-time Statistics */}
          <section className="realtime-data">
            <h3>Global Impact of Diabetes</h3>
            <div className="data-grid">
              <div className="data-card">
                <div className="data-value">{diabetesStats.globalCases}</div>
                <div className="data-label">{diabetesStats.descriptions.globalCases}</div>
              </div>
              <div className="data-card">
                <div className="data-value">{diabetesStats.annualDeaths}</div>
                <div className="data-label">{diabetesStats.descriptions.annualDeaths}</div>
              </div>
              <div className="data-card">
                <div className="data-value">{diabetesStats.riskIncrease}</div>
                <div className="data-label">{diabetesStats.descriptions.riskIncrease}</div>
              </div>
              <div className="data-card">
                <div className="data-value">{diabetesStats.preventionRate}</div>
                <div className="data-label">{diabetesStats.descriptions.preventionRate}</div>
              </div>
            </div>
          </section>

          <section className="bmi-calculator-section">
            <h3>BMI Calculator</h3>
            <div className="bmi-calculator">
              <form onSubmit={calculateBMI}>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    value={bmiData.height}
                    onChange={(e) => setBmiData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="Enter height in centimeters"
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={bmiData.weight}
                    onChange={(e) => setBmiData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Enter weight in kilograms"
                  />
                </div>
                <button type="submit" className="calculate-button">Calculate BMI</button>
              </form>
              {bmiData.calculatedBmi && (
                <div className="bmi-result">
                  <h4>Your BMI: {bmiData.calculatedBmi}</h4>
                  <div className="bmi-category">
                    {bmiData.calculatedBmi < 18.5 ? 'Underweight' :
                     bmiData.calculatedBmi < 25 ? 'Normal weight' :
                     bmiData.calculatedBmi < 30 ? 'Overweight' : 'Obese'}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="risk-factors-section">
            <h3>Understanding Diabetes Risk Factors</h3>
            <div className="risk-factors-grid">
              <div className="risk-factor-card">
                <h4>Modifiable Risk Factors</h4>
                <ul>
                  <li>Obesity and overweight</li>
                  <li>Physical inactivity</li>
                  <li>Unhealthy diet</li>
                  <li>Smoking</li>
                  <li>High blood pressure</li>
                </ul>
              </div>
              <div className="risk-factor-card">
                <h4>Non-Modifiable Risk Factors</h4>
                <ul>
                  <li>Family history</li>
                  <li>Age</li>
                  <li>Race/Ethnicity</li>
                  <li>Gestational diabetes history</li>
                  <li>Polycystic ovary syndrome</li>
                </ul>
              </div>
              <div className="risk-factor-card">
                <h4>Early Warning Signs</h4>
                <ul>
                  <li>Frequent urination</li>
                  <li>Excessive thirst</li>
                  <li>Unexpected weight loss</li>
                  <li>Increased hunger</li>
                  <li>Fatigue and irritability</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="progress-tracking-section">
            <h3>Health Progress Tracking</h3>
            <div className="progress-grid">
              <div className="progress-card">
                <h4>Blood Sugar Monitoring</h4>
                <div className="progress-chart">
                  <div className="chart-placeholder">Blood Sugar Chart</div>
                </div>
                <p>Track your blood sugar levels over time</p>
              </div>
              <div className="progress-card">
                <h4>Weight Management</h4>
                <div className="progress-chart">
                  <div className="chart-placeholder">Weight Chart</div>
                </div>
                <p>Monitor your weight changes</p>
              </div>
              <div className="progress-card">
                <h4>Physical Activity</h4>
                <div className="progress-chart">
                  <div className="chart-placeholder">Activity Chart</div>
                </div>
                <p>Track your daily exercise</p>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="section-fields">
                <div className="form-group">
                  <label>
                    {fieldInfo.Age.label}
                    <span className="tooltip" data-tooltip={fieldInfo.Age.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.Age.description}</p>
                  <select
                    name="Age"
                    value={formData.Age}
                    onChange={handleChange}
                    className="input"
                  >
                    {fieldInfo.Age.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="field-range">{fieldInfo.Age.range}</div>
                </div>
                <div className="form-group">
                  <label>
                    {fieldInfo.Education.label}
                    <span className="tooltip" data-tooltip={fieldInfo.Education.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.Education.description}</p>
                  <select
                    name="Education"
                    value={formData.Education}
                    onChange={handleChange}
                    className="input"
                  >
                    {fieldInfo.Education.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="field-range">{fieldInfo.Education.range}</div>
                </div>
                <div className="form-group">
                  <label>
                    {fieldInfo.Income.label}
                    <span className="tooltip" data-tooltip={fieldInfo.Income.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.Income.description}</p>
                  <select
                    name="Income"
                    value={formData.Income}
                    onChange={handleChange}
                    className="input"
                  >
                    {fieldInfo.Income.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="field-range">{fieldInfo.Income.range}</div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Health Metrics</h3>
              <div className="section-fields">
                <div className="form-group">
                  <label>
                    {fieldInfo.HighBP.label}
                    <span className="tooltip" data-tooltip={fieldInfo.HighBP.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.HighBP.description}</p>
                  <select
                    name="HighBP"
                    value={formData.HighBP}
                    onChange={handleChange}
                    className="input"
                  >
                    {fieldInfo.HighBP.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="field-range">{fieldInfo.HighBP.range}</div>
                </div>
                <div className="form-group">
                  <label>
                    {fieldInfo.BMI.label}
                    <span className="tooltip" data-tooltip={fieldInfo.BMI.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.BMI.description}</p>
                  <input
                    type="number"
                    name="BMI"
                    value={formData.BMI}
                    onChange={handleChange}
                    min="15"
                    max="50"
                    step="0.1"
                  />
                  <div className="field-range">{fieldInfo.BMI.range}</div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Health Status</h3>
              <div className="section-fields">
                <div className="form-group">
                  <label>
                    {fieldInfo.GenHlth.label}
                    <span className="tooltip" data-tooltip={fieldInfo.GenHlth.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.GenHlth.description}</p>
                  <select
                    name="GenHlth"
                    value={formData.GenHlth}
                    onChange={handleChange}
                    className="input"
                  >
                    {fieldInfo.GenHlth.options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="field-range">{fieldInfo.GenHlth.range}</div>
                </div>
                <div className="form-group">
                  <label>
                    {fieldInfo.MentHlth.label}
                    <span className="tooltip" data-tooltip={fieldInfo.MentHlth.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.MentHlth.description}</p>
                  <input
                    type="number"
                    name="MentHlth"
                    value={formData.MentHlth}
                    onChange={handleChange}
                    min="0"
                    max="30"
                  />
                  <div className="field-range">{fieldInfo.MentHlth.range}</div>
                </div>
                <div className="form-group">
                  <label>
                    {fieldInfo.PhysHlth.label}
                    <span className="tooltip" data-tooltip={fieldInfo.PhysHlth.tooltip}>?</span>
                  </label>
                  <p className="field-description">{fieldInfo.PhysHlth.description}</p>
                  <input
                    type="number"
                    name="PhysHlth"
                    value={formData.PhysHlth}
                    onChange={handleChange}
                    min="0"
                    max="30"
                  />
                  <div className="field-range">{fieldInfo.PhysHlth.range}</div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  Predicting...
                </>
              ) : 'Predict Risk'}
            </button>

            {error && (
              <div className="error-container">
                <p className="error">{error}</p>
              </div>
            )}

            {prediction !== null && (
              <div className={`result-container ${prediction === 1 ? 'warning' : 'success'}`}>
                <h3 className="prediction-text">
                  {prediction === 1 
                    ? 'Higher Risk of Diabetes Detected' 
                    : 'Lower Risk of Diabetes Detected'}
                </h3>
                
                <div className="visualization-container">
                  {chartData && (
                    <div className="chart-container">
                      <Doughnut 
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="feature-importance">
                    <h4>Key Risk Factors</h4>
                    {getFeatureImportance().map(([feature, value]) => (
                      <div key={feature} className="feature-bar">
                        <div className="feature-label">
                          <span>{feature}</span>
                          <span>{Math.round(value)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress" 
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Tips Section */}
          <section className="tips-section">
            <h3>Prevention Guidelines</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>Diet & Nutrition</h4>
                <ul>
                  <li>Choose whole grains over refined grains</li>
                  <li>Include lean proteins in your diet</li>
                  <li>Eat plenty of vegetables</li>
                  <li>Limit sugary beverages</li>
                  <li>Practice portion control</li>
                </ul>
              </div>
              <div className="tip-card">
                <h4>Physical Activity</h4>
                <ul>
                  <li>Exercise for 30 minutes daily</li>
                  <li>Take regular walking breaks</li>
                  <li>Use stairs instead of elevators</li>
                  <li>Join fitness classes</li>
                  <li>Stay active throughout the day</li>
                </ul>
              </div>
              <div className="tip-card">
                <h4>Lifestyle Changes</h4>
                <ul>
                  <li>Maintain a healthy weight</li>
                  <li>Get adequate sleep</li>
                  <li>Manage stress levels</li>
                  <li>Regular health check-ups</li>
                  <li>Quit smoking</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="side-image right"></div>
    </div>
  );
};

export default DiabetesPredictor;