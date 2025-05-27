

const config = require('../config/config');

class Calculator {
  constructor() {
    this.windowState = [];
    this.maxWindowSize = config.window.size;
  }

 
  getCurrentWindow() {
    return [...this.windowState];
  }

  
  updateWindow(newNumbers) {
    if (!Array.isArray(newNumbers) || newNumbers.length === 0) {
      console.log('No new numbers to add to window');
      return this.getCurrentWindow();
    }

    const previousState = this.getCurrentWindow();
    console.log('Previous window state:', previousState);
    console.log('New numbers received:', newNumbers);

    // Filter out duplicate numbers that already exist in window
    const uniqueNewNumbers = newNumbers.filter(num =>
      !this.windowState.includes(num)
    );

    console.log('Unique new numbers:', uniqueNewNumbers);

    if (uniqueNewNumbers.length === 0) {
      console.log('All numbers already exist in window, no changes made');
      return previousState;
    }

    this.applyWindowUpdate(uniqueNewNumbers);

    console.log('Updated window state:', this.windowState);
    return previousState;
  }

  
  applyWindowUpdate(uniqueNumbers) {
    const currentLength = this.windowState.length;
    const newNumbersCount = uniqueNumbers.length;
    const availableSpace = this.maxWindowSize - currentLength;

    if (availableSpace >= newNumbersCount) {
     
      this.windowState = [...this.windowState, ...uniqueNumbers];
      console.log('Added all new numbers (space available)');
    } else {
     
      if (availableSpace > 0) {
        
        this.windowState = [
          ...this.windowState,
          ...uniqueNumbers.slice(0, availableSpace)
        ];
       
        
        const remainingNumbers = uniqueNumbers.slice(availableSpace);
        this.slideWindow(remainingNumbers);
      } else {
        
        this.slideWindow(uniqueNumbers);
      }
      console.log('Applied sliding window logic');
    }
  }

 
  slideWindow(numbersToAdd) {
    const numbersToRemove = numbersToAdd.length;
    this.windowState = [
      ...this.windowState.slice(numbersToRemove),
      ...numbersToAdd
    ];
  }

  calculateAverage() {
    if (this.windowState.length === 0) {
      console.log('Window is empty, average = 0');
      return 0;
    }

    const sum = this.windowState.reduce((acc, num) => acc + num, 0);
    const average = sum / this.windowState.length;
   
    console.log(`Calculated average: ${sum}/${this.windowState.length} = ${average}`);
    return average;
  }

  
  getFormattedAverage() {
    return this.calculateAverage().toFixed(2);
  }

  
  resetWindow() {
    console.log('Resetting window state');
    this.windowState = [];
  }

  
  getWindowStats() {
    return {
      currentSize: this.windowState.length,
      maxSize: this.maxWindowSize,
      numbers: [...this.windowState],
      average: this.getFormattedAverage(),
      sum: this.windowState.reduce((acc, num) => acc + num, 0)
    };
  }

 
  validateWindow() {
    const isValid = this.windowState.length <= this.maxWindowSize &&
                   this.windowState.every(num => typeof num === 'number');
   
    if (!isValid) {
      console.error('Window state validation failed');
      console.error('Window state:', this.windowState);
    }
   
    return isValid;
  }
}

module.exports = new Calculator();
