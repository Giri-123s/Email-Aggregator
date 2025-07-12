import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import joblib
import os

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

# Create models directory
os.makedirs('models', exist_ok=True)

def preprocess_text(text):
    """Enhanced text preprocessing"""
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters but keep important ones
    text = re.sub(r'[^\w\s@#$%&*]', ' ', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [token for token in tokens if token not in stop_words and len(token) > 2]
    
    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    
    return ' '.join(tokens)

def create_enhanced_features(text):
    """Create additional features for better classification"""
    features = {}
    
    # Text length features
    features['char_count'] = len(text)
    features['word_count'] = len(text.split())
    features['avg_word_length'] = np.mean([len(word) for word in text.split()]) if text.split() else 0
    
    # Email-specific features
    features['has_url'] = 1 if 'http' in text or 'www' in text else 0
    features['has_email'] = 1 if '@' in text else 0
    features['has_phone'] = 1 if re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', text) else 0
    features['has_date'] = 1 if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text) else 0
    
    # Keyword density features
    meeting_words = ['meeting', 'schedule', 'calendar', 'invite', 'appointment', 'zoom', 'call', 'demo']
    interested_words = ['interested', 'keen', 'explore', 'learn', 'demo', 'evaluate', 'connect']
    not_interested_words = ['not interested', 'pass', 'decline', 'not looking', 'budget', 'no plans']
    spam_words = ['click', 'buy now', 'free', 'winner', 'prize', 'urgent', 'act now']
    ooo_words = ['out of office', 'ooo', 'away', 'leave', 'vacation', 'afk', 'auto-reply']
    
    features['meeting_score'] = sum(1 for word in meeting_words if word in text.lower())
    features['interested_score'] = sum(1 for word in interested_words if word in text.lower())
    features['not_interested_score'] = sum(1 for word in not_interested_words if word in text.lower())
    features['spam_score'] = sum(1 for word in spam_words if word in text.lower())
    features['ooo_score'] = sum(1 for word in ooo_words if word in text.lower())
    
    return features

# Load and enhance the dataset
print("Loading and preprocessing data...")
data = pd.read_csv("data/emails.csv")

# Combine subject and body
data['text'] = data['subject'] + " " + data['body']

# Preprocess text
data['processed_text'] = data['text'].apply(preprocess_text)

# Create enhanced features
feature_data = []
for text in data['text']:
    features = create_enhanced_features(text)
    feature_data.append(features)

feature_df = pd.DataFrame(feature_data)
data = pd.concat([data, feature_df], axis=1)

# Prepare features
X_text = data['processed_text']
X_features = data[['char_count', 'word_count', 'avg_word_length', 'has_url', 'has_email', 
                   'has_phone', 'has_date', 'meeting_score', 'interested_score', 
                   'not_interested_score', 'spam_score', 'ooo_score']]

# Encode labels
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(data['label'])

# Split the dataset
X_text_train, X_text_test, X_features_train, X_features_test, y_train, y_test = train_test_split(
    X_text, X_features, y, test_size=0.2, random_state=42, stratify=y
)

print("Training models...")

# 1. TF-IDF + Logistic Regression
tfidf_vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X_tfidf_train = tfidf_vectorizer.fit_transform(X_text_train)
X_tfidf_test = tfidf_vectorizer.transform(X_text_test)

lr_model = LogisticRegression(max_iter=1000, random_state=42)
lr_model.fit(X_tfidf_train, y_train)

# 2. Random Forest on engineered features
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_features_train, y_train)

# 3. Ensemble model
ensemble_model = VotingClassifier(
    estimators=[
        ('lr', lr_model),
        ('rf', rf_model)
    ],
    voting='soft'
)

# Train ensemble on combined features
X_combined_train = np.hstack([X_tfidf_train.toarray(), X_features_train])
X_combined_test = np.hstack([X_tfidf_test.toarray(), X_features_test])

ensemble_model.fit(X_combined_train, y_train)

# Evaluate models
print("\n=== Model Evaluation ===")

# Logistic Regression
y_pred_lr = lr_model.predict(X_tfidf_test)
lr_accuracy = accuracy_score(y_test, y_pred_lr)
print(f"Logistic Regression Accuracy: {lr_accuracy:.4f}")

# Random Forest
y_pred_rf = rf_model.predict(X_features_test)
rf_accuracy = accuracy_score(y_test, y_pred_rf)
print(f"Random Forest Accuracy: {rf_accuracy:.4f}")

# Ensemble
y_pred_ensemble = ensemble_model.predict(X_combined_test)
ensemble_accuracy = accuracy_score(y_test, y_pred_ensemble)
print(f"Ensemble Model Accuracy: {ensemble_accuracy:.4f}")

# Cross-validation
cv_scores = cross_val_score(ensemble_model, X_combined_train, y_train, cv=5)
print(f"Cross-validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")

# Detailed classification report
print("\n=== Classification Report ===")
y_pred_labels = label_encoder.inverse_transform(y_pred_ensemble)
y_test_labels = label_encoder.inverse_transform(y_test)
print(classification_report(y_test_labels, y_pred_labels))

# Save models and components
print("\nSaving models...")
joblib.dump(tfidf_vectorizer, 'models/vectorizer.pkl')
joblib.dump(label_encoder, 'models/label_encoder.pkl')
joblib.dump(ensemble_model, 'models/email_classifier.pkl')

# Save feature engineering function
import pickle
with open('models/feature_engineering.pkl', 'wb') as f:
    pickle.dump(create_enhanced_features, f)

print("✅ Models saved successfully!")
print(f"Best model accuracy: {ensemble_accuracy:.4f}")
