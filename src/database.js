const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@kshat2004',
  database: 'game_db'
});

// Test the connection
connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create tables if they don't exist
  const createTables = () => {
    // Check if players table exists first
    connection.query("SHOW TABLES LIKE 'players'", (err, results) => {
      if (err) {
        console.error('Error checking if players table exists:', err);
        return;
      }
      
      // Only create tables if they don't exist
      if (results.length === 0) {
        console.log('Tables do not exist. Creating tables...');
        createAllTables();
      } else {
        console.log('Tables already exist. Skipping table creation.');
      }
    });
  };

  // Create all tables function
  const createAllTables = () => {
    // Create players table first
    const createPlayersTable = `
      CREATE TABLE IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        level INT DEFAULT 1,
        health INT DEFAULT 100,
        max_health INT DEFAULT 100,
        experience INT DEFAULT 0,
        strength INT DEFAULT 50,
        wisdomness INT DEFAULT 5,
        benchpress INT DEFAULT 20,
        curl INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    connection.query(createPlayersTable, (err) => {
      if (err) {
        console.error('Error creating players table:', err);
        return;
      }
      console.log('Players table created or verified');

      // Create leaderboards table
      const createLeaderboardsTable = `
  CREATE TABLE IF NOT EXISTS leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    score INT DEFAULT 0,
    \`rank\` INT DEFAULT 0,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
  )
`;

      connection.query(createLeaderboardsTable, (err) => {
        if (err) {
          console.error('Error creating leaderboards table:', err);
          return;
        }
        console.log('Leaderboards table created or verified');

        // Create player_location table
        const createPlayerLocationTable = `
          CREATE TABLE IF NOT EXISTS player_location (
            id INT AUTO_INCREMENT PRIMARY KEY,
            player_id INT,
            x_coordinate FLOAT,
            y_coordinate FLOAT,
            z_coordinate FLOAT,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
          )
        `;

        connection.query(createPlayerLocationTable, (err) => {
          if (err) {
            console.error('Error creating player_location table:', err);
            return;
          }
          console.log('Player location table created or verified');

          // Create inventory table
          const createInventoryTable = `
            CREATE TABLE IF NOT EXISTS inventory (
              id INT AUTO_INCREMENT PRIMARY KEY,
              player_id INT,
              item_name VARCHAR(255),
              quantity INT DEFAULT 1,
              FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
            )
          `;

          connection.query(createInventoryTable, (err) => {
            if (err) {
              console.error('Error creating inventory table:', err);
              return;
            }
            console.log('Inventory table created or verified');

            // Create player monster kills table
            const createMonsterKillsTable = `
              CREATE TABLE IF NOT EXISTS player_monster_kills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                player_id INT,
                monster_type VARCHAR(255),
                kills INT DEFAULT 0,
                FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
              )
            `;

            connection.query(createMonsterKillsTable, (err) => {
              if (err) {
                console.error('Error creating player_monster_kills table:', err);
                return;
              }
              console.log('Player monster kills table created or verified');

              // Check if we need to insert test data
              connection.query("SELECT COUNT(*) as count FROM players", (err, results) => {
                if (err) {
                  console.error('Error checking for existing players:', err);
                  return;
                }
                
                // Only insert test data if no players exist
                if (results[0].count === 0) {
                  insertTestData();
                } else {
                  console.log('Players already exist. Skipping test data insertion.');
                }
              });
            });
          });
        });
      });
    });
  };

  // Function to insert test data
  const insertTestData = () => {
    console.log('Inserting test data...');
    
    // Insert initial test data for players
    const insertTestPlayer = `
      INSERT INTO players 
      (username, health, strength, wisdomness, benchpress, curl, experience, level) 
      VALUES 
      ('testplayer', 100, 50, 5, 20, 100, 0, 1)
    `;

    connection.query(insertTestPlayer, (err, results) => {
      if (err) {
        console.error('Error inserting test player data:', err);
        return;
      }
      
      const playerId = results.insertId;
      console.log('Test player data inserted successfully with ID:', playerId);

      // Insert leaderboard data
      const insertLeaderboardData = `
        INSERT INTO leaderboards 
        (player_id, score, \`rank\`) 
        VALUES 
        (${playerId}, 100, 1)
      `;

      connection.query(insertLeaderboardData, (err) => {
        if (err) {
          console.error('Error inserting leaderboard data:', err);
          return;
        }
        console.log('Leaderboard test data inserted successfully');

        // Insert test location data
        const insertLocationData = `
          INSERT INTO player_location 
          (player_id, x_coordinate, y_coordinate, z_coordinate) 
          VALUES 
          (${playerId}, 0.0, 0.0, 0.0)
        `;

        connection.query(insertLocationData, (err) => {
          if (err) {
            console.error('Error inserting location test data:', err);
            return;
          }
          console.log('Location test data inserted successfully');

          // Insert test inventory items
          const insertInventoryData = `
            INSERT INTO inventory 
            (player_id, item_name, quantity) 
            VALUES 
            (${playerId}, 'Sword', 1),
            (${playerId}, 'Health Potion', 3)
          `;

          connection.query(insertInventoryData, (err) => {
            if (err) {
              console.error('Error inserting inventory test data:', err);
              return;
            }
            console.log('Inventory test data inserted successfully');
          });
        });
      });
    });
  };

  // Start the initialization process
  createTables();
});

module.exports = connection;