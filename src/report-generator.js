// src/report-generator.js
// Handles generation of reports for game data

/**
 * Report Generator for Fantasy Protocol
 * Generates formatted reports for player stats, game world status, etc.
 * All reports follow a consistent legible format
 */

class ReportGenerator {
    /**
     * Generate a player stats report
     * @param {Object} playerData - The raw player data
     * @returns {Object} - Formatted player stats report
     */
    static generatePlayerReport(playerData) {
      if (!playerData || typeof playerData !== 'object') {
        return {
          error: 'Invalid player data',
          timestamp: new Date().toISOString()
        };
      }
      
      try {
        // Calculate level progress
        const nextLevelXP = this._calculateXPForNextLevel(playerData.level || 1);
        const currentLevelXP = this._calculateTotalXPForLevel(playerData.level || 1);
        const xpNeeded = nextLevelXP;
        const xpProgress = playerData.experience ? 
          Math.min(playerData.experience - currentLevelXP, xpNeeded) : 0;
        const progressPercent = Math.floor((xpProgress / xpNeeded) * 100);
        
        // Format creation date
        const createdDate = playerData.created_at ? 
          new Date(playerData.created_at).toLocaleDateString() : 'Unknown';
        
        // Generate report with validated data
        return {
          report_type: 'player_stats',
          timestamp: new Date().toISOString(),
          character: {
            id: playerData.id || 0,
            name: this._sanitizeString(playerData.username || 'Unknown'),
            level: this._validateNumber(playerData.level, 1, 100, 1),
            created_at: createdDate
          },
          vital_stats: {
            health: this._validateNumber(playerData.health, 0, 1000, 100),
            max_health: this._validateNumber(playerData.max_health, 1, 1000, 100),
            health_percent: Math.floor(
              (this._validateNumber(playerData.health, 0, 1000, 100) / 
               this._validateNumber(playerData.max_health, 1, 1000, 100)) * 100
            )
          },
          attributes: {
            strength: this._validateNumber(playerData.strength, 1, 100, 50),
            wisdomness: this._validateNumber(playerData.wisdomness, 1, 100, 5),
            benchpress: this._validateNumber(playerData.benchpress, 1, 100, 20),
            curl: this._validateNumber(playerData.curl, 1, 100, 100)
          },
          progression: {
            experience: this._validateNumber(playerData.experience, 0, 1000000, 0),
            experience_to_next_level: nextLevelXP,
            progress_percent: progressPercent,
            total_experience_needed: nextLevelXP + currentLevelXP
          }
        };
      } catch (error) {
        console.error('Error generating player report:', error);
        return {
          error: 'Failed to generate player report',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    /**
     * Generate a leaderboard report
     * @param {Array} leaderboardData - The raw leaderboard data
     * @returns {Object} - Formatted leaderboard report
     */
    static generateLeaderboardReport(leaderboardData) {
      if (!Array.isArray(leaderboardData)) {
        return {
          error: 'Invalid leaderboard data',
          timestamp: new Date().toISOString()
        };
      }
      
      try {
        // Validate and format leaderboard entries
        const validatedEntries = leaderboardData.map((entry, index) => ({
          rank: entry.rank || index + 1,
          player_id: entry.id || 0,
          username: this._sanitizeString(entry.username || 'Unknown'),
          level: this._validateNumber(entry.level, 1, 100, 1),
          experience: this._validateNumber(entry.experience, 0, 1000000, 0)
        }));
        
        // Sort by rank if available, otherwise by experience
        validatedEntries.sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          return b.experience - a.experience;
        });
        
        // Calculate statistics
        const totalPlayers = validatedEntries.length;
        const averageLevel = totalPlayers > 0 ? 
          Math.round(validatedEntries.reduce((sum, entry) => sum + entry.level, 0) / totalPlayers * 10) / 10 : 0;
        const highestLevel = totalPlayers > 0 ? 
          Math.max(...validatedEntries.map(entry => entry.level)) : 0;
        
        return {
          report_type: 'leaderboard',
          timestamp: new Date().toISOString(),
          statistics: {
            total_players: totalPlayers,
            average_level: averageLevel,
            highest_level: highestLevel
          },
          entries: validatedEntries.slice(0, 10) // Limit to top 10
        };
      } catch (error) {
        console.error('Error generating leaderboard report:', error);
        return {
          error: 'Failed to generate leaderboard report',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    /**
     * Generate a world status report
     * @param {Object} worldData - The raw world data
     * @returns {Object} - Formatted world status report
     */
    static generateWorldStatusReport(worldData) {
      if (!worldData || typeof worldData !== 'object') {
        return {
          error: 'Invalid world data',
          timestamp: new Date().toISOString()
        };
      }
      
      try {
        // Validate and extract world time data
        const worldTime = worldData.world_time || {};
        const dayCycle = this._sanitizeString(worldTime.day_cycle || 'Day');
        const weather = this._sanitizeString(worldTime.weather || 'Clear');
        
        // Validate and extract player data
        const playerData = worldData.players || {};
        const activePlayers = this._validateNumber(playerData.active, 0, 1000000, 0);
        
        // Validate region data
        const regionData = Array.isArray(playerData.regions) ? 
          playerData.regions.map(region => ({
            region: this._sanitizeString(region.region || 'Unknown'),
            population: this._validateNumber(region.population, 0, 1000000, 0)
          })) : [];
        
        return {
          report_type: 'world_status',
          timestamp: new Date().toISOString(),
          environment: {
            time_of_day: dayCycle,
            weather: weather,
            effects: this._getEnvironmentalEffects(dayCycle, weather)
          },
          population: {
            active_players: activePlayers,
            regions: regionData,
            highest_population: regionData.length > 0 ? 
              Math.max(...regionData.map(r => r.population)) : 0
          }
        };
      } catch (error) {
        console.error('Error generating world status report:', error);
        return {
          error: 'Failed to generate world status report',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    /**
     * Generate a player combat report
     * @param {Object} combatData - The raw combat data
     * @returns {Object} - Formatted combat report
     */
    static generateCombatReport(combatData) {
      if (!combatData || typeof combatData !== 'object') {
        return {
          error: 'Invalid combat data',
          timestamp: new Date().toISOString()
        };
      }
      
      try {
        // Validate player data
        const player = combatData.player || {};
        const playerId = player.id || 0;
        const playerName = this._sanitizeString(player.username || 'Unknown');
        const playerLevel = this._validateNumber(player.level, 1, 100, 1);
        
        // Validate monster data
        const monster = combatData.monster || {};
        const monsterType = this._sanitizeString(monster.type || 'Unknown');
        const monsterLevel = this._validateNumber(monster.level, 1, 100, 1);
        
        // Validate combat results
        const result = combatData.result || {};
        const playerDamageDealt = this._validateNumber(result.player_damage_dealt, 0, 1000000, 0);
        const playerDamageTaken = this._validateNumber(result.player_damage_taken, 0, 1000000, 0);
        const experienceGained = this._validateNumber(result.experience_gained, 0, 1000000, 0);
        const itemsDropped = Array.isArray(result.items_dropped) ? 
          result.items_dropped.map(item => ({
            name: this._sanitizeString(item.name || 'Unknown'),
            quantity: this._validateNumber(item.quantity, 0, 1000, 1)
          })) : [];
        
        // Determine outcome
        const outcome = result.player_won ? 'Victory' : 'Defeat';
        const duration = this._validateNumber(result.duration, 0, 3600, 0);
        
        return {
          report_type: 'combat',
          timestamp: new Date().toISOString(),
          combatants: {
            player: {
              id: playerId,
              name: playerName,
              level: playerLevel
            },
            monster: {
              type: monsterType,
              level: monsterLevel
            }
          },
          battle_details: {
            duration_seconds: duration,
            outcome: outcome,
            player_damage_dealt: playerDamageDealt,
            player_damage_taken: playerDamageTaken
          },
          rewards: {
            experience_gained: experienceGained,
            items_dropped: itemsDropped
          }
        };
      } catch (error) {
        console.error('Error generating combat report:', error);
        return {
          error: 'Failed to generate combat report',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    /**
     * Generate HTML output for a report
     * @param {Object} report - The report data
     * @returns {string} - HTML representation of the report
     */
    static generateHTMLReport(report) {
      if (!report || typeof report !== 'object') {
        return '<div class="error">Invalid report data</div>';
      }
      
      try {
        // Start with the HTML template
        let html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Fantasy Protocol - ${report.report_type || 'Report'}</title>
            <style>
              body {
                font-family: 'IM Fell French Canon', serif;
                background-color: #1a1a2e;
                color: #fff;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
              }
              .report-container {
                max-width: 800px;
                margin: 0 auto;
                background-color: rgba(30, 30, 60, 0.8);
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                padding: 20px;
                border: 1px solid #38385f;
              }
              .report-header {
                border-bottom: 2px solid #38385f;
                padding-bottom: 15px;
                margin-bottom: 20px;
                text-align: center;
              }
              .report-title {
                font-size: 28px;
                color: #e5ac5c;
                margin: 0;
              }
              .report-timestamp {
                font-size: 14px;
                color: #b4b4db;
                font-style: italic;
              }
              .report-section {
                margin-bottom: 25px;
              }
              .section-title {
                font-size: 20px;
                color: #e5ac5c;
                border-bottom: 1px solid #38385f;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              .stat-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 10px;
                border-radius: 5px;
              }
              .stat-row:nth-child(odd) {
                background-color: rgba(40, 40, 80, 0.6);
              }
              .stat-label {
                font-weight: bold;
                color: #b4b4db;
              }
              .stat-value {
                color: #fff;
              }
              .progress-bar {
                background-color: rgba(40, 40, 80, 0.6);
                height: 20px;
                border-radius: 10px;
                margin-top: 5px;
                overflow: hidden;
              }
              .progress-fill {
                height: 100%;
                background-color: #e5ac5c;
                border-radius: 10px;
              }
              .error {
                color: #ff6b6b;
                text-align: center;
                font-size: 18px;
                padding: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
              }
              th, td {
                padding: 8px 12px;
                text-align: left;
                border-bottom: 1px solid #38385f;
              }
              th {
                color: #e5ac5c;
                font-weight: bold;
                background-color: rgba(40, 40, 80, 0.6);
              }
              tr:nth-child(odd) {
                background-color: rgba(40, 40, 80, 0.3);
              }
            </style>
          </head>
          <body>
            <div class="report-container">
              <div class="report-header">
                <h1 class="report-title">${this._getTitleForReport(report)}</h1>
                <div class="report-timestamp">Generated on ${new Date(report.timestamp || Date.now()).toLocaleString()}</div>
              </div>
        `;
        
        // Render appropriate report sections based on report type
        if (report.error) {
          html += `<div class="error">${report.error}</div>`;
        } else if (report.report_type === 'player_stats') {
          html += this._renderPlayerStatsHTML(report);
        } else if (report.report_type === 'leaderboard') {
          html += this._renderLeaderboardHTML(report);
        } else if (report.report_type === 'world_status') {
          html += this._renderWorldStatusHTML(report);
        } else if (report.report_type === 'combat') {
          html += this._renderCombatReportHTML(report);
        }
        
        // Close the HTML template
        html += `
            </div>
          </body>
          </html>
        `;
        
        return html;
      } catch (error) {
        console.error('Error generating HTML report:', error);
        return '<div class="error">Failed to generate HTML report</div>';
      }
    }
    
    /**
     * Get the title for a report
     * @param {Object} report - The report object
     * @returns {string} - Appropriate title based on report type
     */
    static _getTitleForReport(report) {
      switch (report.report_type) {
        case 'player_stats':
          return `Adventurer Profile: ${report.character?.name || 'Unknown'}`;
        case 'leaderboard':
          return 'Top Adventurers of the Realm';
        case 'world_status':
          return 'World Status Report';
        case 'combat':
          return 'Combat Report';
        default:
          return 'Fantasy Protocol Report';
      }
    }
    
    /**
     * Render player stats report HTML
     * @param {Object} report - Player stats report
     * @returns {string} - HTML for player stats
     */
    static _renderPlayerStatsHTML(report) {
      const character = report.character || {};
      const vitalStats = report.vital_stats || {};
      const attributes = report.attributes || {};
      const progression = report.progression || {};
      
      return `
        <div class="report-section">
          <h2 class="section-title">Character Information</h2>
          <div class="stat-row">
            <span class="stat-label">Name:</span>
            <span class="stat-value">${character.name || 'Unknown'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Level:</span>
            <span class="stat-value">${character.level || 1}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Created:</span>
            <span class="stat-value">${character.created_at || 'Unknown'}</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Vital Statistics</h2>
          <div class="stat-row">
            <span class="stat-label">Health:</span>
            <span class="stat-value">${vitalStats.health || 0} / ${vitalStats.max_health || 100}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${vitalStats.health_percent || 0}%;"></div>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Attributes</h2>
          <div class="stat-row">
            <span class="stat-label">Strength:</span>
            <span class="stat-value">${attributes.strength || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Wisdomness:</span>
            <span class="stat-value">${attributes.wisdomness || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Benchpress:</span>
            <span class="stat-value">${attributes.benchpress || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Curl:</span>
            <span class="stat-value">${attributes.curl || 0}</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Progression</h2>
          <div class="stat-row">
            <span class="stat-label">Experience:</span>
            <span class="stat-value">${this._formatNumber(progression.experience || 0)} / ${this._formatNumber(progression.total_experience_needed || 0)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progression.progress_percent || 0}%;"></div>
          </div>
          <div class="stat-row">
            <span class="stat-label">Next Level:</span>
            <span class="stat-value">${this._formatNumber(progression.experience_to_next_level || 0)} XP needed</span>
          </div>
        </div>
      `;
    }
    
    /**
     * Render leaderboard report HTML
     * @param {Object} report - Leaderboard report
     * @returns {string} - HTML for leaderboard
     */
    static _renderLeaderboardHTML(report) {
      const statistics = report.statistics || {};
      const entries = report.entries || [];
      
      let entriesHTML = '';
      if (entries.length > 0) {
        entriesHTML = `
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Adventurer</th>
                <th>Level</th>
                <th>Experience</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        for (const entry of entries) {
          entriesHTML += `
            <tr>
              <td>${entry.rank || 0}</td>
              <td>${entry.username || 'Unknown'}</td>
              <td>${entry.level || 1}</td>
              <td>${this._formatNumber(entry.experience || 0)}</td>
            </tr>
          `;
        }
        
        entriesHTML += `
            </tbody>
          </table>
        `;
      } else {
        entriesHTML = '<p>No leaderboard entries found.</p>';
      }
      
      return `
        <div class="report-section">
          <h2 class="section-title">Statistics</h2>
          <div class="stat-row">
            <span class="stat-label">Total Players:</span>
            <span class="stat-value">${statistics.total_players || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Average Level:</span>
            <span class="stat-value">${statistics.average_level || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Highest Level:</span>
            <span class="stat-value">${statistics.highest_level || 0}</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Top Adventurers</h2>
          ${entriesHTML}
        </div>
      `;
    }
    
    /**
     * Render world status report HTML
     * @param {Object} report - World status report
     * @returns {string} - HTML for world status
     */
    static _renderWorldStatusHTML(report) {
      const environment = report.environment || {};
      const population = report.population || {};
      const regions = population.regions || [];
      
      let regionsHTML = '';
      if (regions.length > 0) {
        regionsHTML = `
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Population</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        for (const region of regions) {
          regionsHTML += `
            <tr>
              <td>${region.region || 'Unknown'}</td>
              <td>${region.population || 0}</td>
            </tr>
          `;
        }
        
        regionsHTML += `
            </tbody>
          </table>
        `;
      } else {
        regionsHTML = '<p>No region data available.</p>';
      }
      
      return `
        <div class="report-section">
          <h2 class="section-title">Environment</h2>
          <div class="stat-row">
            <span class="stat-label">Time of Day:</span>
            <span class="stat-value">${environment.time_of_day || 'Unknown'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Weather:</span>
            <span class="stat-value">${environment.weather || 'Unknown'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Effects:</span>
            <span class="stat-value">${environment.effects || 'None'}</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Population</h2>
          <div class="stat-row">
            <span class="stat-label">Active Players:</span>
            <span class="stat-value">${population.active_players || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Highest Region Population:</span>
            <span class="stat-value">${population.highest_population || 0}</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Region Breakdown</h2>
          ${regionsHTML}
        </div>
      `;
    }
    
    /**
     * Render combat report HTML
     * @param {Object} report - Combat report
     * @returns {string} - HTML for combat report
     */
    static _renderCombatReportHTML(report) {
      const combatants = report.combatants || {};
      const player = combatants.player || {};
      const monster = combatants.monster || {};
      const battle = report.battle_details || {};
      const rewards = report.rewards || {};
      const items = rewards.items_dropped || [];
      
      let itemsHTML = '';
      if (items.length > 0) {
        itemsHTML = `
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        for (const item of items) {
          itemsHTML += `
            <tr>
              <td>${item.name || 'Unknown'}</td>
              <td>${item.quantity || 1}</td>
            </tr>
          `;
        }
        
        itemsHTML += `
            </tbody>
          </table>
        `;
      } else {
        itemsHTML = '<p>No items dropped.</p>';
      }
      
      return `
        <div class="report-section">
          <h2 class="section-title">Combatants</h2>
          <div class="stat-row">
            <span class="stat-label">Player:</span>
            <span class="stat-value">${player.name || 'Unknown'} (Level ${player.level || 1})</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Monster:</span>
            <span class="stat-value">${monster.type || 'Unknown'} (Level ${monster.level || 1})</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Battle Details</h2>
          <div class="stat-row">
            <span class="stat-label">Outcome:</span>
            <span class="stat-value">${battle.outcome || 'Unknown'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">${this._formatTime(battle.duration_seconds || 0)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Damage Dealt:</span>
            <span class="stat-value">${battle.player_damage_dealt || 0}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Damage Taken:</span>
            <span class="stat-value">${battle.player_damage_taken || 0}</span>
          </div>
        </div>
        
        <div class="report-section">
          <h2 class="section-title">Rewards</h2>
          <div class="stat-row">
            <span class="stat-label">Experience Gained:</span>
            <span class="stat-value">${this._formatNumber(rewards.experience_gained || 0)}</span>
          </div>
          <h3>Items Dropped</h3>
          ${itemsHTML}
        </div>
      `;
    }
    
    /**
     * Get environmental effects based on day cycle and weather
     * @param {string} dayCycle - Time of day
     * @param {string} weather - Weather condition
     * @returns {string} - Description of environmental effects
     */
    static _getEnvironmentalEffects(dayCycle, weather) {
      if (dayCycle === 'Night' && weather === 'Foggy') {
        return 'Reduced visibility, monsters more aggressive';
      } else if (dayCycle === 'Night') {
        return 'Monsters more aggressive, increased drop rates';
      } else if (weather === 'Stormy') {
        return 'Reduced speed, lightning damage possible';
      } else if (weather === 'Rainy') {
        return 'Slippery terrain, reduced fire damage';
      } else if (weather === 'Foggy') {
        return 'Reduced visibility range';
      } else if (dayCycle === 'Dawn' || dayCycle === 'Dusk') {
        return 'Transitional period, balanced effects';
      } else {
        return 'Normal conditions';
      }
    }
    
    /**
     * Calculate XP required for next level
     * @param {number} level - Current level
     * @returns {number} - XP required for next level
     */
    static _calculateXPForNextLevel(level) {
      return Math.round(2 ** (level) * 100);
    }
    
    /**
     * Calculate total XP required to reach current level
     * @param {number} level - Current level
     * @returns {number} - Total XP required
     */
    static _calculateTotalXPForLevel(level) {
      if (level <= 1) return 0;
      
      let totalXP = 0;
      for (let i = 1; i < level; i++) {
        totalXP += Math.round(2 ** (i - 1) * 100);
      }
      return totalXP;
    }
    
    /**
     * Format number with commas for readability
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    static _formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    /**
     * Format time in seconds to MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time
     */
    static _formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Validate and sanitize a number
     * @param {number} value - Value to validate
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @param {number} defaultValue - Default value if invalid
     * @returns {number} - Validated number
     */
    static _validateNumber(value, min, max, defaultValue) {
      if (typeof value !== 'number' || isNaN(value) || value < min || value > max) {
        return defaultValue;
      }
      return Math.floor(value); // Ensure integer
    }
    
    /**
     * Sanitize a string to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} - Sanitized string
     */
    static _sanitizeString(str) {
      if (typeof str !== 'string') {
        return '';
      }
      return str.replace(/[<>]/g, '');
    }
  }
  
  // Check if we're in a browser or Node.js environment
  if (typeof window !== 'undefined') {
    // Browser environment
    window.ReportGenerator = ReportGenerator;
  } else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = ReportGenerator;
  }