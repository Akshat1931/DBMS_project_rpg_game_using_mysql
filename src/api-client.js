// src/api-client.js
// API client for Fantasy Protocol game

/**
 * API Client for Fantasy Protocol
 * Provides access to game server API with input validation and error handling
 */

class APIClient {
    /**
     * Initialize API client with base URL
     * @param {string} baseUrl - Base URL for API (default: http://localhost:3000)
     */
    constructor(baseUrl = 'http://localhost:3000') {
      this.baseUrl = baseUrl;
      this.endpoints = {
        players: '/api/players',
        player: '/api/player',
        playerReport: '/api/player/:id/report',
        leaderboard: '/api/leaderboard',
        gameReport: '/api/game/report',
        worldStatus: '/api/world/status',
        playerLocation: '/api/player/:id/location',
        playerInventory: '/api/player/:id/inventory',
        playerKills: '/api/player/:id/kills',
        combatReport: '/api/combat/report'
      };
    }
    
    /**
     * Get all players
     * @returns {Promise<Object>} - Players data with error handling
     */
    async getAllPlayers() {
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.players}`);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch players');
      }
    }
    
    /**
     * Get player by ID
     * @param {number|string} playerId - Player ID to fetch
     * @returns {Promise<Object>} - Player data with error handling
     */
    async getPlayer(playerId) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      try {
        const url = `${this.baseUrl}${this.endpoints.player}/${playerId}`;
        const response = await this._fetchWithTimeout(url);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch player');
      }
    }
    
    /**
     * Create a new player
     * @param {Object} playerData - Player data to create
     * @returns {Promise<Object>} - Created player data with error handling
     */
    async createPlayer(playerData) {
      // Validate player data
      if (!playerData || typeof playerData !== 'object') {
        return { success: false, error: 'Invalid player data' };
      }
      
      if (!playerData.username) {
        return { success: false, error: 'Username is required' };
      }
      
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.player}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this._sanitizePlayerData(playerData))
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to create player');
      }
    }
    
    /**
     * Update player data
     * @param {number|string} playerId - Player ID to update
     * @param {Object} playerData - Player data to update
     * @returns {Promise<Object>} - Updated player data with error handling
     */
    async updatePlayer(playerId, playerData) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      // Validate player data
      if (!playerData || typeof playerData !== 'object') {
        return { success: false, error: 'Invalid player data' };
      }
      
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.player}/${playerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this._sanitizePlayerData(playerData))
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to update player');
      }
    }
    
    /**
     * Delete a player
     * @param {number|string} playerId - Player ID to delete
     * @returns {Promise<Object>} - Delete result with error handling
     */
    async deletePlayer(playerId) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.player}/${playerId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to delete player');
      }
    }
    
    /**
     * Get player report
     * @param {number|string} playerId - Player ID to get report for
     * @returns {Promise<Object>} - Player report with error handling
     */
    async getPlayerReport(playerId) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      try {
        const url = this.endpoints.playerReport.replace(':id', playerId);
        const response = await this._fetchWithTimeout(`${this.baseUrl}${url}`);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch player report');
      }
    }
    
    /**
     * Get leaderboard data
     * @returns {Promise<Object>} - Leaderboard data with error handling
     */
    async getLeaderboard() {
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.leaderboard}`);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch leaderboard');
      }
    }
    
    /**
     * Get game report
     * @returns {Promise<Object>} - Game report data with error handling
     */
    async getGameReport() {
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.gameReport}`);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch game report');
      }
    }
    
    /**
     * Get world status
     * @returns {Promise<Object>} - World status data with error handling
     */
    async getWorldStatus() {
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.worldStatus}`);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch world status');
      }
    }
    
    /**
     * Generate HTML report for player
     * @param {number|string} playerId - Player ID to generate report for
     * @returns {Promise<Object>} - HTML report with error handling
     */
    async generatePlayerHTMLReport(playerId) {
      try {
        const result = await this.getPlayerReport(playerId);
        
        if (!result.success) {
          return result; // Return error
        }
        
        // Check if ReportGenerator is available
        if (typeof ReportGenerator === 'undefined') {
          return { 
            success: false, 
            error: 'ReportGenerator not available. Please include report-generator.js' 
          };
        }
        
        const html = ReportGenerator.generateHTMLReport(result.data);
        return { success: true, html };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to generate player HTML report');
      }
    }
    
    /**
     * Download player report as HTML
     * @param {number|string} playerId - Player ID to download report for
     * @param {string} filename - Filename to save as (default: player-report.html)
     */
    async downloadPlayerReport(playerId, filename = 'player-report.html') {
      try {
        const result = await this.generatePlayerHTMLReport(playerId);
        
        if (!result.success) {
          console.error('Failed to generate report:', result.error);
          alert(`Failed to generate report: ${result.error}`);
          return;
        }
        
        // Create download link
        const blob = new Blob([result.html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      } catch (error) {
        console.error('Failed to download report:', error);
        alert(`Failed to download report: ${error.message}`);
      }
    }
    
    /**
     * Update player location
     * @param {number|string} playerId - Player ID to update
     * @param {Object} coordinates - X, Y, Z coordinates
     * @returns {Promise<Object>} - Update result with error handling
     */
    async updatePlayerLocation(playerId, coordinates) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      // Validate coordinates
      if (!coordinates || typeof coordinates !== 'object') {
        return { success: false, error: 'Invalid coordinates data' };
      }
      
      // Validate each coordinate value
      const { x, y, z } = coordinates;
      if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
        return { success: false, error: 'Coordinates must be numeric values' };
      }
      
      // Validate coordinates are within world bounds
      if (Math.abs(x) > 1000 || Math.abs(y) > 1000 || Math.abs(z) > 1000) {
        return { success: false, error: 'Coordinates outside world bounds' };
      }
      
      try {
        const url = this.endpoints.playerLocation.replace(':id', playerId);
        const response = await this._fetchWithTimeout(`${this.baseUrl}${url}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            x_coordinate: x,
            y_coordinate: y,
            z_coordinate: z
          })
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to update player location');
      }
    }
    
    /**
     * Add item to player inventory
     * @param {number|string} playerId - Player ID
     * @param {string} itemName - Item name
     * @param {number} quantity - Item quantity (default: 1)
     * @returns {Promise<Object>} - Result with error handling
     */
    async addInventoryItem(playerId, itemName, quantity = 1) {
      // Validate required parameters
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      if (!itemName || typeof itemName !== 'string') {
        return { success: false, error: 'Item name is required' };
      }
      
      // Validate quantity
      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 1) {
        return { success: false, error: 'Quantity must be a positive integer' };
      }
      
      try {
        const url = this.endpoints.playerInventory.replace(':id', playerId);
        const response = await this._fetchWithTimeout(`${this.baseUrl}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            item_name: itemName,
            quantity: parsedQuantity
          })
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to add inventory item');
      }
    }
    
    /**
     * Get player inventory
     * @param {number|string} playerId - Player ID
     * @returns {Promise<Object>} - Inventory data with error handling
     */
    async getPlayerInventory(playerId) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      try {
        const url = this.endpoints.playerInventory.replace(':id', playerId);
        const response = await this._fetchWithTimeout(`${this.baseUrl}${url}`);
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to fetch player inventory');
      }
    }
    
    /**
     * Record monster kill for player
     * @param {number|string} playerId - Player ID
     * @param {string} monsterType - Type of monster killed
     * @returns {Promise<Object>} - Result with error handling
     */
    async recordMonsterKill(playerId, monsterType) {
      // Validate required parameters
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      if (!monsterType || typeof monsterType !== 'string') {
        return { success: false, error: 'Monster type is required' };
      }
      
      try {
        const url = this.endpoints.playerKills.replace(':id', playerId);
        const response = await this._fetchWithTimeout(`${this.baseUrl}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            monster_type: monsterType
          })
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to record monster kill');
      }
    }
    
    /**
     * Generate combat report
     * @param {Object} combatData - Data about the combat encounter
     * @returns {Promise<Object>} - Combat report with error handling
     */
    async generateCombatReport(combatData) {
      // Validate combat data
      if (!combatData || typeof combatData !== 'object') {
        return { success: false, error: 'Invalid combat data' };
      }
      
      // Validate required fields
      if (!combatData.player || !combatData.monster || !combatData.result) {
        return { success: false, error: 'Missing required combat data fields' };
      }
      
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.combatReport}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(combatData)
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to generate combat report');
      }
    }
    
    /**
     * Sync player data with server
     * Useful for regularly updating player state during gameplay
     * @param {number|string} playerId - Player ID
     * @param {Object} playerData - Player data to sync
     * @returns {Promise<Object>} - Sync result with error handling
     */
    async syncPlayerData(playerId, playerData) {
      // Validate player ID
      if (!playerId) {
        return { success: false, error: 'Player ID is required' };
      }
      
      // Validate player data
      if (!playerData || typeof playerData !== 'object') {
        return { success: false, error: 'Invalid player data' };
      }
      
      try {
        const response = await this._fetchWithTimeout(`${this.baseUrl}${this.endpoints.player}/${playerId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this._sanitizePlayerData(playerData))
        });
        
        if (!response.ok) {
          const error = await this._handleErrorResponse(response);
          return { success: false, error };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return this._handleFetchError(error, 'Failed to sync player data');
      }
    }
    
    /**
     * Validate player stats
     * Client-side validation before sending to server
     * @param {Object} stats - Player stats to validate
     * @returns {Object} - Validation result
     */
    validatePlayerStats(stats) {
      // Check if we have access to the PlayerStatsValidator
      if (typeof PlayerStatsValidator !== 'undefined') {
        return PlayerStatsValidator.validatePlayerStats(stats);
      }
      
      // Fallback validation
      return this._fallbackValidateStats(stats);
    }
    
    /**
     * Fallback validation if PlayerStatsValidator is not available
     * @param {Object} stats - Player stats to validate
     * @returns {Object} - Validation result
     */
    _fallbackValidateStats(stats) {
      if (!stats || typeof stats !== 'object') {
        return { valid: false, errors: { general: 'Invalid stats object' } };
      }
      
      const errors = {};
      let isValid = true;
      
      // Validate health
      if (stats.health !== undefined) {
        if (typeof stats.health !== 'number' || isNaN(stats.health) || stats.health < 0 || stats.health > 1000) {
          errors.health = 'Health must be a number between 0 and 1000';
          isValid = false;
        }
      }
      
      // Validate max_health
      if (stats.max_health !== undefined) {
        if (typeof stats.max_health !== 'number' || isNaN(stats.max_health) || stats.max_health < 1 || stats.max_health > 1000) {
          errors.max_health = 'Max health must be a number between 1 and 1000';
          isValid = false;
        }
      }
      
      // Validate basic stats
      const basicStats = ['strength', 'wisdomness', 'benchpress', 'curl'];
      basicStats.forEach(stat => {
        if (stats[stat] !== undefined) {
          if (typeof stats[stat] !== 'number' || isNaN(stats[stat]) || stats[stat] < 1 || stats[stat] > 100) {
            errors[stat] = `${stat} must be a number between 1 and 100`;
            isValid = false;
          }
        }
      });
      
      // Validate experience
      if (stats.experience !== undefined) {
        if (typeof stats.experience !== 'number' || isNaN(stats.experience) || stats.experience < 0) {
          errors.experience = 'Experience must be a non-negative number';
          isValid = false;
        }
      }
      
      // Validate level
      if (stats.level !== undefined) {
        if (typeof stats.level !== 'number' || isNaN(stats.level) || stats.level < 1 || stats.level > 100 || !Number.isInteger(stats.level)) {
          errors.level = 'Level must be an integer between 1 and 100';
          isValid = false;
        }
      }
      
      return { valid: isValid, errors };
    }
    
    /**
     * Fetch with timeout
     * @param {string} url - URL to fetch
     * @param {Object} options - Fetch options
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {Promise<Response>} - Fetch response
     */
    async _fetchWithTimeout(url, options = {}, timeout = 5000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    }
    
    /**
     * Handle error response
     * @param {Response} response - Fetch response
     * @returns {Promise<string>} - Error message
     */
    async _handleErrorResponse(response) {
      try {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          return errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`;
        } else {
          const text = await response.text();
          return text || `Error ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        return `Error ${response.status}: ${response.statusText}`;
      }
    }
    
    /**
     * Handle fetch error
     * @param {Error} error - Fetch error
     * @param {string} defaultMessage - Default error message
     * @returns {Object} - Error object
     */
    _handleFetchError(error, defaultMessage) {
      console.error(defaultMessage, error);
      
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out' };
      }
      
      return { success: false, error: error.message || defaultMessage };
    }
    
    /**
     * Sanitize player data
     * @param {Object} playerData - Player data to sanitize
     * @returns {Object} - Sanitized player data
     */
    _sanitizePlayerData(playerData) {
      const sanitized = {};
      
      // Only include valid fields
      const validFields = [
        'username', 'health', 'max_health', 'strength', 
        'wisdomness', 'benchpress', 'curl', 'experience', 'level'
      ];
      
      for (const field of validFields) {
        if (playerData[field] !== undefined) {
          // Validate numeric fields
          if (['health', 'max_health', 'strength', 'wisdomness', 'benchpress', 'curl', 'experience', 'level'].includes(field)) {
            const value = parseFloat(playerData[field]);
            sanitized[field] = isNaN(value) ? undefined : value;
          } else {
            sanitized[field] = playerData[field];
          }
        }
      }
      
      return sanitized;
    }
  }
  
  // Check if we're in a browser or Node.js environment
  if (typeof window !== 'undefined') {
    // Browser environment
    window.APIClient = APIClient;
  } else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = APIClient;
  }