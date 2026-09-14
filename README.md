# NYC House Type Predictor

A full-stack machine learning application that predicts the room type for a New York City Airbnb listing based on listing attributes such as location, price, availability, and review statistics.

This project combines a FastAPI backend with a responsive frontend interface so users can input listing details and receive a prediction in real time.

## Live Deployment

- Backend API: https://nyc-housetype-predictor.onrender.com
- Frontend App: https://nyc-housetype-predictor-1.onrender.com

## Overview

The NYC House Type Predictor uses a trained scikit-learn pipeline to classify listings into one of the following categories:

- Entire home/apt
- Private room
- Shared room

The model is served through an API and integrated with a polished web UI that allows users to enter listing information and instantly review prediction confidence scores.

## Features

- Real-time room type prediction via REST API
- Clean, user-friendly web interface
- Input validation for listing fields
- CORS-enabled FastAPI backend
- Probability output for each room type class
- Example listing presets for quick testing

## Tech Stack

- Python
- FastAPI
- scikit-learn
- pandas
- joblib
- HTML / CSS / JavaScript

## Project Structure

```text
NYC_HouseType_Predictor/
├── main.py                  # FastAPI application and prediction API
├── index.html               # Frontend layout
├── style.css                # Styling for the web app
├── script.js                # Client-side logic for form submission and UI updates
├── pyproject.toml           # Project metadata and Python dependencies
├── README.md                # Project documentation
├── src/
│   └── nyc_housetype_predictor/
│       └── __init__.py
└── Model_Pipeline.pkl       # Trained model pipeline (runtime dependency)
```

## Model Behavior

The model predicts room type from listing features including:

- latitude and longitude
- price
- minimum nights
- review count
- reviews per month
- host listing count
- yearly availability
- borough and neighbourhood

The prediction endpoint returns:

- the predicted room type
- the probability scores for each class

## Getting Started

### Prerequisites

- Python 3.12+
- pip or uv

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/NYC_HouseType_Predictor.git
cd NYC_HouseType_Predictor
```

2. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```bash
pip install -e .
```

## Running the Application

### Local Development

Start the backend API:

```bash
uvicorn main:app --reload
```

Then open the frontend in a browser:

```text
index.html
```

### Deployed Services

- Backend: https://nyc-housetype-predictor.onrender.com
- Frontend: https://nyc-housetype-predictor-1.onrender.com

The frontend is designed to call the deployed or local FastAPI API, allowing users to test predictions through the browser UI.

## API Endpoints

### GET /

Returns a basic health welcome message.

### GET /health

Returns the API health status.

```json
{
  "status": "healthy"
}
```

### POST /predict

Predicts the room type for a listing based on the submitted feature object.

Example request body:

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "price": 150,
  "minimum_nights": 3,
  "number_of_reviews": 24,
  "reviews_per_month": 1.2,
  "calculated_host_listings_count": 1,
  "availability_365": 180,
  "neighbourhood_group": "Manhattan",
  "neighbourhood": "Midtown"
}
```

Example response:

```json
{
  "Predicted_room_type": "Private room",
  "Probability": [0.12, 0.78, 0.10]
}
```

## Example Usage

The UI includes preset example listings for quick testing, and users can also manually fill in values for a custom prediction.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Author

Aarush Rawat

## Notes

This project is designed as a practical machine learning and web application demo for NYC Airbnb listing classification, combining predictive modeling with an interactive user interface to make predictions easy to understand and use.
