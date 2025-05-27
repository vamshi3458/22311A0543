

const apiService = require('../services/apiService');

class AuthMiddleware {
 
  
  async ensureAuthenticated(req, res, next) {
    console.log('Checking authentication status...');

    if (!apiService.isAuthenticated()) {
      console.log('No access token found, attempting registration...');
     
      try {
        const registrationResult = await apiService.registerForAccess();
       
        if (!registrationResult.success) {
          console.error('Registration failed:', registrationResult.error);
         
          return res.status(503).json({
            error: 'Service temporarily unavailable',
            message: 'Failed to authenticate with third-party service',
            details: registrationResult.error,
            timestamp: new Date().toISOString()
          });
        }
       
        console.log('Registration successful, proceeding with request');
       
      } catch (error) {
        console.error('Authentication middleware error:', error.message);
       
        return res.status(503).json({
          error: 'Authentication failed',
          message: 'Unable to establish connection with third-party service',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log('Authentication token available');
    }

  
    req.auth = {
      isAuthenticated: true,
      token: apiService.getAccessToken()
    };

    next();
  }

  
  handleAuthError(error, req, res, next) {
    if (error.message.includes('Authorization failed') ||
        error.message.includes('Token expired')) {
     
      console.log('Authentication error detected, clearing token for re-authentication');
      apiService.clearToken();
     
      return res.status(401).json({
        error: 'Authentication expired',
        message: 'Please retry the request for automatic re-authentication',
        timestamp: new Date().toISOString()
      });
    }
   
    next(error);
  }

 
  validateNumberType(req, res, next) {
    const { numberid } = req.params;
    const validTypes = ['p', 'f', 'e', 'r'];
   
    if (!validTypes.includes(numberid)) {
      return res.status(400).json({
        error: 'Invalid number type',
        message: 'Number type must be one of: p (prime), f (fibonacci), e (even), r (random)',
        provided: numberid,
        valid_types: validTypes,
        timestamp: new Date().toISOString()
      });
    }
   
    console.log(`Valid number type requested: ${numberid}`);
    next();
  }

 
  logRequest(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress;
   
    console.log(`[${timestamp}] ${method} ${url} from ${ip}`);
   
    
    req.requestInfo = {
      timestamp,
      method,
      url,
      ip
    };
   
    next();
  }

  
  rateLimit() {
    const requests = new Map();
    const WINDOW_MS = 60000; 
    const MAX_REQUESTS = 100;
   
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();
     
      if (!requests.has(ip)) {
        requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return next();
      }
     
      const requestInfo = requests.get(ip);
     
      if (now > requestInfo.resetTime) {
        requests.set(ip, { count: 1, resetTime: now + WINDOW_MS });
        return next();
      }
     
      if (requestInfo.count >= MAX_REQUESTS) {
        return res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000),
          timestamp: new Date().toISOString()
        });
      }
     
      requestInfo.count++;
      next();
    };
  }

 
  handleCors(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
   
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
   
    next();
  }
}

module.exports = new AuthMiddleware();
