# Email Management System

A comprehensive email management system with AI-powered classification, real-time notifications, and a modern web interface.

## Features

- **AI Email Classification**: Machine learning model to categorize emails as interested/not interested
- **Real-time Notifications**: Slack and webhook notifications for important emails
- **Modern Web Interface**: React-based frontend with search and filtering capabilities
- **Email Integration**: IMAP client for fetching emails from multiple accounts
- **Search & Filter**: Advanced search functionality with category-based filtering
- **Responsive Design**: Mobile-friendly interface with modern UI/UX

## Screenshots

### 📧 Main Email Interface
![Main Email Interface](./screenshots/main-interface.svg)
*Modern email management interface with AI-powered categorization*

### 🔍 Search and Filtering
![Search and Filtering](./screenshots/search-filter.svg)
*Advanced search functionality with category-based filtering*

### 📊 Email Analytics Dashboard
![Analytics Dashboard](./screenshots/analytics-dashboard.svg)
*Real-time email analytics and statistics*

## Project Structure

```
├── ai_model/          # AI/ML components
│   ├── data/         # Training data
│   ├── models/       # Trained models
│   └── train_model.py # Model training script
├── backend/          # Node.js/TypeScript backend
│   ├── src/
│   │   ├── api/      # API endpoints
│   │   ├── email/    # Email handling
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utilities
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   └── services/   # API services
└── docker-compose.yml # Docker configuration
```

## Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for API endpoints
- **IMAP** for email fetching
- **Elasticsearch** for search functionality
- **Axios** for HTTP requests

### Frontend
- **React** with TypeScript
- **CSS** for styling
- **Axios** for API communication

### AI/ML
- **Python** with scikit-learn
- **Pickle** for model serialization
- **Pandas** for data manipulation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.7+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd NEWASSIGNMENT
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Install AI model dependencies**
   ```bash
   cd ../ai_model
   pip install -r requirements.txt
   ```

### Configuration

1. **Backend Configuration**
   - Update email account settings in `backend/src/config/accounts.ts`
   - Configure Slack webhook in `backend/src/utils/notification.ts`

2. **AI Model Training**
   ```bash
   cd ai_model
   python train_model.py
   ```

### Running the Application

1. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

- `GET /api/emails` - Fetch emails
- `POST /api/search` - Search emails
- `GET /api/categories` - Get email categories

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository. 