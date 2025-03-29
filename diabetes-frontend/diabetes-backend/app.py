from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os
import pickle
import pandas as pd
import warnings

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Suppress XGBoost version warnings
warnings.filterwarnings('ignore', category=UserWarning)

# Load the trained model
model_path = os.path.join(os.path.dirname(__file__), 'model', 'diabetes_model.pkl')

try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please check server logs.'
        }), 500

    try:
        # Get the data from the request
        data = request.get_json()
        print("Received data:", data)  # Debug log
        
        # Extract features
        features = [
            float(data.get('HighBP', 0)),
            float(data.get('BMI', 0)),
            float(data.get('GenHlth', 0)),
            float(data.get('MentHlth', 0)),
            float(data.get('PhysHlth', 0)),
            float(data.get('Age', 0)),
            float(data.get('Education', 0)),
            float(data.get('Income', 0))
        ]
        
        print("Processed features:", features)  # Debug log
        
        # Make prediction
        features_array = np.array(features).reshape(1, -1)
        prediction = model.predict(features_array)[0]
        probability = model.predict_proba(features_array)[0][1]
        
        print(f"Prediction: {prediction}, Probability: {probability}")  # Debug log
        
        return jsonify({
            'prediction': int(prediction),
            'probability': float(probability)
        })
        
    except Exception as e:
        print(f"Error during prediction: {e}")  # Debug log
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000) 