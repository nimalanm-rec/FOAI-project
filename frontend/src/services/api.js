/**
 * API Service Client
 * Centralized Axios communication layer connecting React to Flask backend.
 */

import axios from 'axios';

// Create Axios client with configurable base URL (defaulting to relative /api using Vite proxy)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'An unexpected error occurred while communicating with the server.';
    let validationErrors = null;

    if (error.response) {
      const data = error.response.data;
      if (data && data.error) {
        message = data.error;
      }
      if (data && data.validation_errors) {
        validationErrors = data.validation_errors;
      }
    } else if (error.request) {
      message = 'Backend server is unreachable. Please verify that the Flask server is running on port 5000.';
    }

    return Promise.reject({
      message,
      validationErrors,
      status: error.response?.status,
      originalError: error,
    });
  }
);

export const apiService = {
  // System Health
  getHealth: () => apiClient.get('/health'),

  // Initial Assessment
  assessApplicant: (applicantData) => apiClient.post('/assess', applicantData),

  // What-If Simulation
  simulateScenario: (baseline, modified) => apiClient.post('/simulate', { baseline, modified }),

  // Loan Comparison
  compareScenarios: (applicant, scenarios) => apiClient.post('/compare', { applicant, scenarios }),

  // History
  getHistory: () => apiClient.get('/assessments'),
  getAssessmentById: (id) => apiClient.get(`/assessments/${id}`),

  // AI Model Metrics & Architecture
  getModelInfo: () => apiClient.get('/model-info'),
};

export default apiService;
