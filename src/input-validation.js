// src/input-validation.js
// Utility functions for input validation

/**
 * Input validation utilities for fantasy protocol game
 * Used across both client-side and server-side validation
 */

// Username validation
const validateUsername = (username) => {
    if (!username || typeof username !== 'string') {
      return { valid: false, message: 'Username is required' };
    }
    
    if (username.length < 3 || username.length > 20) {
      return { valid: false, message: 'Username must be between 3 and 20 characters' };
    }
    
    // Allow only alphanumeric characters and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return { valid: false, message: 'Username may only contain letters, numbers, and underscores' };
    }
    
    return { valid: true };
  };
  
  // Player stat validation
  const validatePlayerStats = (stats) => {
    const validations = {
      health: validateHealthStat,
      max_health: validateHealthStat,
      strength: validateStrengthStat,
      wisdomness: validateWisdomnessStat,
      benchpress: validateBenchpressStat,
      curl: validateCurlStat,
      experience: validateExperienceStat,
      level: validateLevelStat
    };
    
    const errors = {};
    let isValid = true;
    
    for (const [key, validateFn] of Object.entries(validations)) {
      if (stats[key] !== undefined) {
        const validation = validateFn(stats[key]);
        if (!validation.valid) {
          errors[key] = validation.message;
          isValid = false;
        }
      }
    }
    
    return {
      valid: isValid,
      errors
    };
  };
  
  // Individual stat validations
  const validateHealthStat = (health) => {
    if (typeof health !== 'number' || isNaN(health)) {
      return { valid: false, message: 'Health must be a number' };
    }
    
    if (health < 0 || health > 1000) {
      return { valid: false, message: 'Health must be between 0 and 1000' };
    }
    
    if (!Number.isInteger(health)) {
      return { valid: false, message: 'Health must be an integer' };
    }
    
    return { valid: true };
  };
  
  const validateStrengthStat = (strength) => {
    if (typeof strength !== 'number' || isNaN(strength)) {
      return { valid: false, message: 'Strength must be a number' };
    }
    
    if (strength < 1 || strength > 100) {
      return { valid: false, message: 'Strength must be between 1 and 100' };
    }
    
    if (!Number.isInteger(strength)) {
      return { valid: false, message: 'Strength must be an integer' };
    }
    
    return { valid: true };
  };
  
  const validateWisdomnessStat = (wisdomness) => {
    if (typeof wisdomness !== 'number' || isNaN(wisdomness)) {
      return { valid: false, message: 'Wisdomness must be a number' };
    }
    
    if (wisdomness < 1 || wisdomness > 100) {
      return { valid: false, message: 'Wisdomness must be between 1 and 100' };
    }
    
    if (!Number.isInteger(wisdomness)) {
      return { valid: false, message: 'Wisdomness must be an integer' };
    }
    
    return { valid: true };
  };
  
  const validateBenchpressStat = (benchpress) => {
    if (typeof benchpress !== 'number' || isNaN(benchpress)) {
      return { valid: false, message: 'Benchpress must be a number' };
    }
    
    if (benchpress < 1 || benchpress > 100) {
      return { valid: false, message: 'Benchpress must be between 1 and 100' };
    }
    
    if (!Number.isInteger(benchpress)) {
      return { valid: false, message: 'Benchpress must be an integer' };
    }
    
    return { valid: true };
  };
  
  const validateCurlStat = (curl) => {
    if (typeof curl !== 'number' || isNaN(curl)) {
      return { valid: false, message: 'Curl must be a number' };
    }
    
    if (curl < 1 || curl > 100) {
      return { valid: false, message: 'Curl must be between 1 and 100' };
    }
    
    if (!Number.isInteger(curl)) {
      return { valid: false, message: 'Curl must be an integer' };
    }
    
    return { valid: true };
  };
  
  const validateExperienceStat = (experience) => {
    if (typeof experience !== 'number' || isNaN(experience)) {
      return { valid: false, message: 'Experience must be a number' };
    }
    
    if (experience < 0 || experience > 1000000) {
      return { valid: false, message: 'Experience must be between 0 and 1,000,000' };
    }
    
    if (!Number.isInteger(experience)) {
      return { valid: false, message: 'Experience must be an integer' };
    }
    
    return { valid: true };
  };
  
  const validateLevelStat = (level) => {
    if (typeof level !== 'number' || isNaN(level)) {
      return { valid: false, message: 'Level must be a number' };
    }
    
    if (level < 1 || level > 100) {
      return { valid: false, message: 'Level must be between 1 and 100' };
    }
    
    if (!Number.isInteger(level)) {
      return { valid: false, message: 'Level must be an integer' };
    }
    
    return { valid: true };
  };
  
  // Position validation 
  const validatePosition = (position) => {
    if (!position || typeof position !== 'object') {
      return { valid: false, message: 'Position must be an object' };
    }
    
    const { x, y, z } = position;
    
    if (typeof x !== 'number' || isNaN(x) || 
        typeof y !== 'number' || isNaN(y) || 
        typeof z !== 'number' || isNaN(z)) {
      return { valid: false, message: 'Position coordinates must be numbers' };
    }
    
    // Game world bounds check
    if (Math.abs(x) > 1000 || Math.abs(y) > 1000 || Math.abs(z) > 1000) {
      return { valid: false, message: 'Position out of world bounds' };
    }
    
    return { valid: true };
  };
  
  // Inventory validation
  const validateInventoryItem = (item) => {
    if (!item || typeof item !== 'object') {
      return { valid: false, message: 'Inventory item must be an object' };
    }
    
    if (!item.item_name || typeof item.item_name !== 'string') {
      return { valid: false, message: 'Item name is required' };
    }
    
    if (item.quantity === undefined || 
        typeof item.quantity !== 'number' || 
        !Number.isInteger(item.quantity) || 
        item.quantity < 1) {
      return { valid: false, message: 'Item quantity must be a positive integer' };
    }
    
    return { valid: true };
  };
  
  // Export all validation functions
  module.exports = {
    validateUsername,
    validatePlayerStats,
    validateHealthStat,
    validateStrengthStat,
    validateWisdomnessStat,
    validateBenchpressStat,
    validateCurlStat, 
    validateExperienceStat,
    validateLevelStat,
    validatePosition,
    validateInventoryItem
  };