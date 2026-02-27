// src/config.js
const config = {
  development: {
    API_URL: 'http://127.0.0.1:5000'
  },
  production: {
    API_URL: process.env.REACT_APP_API_URL
  }
};

const environment = process.env.NODE_ENV || 'development';
export default config[environment];
