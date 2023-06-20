import axios from 'axios';

// Create an instance of axios with the CORS headers
const corsAxios = axios.create({
  baseURL: 'http://example.com', // Replace with the server URL you want to make requests to
  headers: {
    'Access-Control-Allow-Origin': '*', // Allow requests from all origins
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE', // Specify the allowed HTTP methods
    'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Specify the allowed headers
  },
});

export default corsAxios;
