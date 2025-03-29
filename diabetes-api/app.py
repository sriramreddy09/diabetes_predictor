from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load the trained ML model
model = pickle.load(open("diabetes_model.pkl", "rb"))

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    df = pd.DataFrame([data])
    prediction = model.predict(df)
    probability = model.predict_proba(df)[:, 1] 

    return jsonify({
        "prediction": int(prediction[0]),
        "probability": float(probability[0])
    })

if __name__ == "__main__":
    app.run(debug=True)

    from flask_cors import CORS

app = Flask(__name__)
CORS(app)
