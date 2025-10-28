# Frontend Environment Variables Setup

Create a `.env` file in your frontend directory with the following variables:

```env
# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id

# API Base URL
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development
```

## Setup Instructions:

1. Get your Razorpay Key ID from the Razorpay Dashboard
2. Add it to your `.env` file as `REACT_APP_RAZORPAY_KEY_ID`
3. Make sure the API URL matches your backend server URL
4. Restart your React development server after adding environment variables

## Important Notes:
- Environment variables in React must start with `REACT_APP_`
- Never commit the `.env` file to version control
- Use test keys for development and live keys for production
