# ai_model/predict.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pickle
import os
import traceback
import numpy as np

app = Flask(__name__)
CORS(app)

# Load ML components
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
try:
    vectorizer = joblib.load(os.path.join(MODEL_DIR, 'vectorizer.pkl'))
    label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))
    model = joblib.load(os.path.join(MODEL_DIR, 'email_classifier.pkl'))
    with open(os.path.join(MODEL_DIR, 'feature_engineering.pkl'), 'rb') as f:
        create_enhanced_features = pickle.load(f)
    ML_READY = True
except Exception as e:
    print(f"[WARN] Could not load ML model: {e}")
    ML_READY = False

def categorize_email_simple(subject: str, body: str) -> str:
    """
    Simple rule-based email categorization - returns only ONE category
    """
    text = f"{subject} {body}".lower()
    
    # Keywords for each category with priority order
    meeting_keywords = [
        'meeting', 'scheduled', 'calendar', 'invite', 'confirmed', 'appointment',
        'zoom', 'call', 'demo', 'slot', 'time', 'accepted', 'confirmed'
    ]
    
    interested_keywords = [
        'interested', 'keen', 'explore', 'learn more', 'demo', 'evaluate', 
        'schedule', 'call', 'discuss', 'promising', 'next steps', 'connect',
        'details', 'pricing', 'trial', 'useful', 'fit our needs', 'documentation'
    ]
    
    not_interested_keywords = [
        'not interested', 'not a good fit', 'pass', 'decline', 'not looking',
        'budget constraints', 'no plans', 'not relevant', 'maybe later',
        'too early', 'rejecting', 'no need', 'settled', 'not moving ahead'
    ]
    
    spam_keywords = [
        'click here', 'buy now', 'limited time', 'free', 'winner', 'prize',
        'act now', 'urgent', 'make money fast', 'cheap', 'crypto', 'loan',
        'casino', 'dating', 'weight loss', 'miracle', 'suspicious'
    ]
    
    ooo_keywords = [
        'out of office', 'ooo', 'away', 'leave', 'vacation', 'afk', 'back',
        'auto-reply', 'traveling', 'unavailable', 'holiday', 'pto', 'sick',
        'offsite', 'not checking email'
    ]
    
    # Calculate scores with priority
    scores = {
        'Meeting Booked': sum(2 for keyword in meeting_keywords if keyword in text),  # Higher priority
        'Interested': sum(1 for keyword in interested_keywords if keyword in text),
        'Not Interested': sum(1 for keyword in not_interested_keywords if keyword in text),
        'Spam': sum(1 for keyword in spam_keywords if keyword in text),
        'Out of Office': sum(1 for keyword in ooo_keywords if keyword in text)
    }
    
    # Return the category with the highest score, or 'Unknown' if no matches
    if max(scores.values()) == 0:
        return 'Unknown'
    
    return max(scores, key=scores.get)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        subject = data.get("subject", "")
        body = data.get("body", "")
        text = f"{subject} {body}"
        
        if ML_READY:
            # Preprocess text for vectorizer
            processed_text = text.lower()
            X_tfidf = vectorizer.transform([processed_text])
            
            # Feature engineering
            features = create_enhanced_features(text)
            X_features = np.array([[features[k] for k in sorted(features.keys())]])
            
            # Combine features
            X_combined = np.hstack([X_tfidf.toarray(), X_features])
            
            # Get prediction probabilities
            pred_proba = model.predict_proba(X_combined)[0]
            pred_class = model.predict(X_combined)[0]
            
            # Get confidence threshold
            confidence = max(pred_proba)
            
            # Only return prediction if confidence is high enough
            if confidence > 0.3:  # Adjust threshold as needed
                label = label_encoder.inverse_transform([pred_class])[0]
            else:
                # Fallback to rule-based for low confidence
                label = categorize_email_simple(subject, body)
        else:
            label = categorize_email_simple(subject, body)
        
        return jsonify({"label": label})
        
    except Exception as e:
        print(f"Prediction error: {e}\n{traceback.format_exc()}")
        # Fallback to rule-based
        label = categorize_email_simple(subject, body)
        return jsonify({"label": label})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model_type": "ml-ensemble" if ML_READY else "rule-based"})

if __name__ == '__main__':
    print("🤖 AI Model Service starting on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)
