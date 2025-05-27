const axios = require('axios');
const config = require('../config/config');

let accessToken = null;

const register = async () => {
  try {
    const response = await axios.post(`${config.api.baseUrl}${config.api.endpoints.register}`, {
      rollNumber: config.credentials.rollNumber,
      email: config.credentials.email
    });
    accessToken = response.data.access_token;
  } catch (err) {
    console.error("Failed to obtain access token.");
  }
};

const fetchNumbers = async (type) => {
  if (!accessToken) await register();

  const url = `${config.api.baseUrl}${config.api.endpoints[type]}`;
  try {
    const response = await axios.get(url, {
      timeout: config.api.timeout,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching numbers for ${type}:`, error.message);
    return [];
  }
};

module.exports = { fetchNumbers };
