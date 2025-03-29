document.getElementById("predictionForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const bmi = document.getElementById("bmi").value;
    const bloodPressure = document.getElementById("bloodPressure").value;
    const glucose = document.getElementById("glucose").value;

    const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "BMI": parseFloat(bmi),
            "BloodPressure": parseFloat(bloodPressure),
            "Glucose": parseFloat(glucose)
        })
    });

    const data = await response.json();
    document.getElementById("result").innerHTML = `<p>Prediction: ${data.prediction}</p>`;
});
