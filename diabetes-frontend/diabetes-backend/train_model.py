import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Create synthetic data for testing
np.random.seed(42)
n_samples = 1000

# Generate synthetic features
data = {
    'HighBP': np.random.randint(0, 2, n_samples),
    'BMI': np.random.uniform(18.5, 40, n_samples),
    'GenHlth': np.random.randint(1, 6, n_samples),
    'MentHlth': np.random.randint(0, 31, n_samples),
    'PhysHlth': np.random.randint(0, 31, n_samples),
    'Age': np.random.randint(18, 100, n_samples),
    'Education': np.random.randint(1, 7, n_samples),
    'Income': np.random.randint(1, 9, n_samples)
}

# Create feature matrix X
X = np.column_stack([data[feature] for feature in data.keys()])

# Generate synthetic target (diabetes prediction)
# Higher chance of diabetes with high BMI, high blood pressure, poor health, and older age
y = (data['HighBP'] + 
     (data['BMI'] > 30).astype(int) + 
     (data['GenHlth'] > 3).astype(int) + 
     (data['Age'] > 50).astype(int)) >= 2

# Train a Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Create model directory if it doesn't exist
os.makedirs('model', exist_ok=True)

# Save the model
model_path = os.path.join('model', 'diabetes_model.joblib')
joblib.dump(model, model_path)

print(f"Model saved to {model_path}") 