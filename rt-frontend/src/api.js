import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Update if Laravel is on a different port
});

export default api;
