
// const express = require('express');
// const config = require('./config/config');
// const apiService = require('./services/apiService');
// const calculator = require('./utils/calculator');
// const authMiddleware = require('./middleware/auth');


// const app = express();
// const PORT = config.server.port;


// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(authMiddleware.handleCors);
// app.use(authMiddleware.logRequest);
// app.use(authMiddleware.rateLimit());


// app.get('/health', (req, res) => {
//   const healthStatus = {
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     service: 'Average Calculator Microservice',
//     version: '1.0.0',
//     authentication: apiService.isAuthenticated() ? 'authenticated' : 'not authenticated',
//     window: calculator.getWindowStats()
//   };
 
//   res.json(healthStatus);
// });


// app.get('/', (req, res) => {
//   res.json({
//     service: 'Average Calculator Microservice',
//     version: '1.0.0',
//     endpoints: {
//       health: '/health',
//       numbers: '/numbers/{numberid}'
//     },
//     numberTypes: {
//       p: 'Prime numbers',
//       f: 'Fibonacci numbers',
//       e: 'Even numbers',
//       r: 'Random numbers'
//     },
//     usage: 'Send GET request to /numbers/{p|f|e|r} to get numbers and calculate average',
//     example: `/numbers/p for prime numbers`,
//     timestamp: new Date().toISOString()
//   });
// });


// app.get('/numbers/:numberid',
//   authMiddleware.validateNumberType,
//   authMiddleware.ensureAuthenticated,
//   async (req, res) => {
//     const { numberid } = req.params;
   
//     try {
//       console.log(`\n Processing request for ${config.numberTypes[numberid]} numbers`);
     
//       const windowPrevState = calculator.getCurrentWindow();
//       console.log('Previous window state:', windowPrevState);
     
      
//       const fetchResult = await apiService.fetchNumbers(numberid);
     
//       if (!fetchResult.success) {
//         throw new Error('Failed to fetch numbers from API');
//       }
     
//       const fetchedNumbers = fetchResult.numbers;
     
      
//       calculator.updateWindow(fetchedNumbers);
     
      
//       const windowCurrState = calculator.getCurrentWindow();
//       const average = calculator.getFormattedAverage();
     
      
//       const response = {
//         windowPrevState,
//         windowCurrState,
//         numbers: fetchedNumbers,
//         avg: average
//       };
     
//       console.log('Request processed successfully');
//       console.log('Response:', response);
     
//       res.json(response);
     
//     } catch (error) {
//       console.error('Error processing request:', error.message);
     
     
//       if (error.message.includes('Authorization failed')) {
//         return res.status(401).json({
//           windowPrevState: calculator.getCurrentWindow(),
//           windowCurrState: calculator.getCurrentWindow(),
//           numbers: [],
//           avg: calculator.getFormattedAverage(),
//           error: 'Authorization failed',
//           message: 'Access token expired. Please retry request for automatic re-authentication.'
//         });
//       }
     
//       if (error.message.includes('timeout')) {
//         return res.status(504).json({
//           windowPrevState: calculator.getCurrentWindow(),
//           windowCurrState: calculator.getCurrentWindow(),
//           numbers: [],
//           avg: calculator.getFormattedAverage(),
//           error: 'Request timeout',
//           message: 'Third-party API request timed out. Please try again.'
//         });
//       }
     
      
//       res.status(500).json({
//         windowPrevState: calculator.getCurrentWindow(),
//         windowCurrState: calculator.getCurrentWindow(),
//         numbers: [],
//         avg: calculator.getFormattedAverage(),
//         error: 'Internal server error',
//         message: 'Failed to process numbers request',
//         details: error.message
//       });
//     }
//   }
// );

// app.post('/reset', (req, res) => {
//   console.log('Resetting calculator window state');
//   calculator.resetWindow();
 
//   res.json({
//     message: 'Window state reset successfully',
//     windowState: calculator.getCurrentWindow(),
//     timestamp: new Date().toISOString()
//   });
// });


// app.get('/window', (req, res) => {
//   const stats = calculator.getWindowStats();
//   res.json({
//     message: 'Current window state',
//     ...stats,
//     timestamp: new Date().toISOString()
//   });
// });


// app.use((error, req, res, next) => {
//   console.error('Unhandled error:', error);
 
//   res.status(500).json({
//     error: 'Internal server error',
//     message: 'An unexpected error occurred',
//     timestamp: new Date().toISOString()
//   });
// });


// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Not found',
//     message: `Route ${req.method} ${req.originalUrl} not found`,
//     availableRoutes: [
//       'GET /',
//       'GET /health',
//       'GET /numbers/{p|f|e|r}',
//       'GET /window',
//       'POST /reset'
//     ],
//     timestamp: new Date().toISOString()
//   });
// });


// process.on('SIGINT', () => {
//   console.log('\nReceived SIGINT, shutting down gracefully...');
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   console.log('\nReceived SIGTERM, shutting down gracefully...');
//   process.exit(0);
// });


// app.listen(PORT, async () => {
//   console.log('\n===============================================');
//   console.log(` Average Calculator Microservice Started`);
//   console.log(` Server running on: http://localhost:${PORT}`);
//   console.log(` Started at: ${new Date().toISOString()}`);
//   console.log(' ===============================================\n');
 
  
//   console.log('Attempting initial registration with third-party API...');
 
//   try {
//     const registrationResult = await apiService.registerForAccess();
   
//     if (registrationResult.success) {
//       console.log(' Initial registration successful!');
//       console.log(' Service ready to accept requests\n');
//     } else {
//       console.warn(' Initial registration failed, but service will continue');
//       console.warn(' Registration will be attempted on first API request\n');
//     }
//   } catch (error) {
//     console.error(' Initial registration error:', error.message);
//     console.warn(' Service starting anyway, registration will retry on first request\n');
//   }
 
  
//   console.log('Available endpoints:');
//   console.log(`GET  http://localhost:${PORT}/`);
//   console.log(`GET  http://localhost:${PORT}/health`);
//   console.log(`GET  http://localhost:${PORT}/numbers/p (prime)`);
//   console.log(`GET  http://localhost:${PORT}/numbers/f (fibonacci)`);
//   console.log(`GET  http://localhost:${PORT}/numbers/e (even)`);
//   console.log(`GET  http://localhost:${PORT}/numbers/r (random)`);
//   console.log(`GET  http://localhost:${PORT}/window`);
//   console.log(`POST http://localhost:${PORT}/reset\n`);
// });

// module.exports = app;


const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 9876;

const WINDOW_SIZE = 10;
const API_TIMEOUT = 500;
const BASE_API_URL = 'http://20.244.56.144/test';
const REGISTER_API_URL = `${BASE_API_URL}/register`;

const YOUR_ROLL_NUMBER = "YourRollNumber";
const YOUR_COLLEGE_EMAIL = "your_college_email@example.com";
const YOUR_ACCESS_CODE = "YourAccessCode";

let numberStore = {
  windowState: [],
  lastRequestTime: null
};

let accessToken = null;

const apiEndpoints = {
  'p': `${BASE_API_URL}/primes`,
  'f': `${BASE_API_URL}/fibo`,
  'e': `${BASE_API_URL}/even`,
  'r': `${BASE_API_URL}/rand`
};

async function registerAndGetToken() {
  try {
    const payload = {
      roll_number: YOUR_ROLL_NUMBER,
      email: YOUR_COLLEGE_EMAIL,
      access_code: YOUR_ACCESS_CODE
    };

    const response = await axios.post(REGISTER_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: API_TIMEOUT
    });

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({
      error: 'Invalid number ID. Use p (prime), f (fibonacci), e (even), or r (random).'
    });
  }

  if (!accessToken) {
    return res.status(503).json({
      windowPrevState: numberStore.windowState,
      windowCurrState: numberStore.windowState,
      numbers: [],
      avg: calculateAverage(numberStore.windowState).toFixed(2),
      error: 'Service unavailable: Access token not obtained.'
    });
  }

  try {
    const windowPrevState = [...numberStore.windowState];
    const apiUrl = apiEndpoints[numberid];

    const response = await axios.get(apiUrl, {
      timeout: API_TIMEOUT,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const fetchedNumbers = response.data.numbers || [];
    updateWindowState(fetchedNumbers);
    const avg = calculateAverage(numberStore.windowState);

    const result = {
      windowPrevState,
      windowCurrState: numberStore.windowState,
      numbers: fetchedNumbers,
      avg: avg.toFixed(2)
    };

    res.json(result);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      accessToken = null;
      return res.status(401).json({
        windowPrevState: numberStore.windowState,
        windowCurrState: numberStore.windowState,
        numbers: [],
        avg: calculateAverage(numberStore.windowState).toFixed(2),
        error: 'Authorization failed: Access token expired or invalid.'
      });
    }

    const avg = calculateAverage(numberStore.windowState);
    const result = {
      windowPrevState: numberStore.windowState,
      windowCurrState: numberStore.windowState,
      numbers: [],
      avg: avg.toFixed(2),
      error: 'Failed to fetch numbers from third-party API'
    };
    res.json(result);
  }
});

function updateWindowState(newNumbers) {
  const uniqueNewNumbers = newNumbers.filter(num => !numberStore.windowState.includes(num));
  if (uniqueNewNumbers.length === 0) return;

  if (numberStore.windowState.length + uniqueNewNumbers.length <= WINDOW_SIZE) {
    numberStore.windowState = [...numberStore.windowState, ...uniqueNewNumbers];
  } else {
    const spaceAvailable = WINDOW_SIZE - numberStore.windowState.length;
    if (spaceAvailable > 0) {
      numberStore.windowState = [
        ...numberStore.windowState,
        ...uniqueNewNumbers.slice(0, spaceAvailable)
      ];
      const remainingNewNumbers = uniqueNewNumbers.slice(spaceAvailable);
      numberStore.windowState = [
        ...numberStore.windowState.slice(remainingNewNumbers.length),
        ...remainingNewNumbers
      ];
    } else {
      numberStore.windowState = [
        ...numberStore.windowState.slice(uniqueNewNumbers.length),
        ...uniqueNewNumbers
      ];
    }
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

app.listen(PORT, async () => {
  const registrationSuccess = await registerAndGetToken();
});
