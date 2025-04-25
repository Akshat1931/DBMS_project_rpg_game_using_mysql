const express = require('express');
const app = express();
const db = require('./database');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const validation = require('./input-validation');

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Built-in body parser
app.use(bodyParser.json()); // Additional body parser
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from root

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error in request handling:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

// CREATE a new player with validation
app.post('/api/player', (req, res) => {
  try {
    const { username, health, strength, wisdomness, benchpress, curl, experience, level } = req.body;
    
    // Validate username
    const usernameValidation = validation.validateUsername(username || `Player${Date.now()}`);
    if (!usernameValidation.valid) {
      return res.status(400).json({ error: usernameValidation.message });
    }
    
    // Validate player stats
    const statsValidation = validation.validatePlayerStats({
      health, strength, wisdomness, benchpress, curl, experience, level
    });
    
    if (!statsValidation.valid) {
      return res.status(400).json({ 
        error: 'Invalid player stats', 
        details: statsValidation.errors 
      });
    }
    
    const finalUsername = username || `Player${Date.now()}`;
    
    const query = `
      INSERT INTO players 
      (username, health, strength, wisdomness, benchpress, curl, experience, level) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      finalUsername,
      health || 100,
      strength || 50,
      wisdomness || 5,
      benchpress || 20,
      curl || 100,
      experience || 0,
      level || 1
    ];
    
    db.query(query, values, (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            error: 'Username already exists',
            details: 'Please choose a different username'
          });
        }
        console.error('Error creating player:', err);
        return res.status(500).json({ error: err.message });
      }
      
      // Create initial player location
      const locationQuery = `
        INSERT INTO player_location (player_id, x_coordinate, y_coordinate, z_coordinate)
        VALUES (?, 0, 0, 0)
      `;
      
      db.query(locationQuery, [results.insertId], (locErr) => {
        if (locErr) {
          console.error('Error creating player location:', locErr);
          // Continue anyway since the player was created
        }
        
        // Create initial leaderboard entry
        const leaderboardQuery = `
          INSERT INTO leaderboards (player_id, score, \`rank\`)
          VALUES (?, 0, 0)
        `;
        
        db.query(leaderboardQuery, [results.insertId], (lbErr) => {
          if (lbErr) {
            console.error('Error creating leaderboard entry:', lbErr);
            // Continue anyway since the player was created
          }
          
          res.status(201).json({ 
            id: results.insertId, 
            username: finalUsername,
            health: values[1],
            strength: values[2],
            wisdomness: values[3],
            benchpress: values[4],
            curl: values[5],
            experience: values[6],
            level: values[7]
          });
        });
      });
    });
  } catch (err) {
    console.error('Unexpected error in player creation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE player stats with validation
app.put('/api/player/:id', (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate player ID
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    
    // Validate player stats
    const statsValidation = validation.validatePlayerStats(req.body);
    if (!statsValidation.valid) {
      return res.status(400).json({ 
        error: 'Invalid player stats', 
        details: statsValidation.errors 
      });
    }
    
    // First check if player exists
    db.query('SELECT id FROM players WHERE id = ?', [playerId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error checking player existence:', checkErr);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (checkResults.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      // Player exists, proceed with update
      console.log('Updating player:', playerId, req.body);
      
      const query = `
        UPDATE players 
        SET health = ?, strength = ?, wisdomness = ?, 
            benchpress = ?, curl = ?, experience = ?, level = ?
        WHERE id = ?
      `;
      
      const values = [
        req.body.health,
        req.body.strength,
        req.body.wisdomness,
        req.body.benchpress,
        req.body.curl,
        req.body.experience,
        req.body.level,
        playerId
      ];
      
      db.query(query, values, (err, results) => {
        if (err) {
          console.error('Error updating player:', err);
          return res.status(500).json({ error: err.message });
        }
        
        // Update leaderboard score based on experience
        const leaderboardQuery = `
          UPDATE leaderboards 
          SET score = ? 
          WHERE player_id = ?
        `;
        
        db.query(leaderboardQuery, [req.body.experience || 0, playerId], (lbErr) => {
          if (lbErr) {
            console.error('Error updating leaderboard:', lbErr);
            // Continue anyway since the player was updated
          }
          
          res.json({ 
            success: true,
            message: 'Player updated successfully',
            playerId: playerId
          });
        });
      });
    });
  } catch (err) {
    console.error('Unexpected error in player update:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET player stats with validation
app.get('/api/player/:id', (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate player ID
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    
    console.log('Getting player:', playerId);
    
    // Query the database to get the player data based on the ID
    db.query('SELECT * FROM players WHERE id = ?', [playerId], (fetchErr, playerDetails) => {
      if (fetchErr) {
        console.error('Error fetching player details:', fetchErr);
        return res.status(500).json({ 
          error: 'Database error',
          details: fetchErr.message 
        });
      }
      
      if (playerDetails.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      // Send back the player details
      res.status(200).json(playerDetails[0]);
    });
  } catch (err) {
    console.error('Unexpected error in player retrieval:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all players
app.get('/api/players', (req, res) => {
  try {
    console.log('Getting all players');
    
    db.query('SELECT * FROM players', (err, results) => {
      if (err) {
        console.error('Error getting players:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Found players:', results.length);
      res.json(results);
    });
  } catch (err) {
    console.error('Unexpected error in players retrieval:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a player with validation
app.delete('/api/player/:id', (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate player ID
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    
    console.log('Deleting player:', playerId);
    
    // First check if player exists
    db.query('SELECT id FROM players WHERE id = ?', [playerId], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error checking player existence:', checkErr);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (checkResults.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      // Player exists, proceed with deletion
      db.query('DELETE FROM players WHERE id = ?', [playerId], (err, results) => {
        if (err) {
          console.error('Error deleting player:', err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log('Player deleted:', results);
        res.json({ 
          success: true,
          message: 'Player deleted successfully',
          playerId: playerId
        });
      });
    });
  } catch (err) {
    console.error('Unexpected error in player deletion:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET leaderboard data
app.get('/api/leaderboard', (req, res) => {
  try {
    console.log('Getting leaderboard data');
    
    // Query to fetch players sorted by experience in descending order
    const query = `
      SELECT p.id, p.username, p.experience, p.level 
      FROM players p
      ORDER BY p.experience DESC 
      LIMIT 10
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error getting leaderboard data:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Found leaderboard entries:', results.length);
      
      // Add rank to each player
      const rankedResults = results.map((player, index) => ({
        ...player,
        rank: index + 1
      }));
      
      res.json(rankedResults);
    });
  } catch (err) {
    console.error('Unexpected error in leaderboard retrieval:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ENDPOINT: GET player statistics report
app.get('/api/player/:id/report', (req, res) => {
  try {
    const playerId = parseInt(req.params.id);
    
    // Validate player ID
    if (isNaN(playerId) || playerId <= 0) {
      return res.status(400).json({ error: 'Invalid player ID' });
    }
    
    console.log('Generating report for player:', playerId);
    
    // Get player data
    db.query('SELECT * FROM players WHERE id = ?', [playerId], (playerErr, playerResult) => {
      if (playerErr) {
        console.error('Error fetching player for report:', playerErr);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (playerResult.length === 0) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const player = playerResult[0];
      
      // Get player location
      db.query('SELECT * FROM player_location WHERE player_id = ?', [playerId], (locErr, locResult) => {
        const location = locResult.length > 0 ? locResult[0] : { x_coordinate: 0, y_coordinate: 0, z_coordinate: 0 };
        
        // Get player inventory
        db.query('SELECT * FROM inventory WHERE player_id = ?', [playerId], (invErr, invResult) => {
          const inventory = invErr ? [] : invResult;
          
          // Get player monster kills
          db.query('SELECT * FROM player_monster_kills WHERE player_id = ?', [playerId], (killsErr, killsResult) => {
            const monsterKills = killsErr ? [] : killsResult;
            
            // Get leaderboard data
            db.query('SELECT * FROM leaderboards WHERE player_id = ?', [playerId], (lbErr, lbResult) => {
              const leaderboard = lbResult.length > 0 ? lbResult[0] : { score: 0, rank: 0 };
              
              // Calculate player's global rank
              db.query('SELECT COUNT(*) as rank FROM players WHERE experience > ?', [player.experience], (rankErr, rankResult) => {
                const globalRank = rankErr ? 0 : (rankResult[0].rank + 1);
                
                // Build comprehensive player report
                const report = {
                  player: {
                    id: player.id,
                    username: player.username,
                    created_at: player.created_at,
                    last_active: new Date().toISOString()
                  },
                  stats: {
                    level: player.level,
                    experience: player.experience,
                    health: player.health,
                    max_health: player.max_health,
                    strength: player.strength,
                    wisdomness: player.wisdomness,
                    benchpress: player.benchpress,
                    curl: player.curl
                  },
                  location: {
                    x: location.x_coordinate,
                    y: location.y_coordinate,
                    z: location.z_coordinate,
                    area: getAreaName(location.x_coordinate, location.z_coordinate)
                  },
                  inventory: {
                    items: inventory.map(item => ({
                      name: item.item_name,
                      quantity: item.quantity
                    })),
                    total_items: inventory.reduce((sum, item) => sum + item.quantity, 0)
                  },
                  combat: {
                    monster_kills: monsterKills.map(k => ({
                      type: k.monster_type,
                      count: k.kills
                    })),
                    total_kills: monsterKills.reduce((sum, k) => sum + k.kills, 0)
                  },
                  rankings: {
                    score: leaderboard.score,
                    local_rank: leaderboard.rank,
                    global_rank: globalRank
                  },
                  achievements: calculateAchievements(player, monsterKills),
                  generated_at: new Date().toISOString()
                };
                
                res.status(200).json(report);
              });
            });
          });
        });
      });
    });
  } catch (err) {
    console.error('Unexpected error in player report generation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW ENDPOINT: GET game statistics report
app.get('/api/game/report', (req, res) => {
  try {
    console.log('Generating game report');
    
    // Get total player count
    db.query('SELECT COUNT(*) as total_players FROM players', (playerErr, playerResult) => {
      if (playerErr) {
        console.error('Error getting player count:', playerErr);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const totalPlayers = playerResult[0].total_players;
      
      // Get average player stats
      const statsQuery = `
        SELECT 
          AVG(level) as avg_level,
          AVG(experience) as avg_experience,
          AVG(health) as avg_health,
          AVG(strength) as avg_strength,
          AVG(wisdomness) as avg_wisdomness,
          AVG(benchpress) as avg_benchpress,
          AVG(curl) as avg_curl
        FROM players
      `;
      
      db.query(statsQuery, (statsErr, statsResult) => {
        if (statsErr) {
          console.error('Error getting average stats:', statsErr);
          return res.status(500).json({ error: 'Database error' });
        }
        
        const avgStats = statsResult[0];
        
        // Get top players by experience
        db.query('SELECT id, username, experience, level FROM players ORDER BY experience DESC LIMIT 5', (topErr, topPlayers) => {
          if (topErr) {
            console.error('Error getting top players:', topErr);
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Get total monster kills by type
          db.query('SELECT monster_type, SUM(kills) as total_kills FROM player_monster_kills GROUP BY monster_type', (killsErr, killsResult) => {
            const monsterKills = killsErr ? [] : killsResult;
            
            // Build game statistics report
            const report = {
              players: {
                total: totalPlayers,
                average_stats: {
                  level: Math.round(avgStats.avg_level * 10) / 10,
                  experience: Math.round(avgStats.avg_experience),
                  health: Math.round(avgStats.avg_health),
                  strength: Math.round(avgStats.avg_strength * 10) / 10,
                  wisdomness: Math.round(avgStats.avg_wisdomness * 10) / 10,
                  benchpress: Math.round(avgStats.avg_benchpress * 10) / 10,
                  curl: Math.round(avgStats.avg_curl * 10) / 10
                },
                top_players: topPlayers
              },
              combat: {
                monster_kills: monsterKills,
                total_kills: monsterKills.reduce((sum, type) => sum + type.total_kills, 0)
              },
              generated_at: new Date().toISOString()
            };
            
            res.status(200).json(report);
          });
        });
      });
    });
  } catch (err) {
    console.error('Unexpected error in game report generation:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to determine area name based on coordinates
function getAreaName(x, z) {
  // Define world regions based on coordinates
  if (Math.abs(x) < 50 && Math.abs(z) < 50) {
    return "Honeywood Village";
  } else if (x > 100 && z > 100) {
    return "Eastern Wilderness";
  } else if (x < -100 && z < -100) {
    return "Western Mountains";
  } else if (x > 100 && z < -100) {
    return "Southern Desert";
  } else if (x < -100 && z > 100) {
    return "Northern Forest";
  } else {
    return "Unknown Lands";
  }
}

// Helper function to calculate achievements
function calculateAchievements(player, monsterKills) {
  const achievements = [];
  
  // Level-based achievements
  if (player.level >= 5) achievements.push({ name: "Apprentice Adventurer", description: "Reach level 5" });
  if (player.level >= 10) achievements.push({ name: "Seasoned Explorer", description: "Reach level 10" });
  if (player.level >= 20) achievements.push({ name: "Veteran Hero", description: "Reach level 20" });
  
  // Stat-based achievements
  if (player.strength >= 75) achievements.push({ name: "Mighty Warrior", description: "Reach 75 strength" });
  if (player.wisdomness >= 75) achievements.push({ name: "Wise Sage", description: "Reach 75 wisdomness" });
  if (player.benchpress >= 75) achievements.push({ name: "Iron Pumper", description: "Reach 75 benchpress" });
  if (player.curl >= 75) achievements.push({ name: "Arm Master", description: "Reach 75 curl" });
  
  // Kill-based achievements
  const totalKills = monsterKills.reduce((sum, k) => sum + k.kills, 0);
  if (totalKills >= 10) achievements.push({ name: "Monster Hunter", description: "Defeat 10 monsters" });
  if (totalKills >= 50) achievements.push({ name: "Monster Slayer", description: "Defeat 50 monsters" });
  if (totalKills >= 100) achievements.push({ name: "Monster Nemesis", description: "Defeat 100 monsters" });
  
  return achievements;
}

// Serve login.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Add endpoint for game world status report
app.get('/api/world/status', (req, res) => {
  try {
    // Get active players (players who have moved in the last hour)
    const activePlayersQuery = `
      SELECT COUNT(*) as active_count 
      FROM player_location 
      WHERE updated_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `;
    
    // This would work if we had an updated_at column
    // For now, just count all players as active
    db.query('SELECT COUNT(*) as active_count FROM players', (activeErr, activeResult) => {
      const activeCount = activeErr ? 0 : activeResult[0].active_count;
      
      // Get world regions population
      const regionCountQuery = `
        SELECT 
          CASE
            WHEN x_coordinate BETWEEN -50 AND 50 AND z_coordinate BETWEEN -50 AND 50 THEN 'Honeywood Village'
            WHEN x_coordinate > 100 AND z_coordinate > 100 THEN 'Eastern Wilderness'
            WHEN x_coordinate < -100 AND z_coordinate < -100 THEN 'Western Mountains'
            WHEN x_coordinate > 100 AND z_coordinate < -100 THEN 'Southern Desert'
            WHEN x_coordinate < -100 AND z_coordinate > 100 THEN 'Northern Forest'
            ELSE 'Unknown Lands'
          END as region,
          COUNT(*) as population
        FROM player_location
        GROUP BY region
      `;
      
      // Since we might not have enough location data, create some dummy data
      const regionData = [
        { region: 'Honeywood Village', population: Math.floor(activeCount * 0.4) },
        { region: 'Eastern Wilderness', population: Math.floor(activeCount * 0.15) },
        { region: 'Western Mountains', population: Math.floor(activeCount * 0.15) },
        { region: 'Southern Desert', population: Math.floor(activeCount * 0.1) },
        { region: 'Northern Forest', population: Math.floor(activeCount * 0.1) },
        { region: 'Unknown Lands', population: Math.floor(activeCount * 0.1) }
      ];
      
      // Build world status report
      const report = {
        players: {
          active: activeCount,
          regions: regionData
        },
        world_time: {
          current_time: new Date().toISOString(),
          day_cycle: getDayCycle(),
          weather: getRandomWeather()
        },
        generated_at: new Date().toISOString()
      };
      
      res.status(200).json(report);
    });
  } catch (err) {
    console.error('Unexpected error in world status report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get current day/night cycle
function getDayCycle() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8) return "Dawn";
  if (hour >= 8 && hour < 18) return "Day";
  if (hour >= 18 && hour < 20) return "Dusk";
  return "Night";
}

// Helper function for random weather
function getRandomWeather() {
  const weathers = ["Clear", "Cloudy", "Rainy", "Stormy", "Foggy"];
  return weathers[Math.floor(Math.random() * weathers.length)];
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});