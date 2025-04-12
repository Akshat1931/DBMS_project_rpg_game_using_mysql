const express = require('express');
const app = express();
const db = require('./database');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

// Middleware


// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Built-in body parser
app.use(bodyParser.json()); // Additional body parser
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from root

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

// Create a new player
app.post('/api/player', (req, res) => {
  const { username, health, strength, wisdomness, benchpress, curl, experience, level } = req.body;
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
      res.status(500).json({ error: err.message });
    } else {
      res.json({ 
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
    }
  });
});



// Update player stats
app.put('/api/player/:id', (req, res) => {
  console.log('Updating player:', req.params.id, req.body); // Debug log
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
    req.params.id
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating player:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Player updated:', results); // Debug log
      res.json({ 
        success: true,
        message: 'Player updated successfully',
        playerId: req.params.id
      });
    }
  });
});

// Get player stats
// Get player stats
app.get('/api/player/:id', (req, res) => {
  console.log('Getting player:', req.params.id); // Debug log
  
  // Query the database to get the player data based on the ID
  db.query('SELECT * FROM players WHERE id = ?', [req.params.id], (fetchErr, playerDetails) => {
    if (fetchErr) {
      console.error('Error fetching player details:', fetchErr);
      return res.status(500).json({ 
        error: 'Database error',
        details: fetchErr.message 
      });
    }

    if (playerDetails.length === 0) {
      return res.status(404).json({ error: 'Player not found after creation' });
    }

    // Send back the player details
    res.status(200).json(playerDetails[0]);
  });
});


// Get all players
app.get('/api/players', (req, res) => {
  console.log('Getting all players'); // Debug log
  db.query('SELECT * FROM players', (err, results) => {
    if (err) {
      console.error('Error getting players:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Found players:', results.length); // Debug log
      res.json(results);
    }
  });
});

// Delete a player
app.delete('/api/player/:id', (req, res) => {
  console.log('Deleting player:', req.params.id); // Debug log
  db.query('DELETE FROM players WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.error('Error deleting player:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Player deleted:', results); // Debug log
      res.json({ 
        success: true,
        message: 'Player deleted successfully',
        playerId: req.params.id
      });
    }
  });
});
app.get('/api/leaderboard', (req, res) => {
  console.log('Getting leaderboard data'); // Debug log
  
  // Query to fetch players sorted by experience in descending order
  const query = `
    SELECT id, username, experience, level 
    FROM players 
    ORDER BY experience DESC 
    LIMIT 10
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error getting leaderboard data:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Found leaderboard entries:', results.length); // Debug log
      res.json(results);
    }
  });
});
// Serve login.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
