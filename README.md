# Average Calculator Microservice

A REST API microservice that calculates the average of numbers fetched from external APIs,
with window size management.

## Project Overview

This microservice exposes a REST API endpoint `/numbers/:numberid` that:
- Accepts qualified number IDs (&#39;p&#39; for prime, &#39;f&#39; for Fibonacci, &#39;e&#39; for even, &#39;r&#39; for random)
- Fetches numbers from a third-party server
- Maintains a window of unique numbers (default size: 10)
- Calculates and returns the average of stored numbers

## Features

- **Window Management**: Maintains a fixed-size window of unique numbers
- **Duplicate Handling**: Ignores duplicate numbers
- **Timeout Handling**: Ignores responses taking longer than 500ms
- **Error Handling**: Gracefully handles API errors
- **Response Format**: Returns previous window state, current window state, fetched
numbers, and average

## Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```

## Usage

### Starting the Service

```
npm start
```

The service will run on http://localhost:9876 by default.

### API Endpoints

- **GET /numbers/p** - Fetch prime numbers
- **GET /numbers/f** - Fetch Fibonacci numbers
- **GET /numbers/e** - Fetch even numbers
- **GET /numbers/r** - Fetch random numbers

### Example Response

```json
{
  &quot;windowPrevState&quot;: [2, 4, 6, 8],
  &quot;windowCurrState&quot;: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  &quot;numbers&quot;: [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
  &quot;avg&quot;: &quot;23.40&quot;
}
```

## Testing

For testing purposes, a mock server is included that simulates the third-party API responses.

### Starting the Mock Server

```
node mock-server.js
```

The mock server runs on http://localhost:3000.

## Configuration

You can modify the following configuration in `index.js`:
- `WINDOW_SIZE`: Number of unique values to maintain (default: 10)
- `API_TIMEOUT`: Maximum time to wait for API responses in milliseconds (default: 500)
- `BASE_API_URL`: Base URL for the third-party API endpoints

## Project Structure

- `index.js` - Main application file
- `mock-server.js` - Mock server for testing
- `package.json` - Project configuration and dependencies
