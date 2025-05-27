

module.exports = {
  
  server: {
    port: process.env.PORT || 9876,
    timeout: process.env.API_TIMEOUT || 500
  },

  
  window: {
    size: parseInt(process.env.WINDOW_SIZE) || 10
  },

  
  api: {
    baseUrl: 'http://20.244.56.144/test',
    timeout: 500,
    endpoints: {
      register: '/register',
      prime: '/primes',
      fibonacci: '/fibo',
      even: '/even',
      random: '/rand'
    }
  },

  
  credentials: {
    rollNumber: "22311A0543",           
    email: "22311a0543@cse.sreenidhi.edu.in", 
    accessCode: "PCqAUK"           
  },

  
  numberTypes: {
    'p': 'prime',
    'f': 'fibonacci',
    'e': 'even',
    'r': 'random'
  }
};