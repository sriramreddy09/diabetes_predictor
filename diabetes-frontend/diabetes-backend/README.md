# Diabetes Prediction Backend

This is the backend service for the Diabetes Prediction application. It provides a REST API endpoint for making diabetes predictions using a machine learning model.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Place your trained model file:
- Create a `model` directory in the project root
- Place your trained model file as `diabetes_model.joblib` in the `model` directory

## Running the Server

```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

### POST /predict
Makes a diabetes prediction based on input features.

Request body:
```json
{
    "HighBP": 0,
    "BMI": 25.0,
    "GenHlth": 3,
    "MentHlth": 5,
    "PhysHlth": 5,
    "Age": 45,
    "Education": 4,
    "Income": 6
}
```

Response:
```json
{
    "prediction": true,
    "probability": 0.85
}
```

### GET /health
Health check endpoint.

Response:
```json
{
    "status": "healthy",
    "model_loaded": true
}
```

## Model Features

The model expects the following features:
- HighBP: High Blood Pressure (0 or 1)
- BMI: Body Mass Index (10-50)
- GenHlth: General Health (1-5)
- MentHlth: Mental Health (0-30)
- PhysHlth: Physical Health (0-30)
- Age: Age in years (18-100)
- Education: Education level (1-6)
- Income: Income level (1-8) 