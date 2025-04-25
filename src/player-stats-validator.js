// src/player-stats-validator.js
// Client-side validation for player stats

/**
 * Client-side validation for Fantasy Protocol game player stats
 * This ensures data integrity before sending to the server
 */

class PlayerStatsValidator {
    /**
     * Validates the entire player stats object
     * @param {Object} stats - The player stats object to validate
     * @returns {Object} - Validation result with valid flag and any errors
     */
    static validatePlayerStats(stats) {
      if (!stats || typeof stats !== 'object') {
        return {
          valid: false,
          errors: { general: 'Invalid player stats data' }
        };
      }
  
      const validations = {
        health: this.validateHealthStat,
        max_health: this.validateHealthStat,
        strength: this.validateStrengthStat,
        wisdomness: this.validateWisdomnessStat,
        benchpress: this.validateBenchpressStat,
        curl: this.validateCurlStat,
        experience: this.validateExperienceStat,
        level: this.validateLevelStat
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
    }
  
    /**
     * Validates health stat
     * @param {number} health - The health value to validate
     * @returns {Object} - Validation result
     */
    static validateHealthStat(health) {
      if (health === undefined || health === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Validates strength stat
     * @param {number} strength - The strength value to validate
     * @returns {Object} - Validation result
     */
    static validateStrengthStat(strength) {
      if (strength === undefined || strength === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Validates wisdomness stat
     * @param {number} wisdomness - The wisdomness value to validate
     * @returns {Object} - Validation result
     */
    static validateWisdomnessStat(wisdomness) {
      if (wisdomness === undefined || wisdomness === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Validates benchpress stat
     * @param {number} benchpress - The benchpress value to validate
     * @returns {Object} - Validation result
     */
    static validateBenchpressStat(benchpress) {
      if (benchpress === undefined || benchpress === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Validates curl stat
     * @param {number} curl - The curl value to validate
     * @returns {Object} - Validation result
     */
    static validateCurlStat(curl) {
      if (curl === undefined || curl === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Validates experience stat
     * @param {number} experience - The experience value to validate
     * @returns {Object} - Validation result
     */
    static validateExperienceStat(experience) {
      if (experience === undefined || experience === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Validates level stat
     * @param {number} level - The level value to validate
     * @returns {Object} - Validation result
     */
    static validateLevelStat(level) {
      if (level === undefined || level === null) {
        return { valid: true }; // Allow undefined/null for partial updates
      }
      
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
    }
  
    /**
     * Creates a report-friendly format for player stats
     * @param {Object} player - The player object with stats
     * @returns {Object} - Formatted player stats report
     */
    static formatPlayerStatsReport(player) {
      if (!player || typeof player !== 'object') {
        return null;
      }
      
      // Format creation date
      const createdDate = player.created_at ? new Date(player.created_at) : new Date();
      const formattedDate = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Calculate level progress percentage
      const xpToNextLevel = this.calculateXPForNextLevel(player.level || 1);
      const currentLevelXP = this.calculateTotalXPForLevel(player.level || 1);
      const xpProgress = player.experience ? Math.min(100, Math.floor(((player.experience - currentLevelXP) / xpToNextLevel) * 100)) : 0;
      
      // Create formatted report
      return {
        character: {
          name: player.username || 'Unknown',
          level: player.level || 1,
          created: formattedDate
        },
        progress: {
          experience: player.experience || 0,
          nextLevelXP: xpToNextLevel + currentLevelXP,
          progressPercent: xpProgress,
          healthPercent: player.max_health ? Math.floor((player.health / player.max_health) * 100) : 100
        },
        attributes: {
          strength: player.strength || 0,
          wisdomness: player.wisdomness || 0,
          benchpress: player.benchpress || 0,
          curl: player.curl || 0
        },
        status: {
          health: player.health || 0,
          maxHealth: player.max_health || 100
        }
      };
    }
    
    /**
     * Calculate XP needed for the next level
     * @param {number} currentLevel - The current level
     * @returns {number} - XP needed for next level
     */
    static calculateXPForNextLevel(currentLevel) {
      return Math.round(2 ** (currentLevel) * 100);
    }
    
    /**
     * Calculate total XP required to reach the current level
     * @param {number} level - The level to calculate for
     * @returns {number} - Total XP required
     */
    static calculateTotalXPForLevel(level) {
      if (level <= 1) return 0;
      
      let totalXP = 0;
      for (let i = 1; i < level; i++) {
        totalXP += Math.round(2 ** (i - 1) * 100);
      }
      return totalXP;
    }
  }
  
  // Check if we're in a browser or Node.js environment
  if (typeof window !== 'undefined') {
    // Browser environment
    window.PlayerStatsValidator = PlayerStatsValidator;
  } else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = PlayerStatsValidator;
  }