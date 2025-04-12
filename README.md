# Fantasy Protocol

A fantasy RPG adventure game with character progression, combat, and exploration mechanics.

## Getting Started

Follow these steps to set up and run the Fantasy Protocol game on your local machine.

### Prerequisites

- Node.js (v14 or later)
- MySQL database

### Installation

1. *Clone the repository*
   
   git clone https://github.com/yourusername/fantasy-protocol.git
   cd fantasy-protocol
   

2. *Install dependencies*
   Navigate to the src folder and install the required Node.js packages:
   
   cd src
   npm install
   

3. *Configure the database*
   Open src/database.js and replace the database connection details with your own:
   javascript
   const db = mysql.createConnection({
     host: 'localhost',
     user: 'your_username',
     password: 'your_password', // Replace with your MySQL password
     database: 'fantasy_protocol' // Create this database in MySQL if it doesn't exist
   });
   

4. *Create the database*
   In MySQL:
   sql
   CREATE DATABASE fantasy_protocol;
   

### Running the Game

1. *Start the server*
   From the src directory:
   
   npm start
   

2. *Open the game*
   Once the server is running, open your web browser and navigate to:
   
   http://localhost:3000/login.html
   
   
   This will take you to the login page where you can create a new account or log in with an existing one.

## Gameplay

### Getting Started
1. Create a new character from the login screen
2. Once logged in, you'll be taken to the main game world
3. Use WASD or arrow keys to move your character around
4. Click on enemies to attack them
5. Gain experience and level up to improve your character stats

### Character Stats
- *Health*: Your character's life points
- *Strength*: Increases damage dealt to enemies
- *Wisdomness*: Enhances magical abilities
- *Benchpress*: Improves physical defense
- *Curl*: Enhances critical hit chance
- *Experience*: Accumulate to level up your character

### Controls
- *W/Up Arrow*: Move Up
- *A/Left Arrow*: Move Left
- *S/Down Arrow*: Move Down
- *D/Right Arrow*: Move Right
- *Mouse Click*: Attack/Interact

## Features

- Character creation and persistence
- Real-time combat system
- Experience and leveling
- Various enemies with different difficulties
- Leaderboard of top players
- Automatic character revival after death

## Troubleshooting

### Server Won't Start
- Ensure MySQL is running
- Check your database credentials in database.js
- Make sure required ports (3000) are not in use

### Can't Log In
- Verify the server is running
- Check console for any error messages
- Try creating a new account

### Character Stuck After Death
- The game should automatically revive your character after a few seconds
- If stuck, try refreshing the page

## Development

This project uses:
- Node.js and Express for the backend
- JavaScript and React for frontend components
- MySQL for data persistence

### Project Structure
- src/ - Backend server code and database connection
- index.html - Main game interface
- login.html - Login/registration page
- base.css - Core styling
- Assets are stored in various directories for models, textures, etc.

---

Enjoy your adventure in the Fantasy Protocol world!
