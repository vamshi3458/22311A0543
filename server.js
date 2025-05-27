
const express = require('express');
const config = require('./config/config');
const apiService = require('./services/apiService');
const calculator = require('./utils/calculator');
const authMiddleware = require('./middleware/auth');


const app = express();
const PORT = config.server.port;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware.handleCors);
app.use(authMiddleware.logRequest);
app.use(authMiddleware.rateLimit());


app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Average Calculator Microservice',
    version: '1.0.0',
    authentication: apiService.isAuthenticated() ? 'authenticated' : 'not authenticated',
    window: calculator.getWindowStats()
  };
 
  res.json(healthStatus);
});


app.get('/', (req, res) => {
  res.json({
    service: 'Average Calculator Microservice',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      numbers: '/numbers/{numberid}'
    },
    numberTypes: {
      p: 'Prime numbers',
      f: 'Fibonacci numbers',
      e: 'Even numbers',
      r: 'Random numbers'
    },
    usage: 'Send GET request to /numbers/{p|f|e|r} to get numbers and calculate average',
    example: `/numbers/p for prime numbers`,
    timestamp: new Date().toISOString()
  });
});


app.get('/numbers/:numberid',
  authMiddleware.validateNumberType,
  authMiddleware.ensureAuthenticated,
  async (req, res) => {
    const { numberid } = req.params;
   
    try {
      console.log(`\n Processing request for ${config.numberTypes[numberid]} numbers`);
     
      const windowPrevState = calculator.getCurrentWindow();
      console.log('Previous window state:', windowPrevState);
     
      
      const fetchResult = await apiService.fetchNumbers(numberid);
     
      if (!fetchResult.success) {
        throw new Error('Failed to fetch numbers from API');
      }
     
      const fetchedNumbers = fetchResult.numbers;
     
      
      calculator.updateWindow(fetchedNumbers);
     
      
      const windowCurrState = calculator.getCurrentWindow();
      const average = calculator.getFormattedAverage();
     
      
      const response = {
        windowPrevState,
        windowCurrState,
        numbers: fetchedNumbers,
        avg: average
      };
     
      console.log('Request processed successfully');
      console.log('Response:', response);
     
      res.json(response);
     
    } catch (error) {
      console.error('Error processing request:', error.message);
     
     
      if (error.message.includes('Authorization failed')) {
        return res.status(401).json({
          windowPrevState: calculator.getCurrentWindow(),
          windowCurrState: calculator.getCurrentWindow(),
          numbers: [],
          avg: calculator.getFormattedAverage(),
          error: 'Authorization failed',
          message: 'Access token expired. Please retry request for automatic re-authentication.'
        });
      }
     
      if (error.message.includes('timeout')) {
        return res.status(504).json({
          windowPrevState: calculator.getCurrentWindow(),
          windowCurrState: calculator.getCurrentWindow(),
          numbers: [],
          avg: calculator.getFormattedAverage(),
          error: 'Request timeout',
          message: 'Third-party API request timed out. Please try again.'
        });
      }
     
      
      res.status(500).json({
        windowPrevState: calculator.getCurrentWindow(),
        windowCurrState: calculator.getCurrentWindow(),
        numbers: [],
        avg: calculator.getFormattedAverage(),
        error: 'Internal server error',
        message: 'Failed to process numbers request',
        details: error.message
      });
    }
  }
);

app.post('/reset', (req, res) => {
  console.log('Resetting calculator window state');
  calculator.resetWindow();
 
  res.json({
    message: 'Window state reset successfully',
    windowState: calculator.getCurrentWindow(),
    timestamp: new Date().toISOString()
  });
});


app.get('/window', (req, res) => {
  const stats = calculator.getWindowStats();
  res.json({
    message: 'Current window state',
    ...stats,
    timestamp: new Date().toISOString()
  });
});


app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
 
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});


app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /numbers/{p|f|e|r}',
      'GET /window',
      'POST /reset'
    ],
    timestamp: new Date().toISOString()
  });
});


process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});


app.listen(PORT, async () => {
  console.log('\n===============================================');
  console.log(` Average Calculator Microservice Started`);
  console.log(` Server running on: http://localhost:${PORT}`);
  console.log(` Started at: ${new Date().toISOString()}`);
  console.log(' ===============================================\n');
 
  
  console.log('Attempting initial registration with third-party API...');
 
  try {
    const registrationResult = await apiService.registerForAccess();
   
    if (registrationResult.success) {
      console.log(' Initial registration successful!');
      console.log(' Service ready to accept requests\n');
    } else {
      console.warn(' Initial registration failed, but service will continue');
      console.warn(' Registration will be attempted on first API request\n');
    }
  } catch (error) {
    console.error(' Initial registration error:', error.message);
    console.warn(' Service starting anyway, registration will retry on first request\n');
  }
 
  
  console.log('Available endpoints:');
  console.log(`GET  http://localhost:${PORT}/`);
  console.log(`GET  http://localhost:${PORT}/health`);
  console.log(`GET  http://localhost:${PORT}/numbers/p (prime)`);
  console.log(`GET  http://localhost:${PORT}/numbers/f (fibonacci)`);
  console.log(`GET  http://localhost:${PORT}/numbers/e (even)`);
  console.log(`GET  http://localhost:${PORT}/numbers/r (random)`);
  console.log(`GET  http://localhost:${PORT}/window`);
  console.log(`POST http://localhost:${PORT}/reset\n`);
});

module.exports = app;
