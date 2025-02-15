// ./frontend/src/api/narrativeAPI.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust if needed

export const submitNarrativeRequest = async (payload) => {
  console.debug("[narrativeAPI] Sending payload:", payload);
  try {
    const response = await axios.post(`${API_BASE_URL}/api/narrative`, payload);
    console.debug("[narrativeAPI] Received response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[narrativeAPI] Error during API call:", error);
    throw error;
  }
};