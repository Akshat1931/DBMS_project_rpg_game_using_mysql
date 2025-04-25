import {entity} from "./entity.js";

export const health_component = (() => {

  class HealthComponent extends entity.Component {
    constructor(params) {
      super();
      this._health = this._validateHealth(params.health, 100);
      this._maxHealth = this._validateHealth(params.maxHealth, 100);
      this._params = this._validateParams(params);
    }

    InitComponent() {
      this._RegisterHandler('health.damage', (m) => this._OnDamage(m));
      this._RegisterHandler('health.add-experience', (m) => this._OnAddExperience(m));

      // Check if player health is stored in localStorage and if it's 0 or less, reset it to full health
      this._CheckAndResetHealth();
      this._UpdateUI();
    }

    // Validate health value
    _validateHealth(health, defaultValue) {
      if (typeof health !== 'number' || isNaN(health) || health < 0) {
        console.warn(`Invalid health value: ${health}, using default: ${defaultValue}`);
        return defaultValue;
      }
      return Math.floor(health); // Ensure health is an integer
    }

    // Validate parameters
    _validateParams(params) {
      const validatedParams = { ...params };
      
      // Validate numeric stats with default fallback values
      const statsToValidate = {
        strength: 50,
        wisdomness: 5,
        benchpress: 20,
        curl: 100,
        experience: 0,
        level: 1
      };
      
      for (const [key, defaultValue] of Object.entries(statsToValidate)) {
        if (typeof params[key] !== 'number' || isNaN(params[key]) || params[key] < 0) {
          console.warn(`Invalid ${key} value: ${params[key]}, using default: ${defaultValue}`);
          validatedParams[key] = defaultValue;
        } else {
          validatedParams[key] = Math.floor(params[key]); // Ensure stats are integers
        }
      }
      
      return validatedParams;
    }

    IsAlive() {
      return this._health > 0;
    }

    // Check and reset health if needed
    _CheckAndResetHealth() {
      // Only apply to player character (with updateUI flag)
      if (!this._params.updateUI) {
        return;
      }

      // Get stored player ID
      let storedPlayerId = localStorage.getItem('playerId');
      
      // If we find a stored player ID and the current health is 0 or less
      if (storedPlayerId && this._health <= 0) {
        console.log('Player was dead, resetting health to full');
        this._health = this._maxHealth;
        this._SavePlayerStats();
      }
    }

    async _SavePlayerStats() {
      try {
        // Check if playerId already exists in localStorage
        let storedPlayerId = localStorage.getItem('playerId');

        // If playerId is not in _params and not in localStorage, create a new player
        if (!this._params.playerId) {
          if (!storedPlayerId) {
            console.log('Creating new player...');
            // Creating a new player when no playerId is found
            const uniqueUsername = `Player${Date.now()}`;
            
            // Validate data before sending to server
            const playerData = {
              username: uniqueUsername,
              health: this._health,
              max_health: this._maxHealth,
              level: this._params.level || 1,
              experience: this._params.experience || 0,
              strength: this._params.strength || 50,
              wisdomness: this._params.wisdomness || 5,
              benchpress: this._params.benchpress || 20,
              curl: this._params.curl || 100
            };
            
            const response = await fetch('http://localhost:3000/api/player', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(playerData)
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || errorData.message || 'Failed to save player stats');
            }

            const data = await response.json();
            this._params.playerId = data.id;
            localStorage.setItem('playerId', data.id);  // Save the player ID to localStorage
            console.log('Player created with ID:', data.id);
          } else {
            // If playerId exists in localStorage, use it and set it in _params
            this._params.playerId = storedPlayerId;
            console.log('Player already exists with ID:', storedPlayerId);
          }
        } else {
          // If playerId exists in params, just update player stats
          const playerData = {
            health: this._health,
            max_health: this._maxHealth,
            level: this._params.level,
            experience: this._params.experience,
            strength: this._params.strength,
            wisdomness: this._params.wisdomness,
            benchpress: this._params.benchpress,
            curl: this._params.curl
          };
          
          const response = await fetch(`http://localhost:3000/api/player/${this._params.playerId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Failed to update player stats');
          }
        }
      } catch (error) {
        console.error('Error saving player stats:', error);
        // Show error message to user (if UI is available)
        this._ShowErrorMessage(`Failed to save game progress: ${error.message}`);
      }
    }

    // Show error message to user
    _ShowErrorMessage(message) {
      // Only show error if we have UI
      if (!this._params.updateUI) {
        return;
      }
      
      // Create or update error message element
      let errorElement = document.getElementById('game-error-message');
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'game-error-message';
        errorElement.style.position = 'fixed';
        errorElement.style.bottom = '20px';
        errorElement.style.right = '20px';
        errorElement.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        errorElement.style.color = 'white';
        errorElement.style.padding = '10px 15px';
        errorElement.style.borderRadius = '5px';
        errorElement.style.fontFamily = "'IM Fell French Canon', serif";
        errorElement.style.fontSize = '14px';
        errorElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        errorElement.style.zIndex = '1000';
        errorElement.style.maxWidth = '300px';
        document.body.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      
      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        if (errorElement && errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      }, 5000);
    }

    _UpdateUI() {
      if (!this._params.updateUI) {
        return;
      }

      const bar = document.getElementById('health-bar');

      if (!bar) {
        console.error('Health bar element not found');
        return;
      }

      // Ensure health is never displayed as less than 0
      const displayHealth = Math.max(0, this._health);
      
      // Always show the health bar, even if health is 0
      const healthAsPercentage = displayHealth / this._maxHealth;
      bar.style.width = Math.floor(200 * healthAsPercentage) + 'px';
      bar.style.display = 'block';
      
      // Change health bar color based on health percentage
      if (healthAsPercentage < 0.2) {
        bar.style.background = '#dc3545'; // Red for critical health
      } else if (healthAsPercentage < 0.5) {
        bar.style.background = '#ffc107'; // Yellow for medium health
      } else {
        bar.style.background = 'greenyellow'; // Default green for good health
      }

      // Make sure all stats UI elements exist before updating them
      const strengthElement = document.getElementById('stats-strength');
      const wisdomnessElement = document.getElementById('stats-wisdomness');
      const benchpressElement = document.getElementById('stats-benchpress');
      const curlElement = document.getElementById('stats-curl');
      const experienceElement = document.getElementById('stats-experience');

      // Validate stats before displaying
      const validatedStats = {
        strength: this._validateStat(this._params.strength, 0, 100, 50),
        wisdomness: this._validateStat(this._params.wisdomness, 0, 100, 5),
        benchpress: this._validateStat(this._params.benchpress, 0, 100, 20),
        curl: this._validateStat(this._params.curl, 0, 100, 100),
        experience: this._validateStat(this._params.experience, 0, 1000000, 0)
      };

      if (strengthElement) strengthElement.innerText = validatedStats.strength;
      if (wisdomnessElement) wisdomnessElement.innerText = validatedStats.wisdomness;
      if (benchpressElement) benchpressElement.innerText = validatedStats.benchpress;
      if (curlElement) curlElement.innerText = validatedStats.curl;
      if (experienceElement) experienceElement.innerText = validatedStats.experience;
      
      // Add health percentage display
      this._UpdateHealthPercentage();
    }
    
    // Helper method to validate stat values
    _validateStat(value, min, max, defaultValue) {
      if (typeof value !== 'number' || isNaN(value) || value < min || value > max) {
        console.warn(`Invalid stat value: ${value}, using default: ${defaultValue}`);
        return defaultValue;
      }
      return Math.floor(value); // Ensure stats are integers
    }
    
    // Update health percentage display
    _UpdateHealthPercentage() {
      // Find or create health percentage display
      let healthPercentElement = document.getElementById('health-percentage');
      
      if (!healthPercentElement) {
        healthPercentElement = document.createElement('div');
        healthPercentElement.id = 'health-percentage';
        healthPercentElement.style.position = 'absolute';
        healthPercentElement.style.top = '215px';
        healthPercentElement.style.width = '200px';
        healthPercentElement.style.textAlign = 'center';
        healthPercentElement.style.fontFamily = "'IM Fell French Canon', serif";
        healthPercentElement.style.color = 'white';
        healthPercentElement.style.fontSize = '14px';
        healthPercentElement.style.textShadow = '1px 1px 2px black';
        
        // Find the health bar container
        const healthBar = document.querySelector('.health-bar');
        if (healthBar && healthBar.parentNode) {
          healthBar.parentNode.appendChild(healthPercentElement);
        }
      }
      
      // Update the health percentage text
      if (healthPercentElement) {
        const percentage = Math.floor((this._health / this._maxHealth) * 100);
        healthPercentElement.textContent = `${this._health}/${this._maxHealth} (${percentage}%)`;
      }
    }

    _ComputeLevelXPRequirement() {
      const level = this._params.level;
      // Using exponential level scaling formula
      const xpRequired = Math.round(2 ** (level - 1) * 100);
      return xpRequired;
    }

    _OnAddExperience(msg) {
      // Validate experience value
      if (typeof msg.value !== 'number' || isNaN(msg.value) || msg.value < 0) {
        console.warn(`Invalid experience gain: ${msg.value}, ignoring`);
        return;
      }
      
      const experienceGain = Math.floor(msg.value); // Ensure experience is an integer
      this._params.experience += experienceGain;
      
      const requiredExperience = this._ComputeLevelXPRequirement();
      const MAX_LEVEL = 100; // Prevent over-leveling
      this._UpdateUI();
      
      // Show experience gained notification
      this._ShowExperienceGainedMessage(experienceGain);
      
      // Save stats after gaining experience
      this._SavePlayerStats();
    
      if (this._params.experience < requiredExperience || this._params.level >= MAX_LEVEL) {
        return;
      }
      
      // Level up
      this._LevelUp();
    }
    
    // Level up logic extracted to separate method
    _LevelUp() {
      this._params.level += 1;
      
      // Determine stat increases based on level
      const statIncreases = this._GetLevelUpStatIncreases();
      
      this._params.strength += statIncreases.strength;
      this._params.wisdomness += statIncreases.wisdomness;
      this._params.benchpress += statIncreases.benchpress;
      this._params.curl += statIncreases.curl;
      
      // Increase max health on level up
      this._maxHealth += statIncreases.maxHealth;
      // Restore health to full on level up
      this._health = this._maxHealth;
    
      const spawner = this.FindEntity(
          'level-up-spawner').GetComponent('LevelUpComponentSpawner');
      spawner.Spawn(this._parent._position);
    
      this.Broadcast({
          topic: 'health.levelGained',
          value: this._params.level,
      });
      
      // Show level up notification
      this._ShowLevelUpMessage(this._params.level, statIncreases);
    
      this._UpdateUI();
      this._SavePlayerStats();
    }
    
    // Calculate stat increases for level up
    _GetLevelUpStatIncreases() {
      // Base increases for all levels
      const increases = {
        strength: 1,
        wisdomness: 1,
        benchpress: 1,
        curl: 2,
        maxHealth: 10
      };
      
      // Every 5 levels provide bonus increases
      if (this._params.level % 5 === 0) {
        increases.strength += 1;
        increases.wisdomness += 1;
        increases.benchpress += 1;
        increases.curl += 1;
        increases.maxHealth += 10;
      }
      
      // Every 10 levels provide major bonus increases
      if (this._params.level % 10 === 0) {
        increases.strength += 2;
        increases.wisdomness += 2;
        increases.benchpress += 2;
        increases.curl += 3;
        increases.maxHealth += 20;
      }
      
      return increases;
    }
    
    // Show experience gained notification
    _ShowExperienceGainedMessage(expGained) {
      if (!this._params.updateUI) {
        return;
      }
      
      // Create or update exp notification element
      let expElement = document.getElementById('exp-notification');
      
      if (!expElement) {
        expElement = document.createElement('div');
        expElement.id = 'exp-notification';
        expElement.style.position = 'fixed';
        expElement.style.bottom = '80px';
        expElement.style.right = '20px';
        expElement.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
        expElement.style.color = 'white';
        expElement.style.padding = '10px 15px';
        expElement.style.borderRadius = '5px';
        expElement.style.fontFamily = "'IM Fell French Canon', serif";
        expElement.style.fontSize = '14px';
        expElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        expElement.style.zIndex = '1000';
        document.body.appendChild(expElement);
      }
      
      expElement.textContent = `+${expGained} XP`;
      expElement.style.display = 'block';
      
      // Animate the notification
      expElement.style.animation = 'none';
      setTimeout(() => {
        expElement.style.animation = 'fadeOutUp 2s forwards';
      }, 10);
      
      // Hide after animation
      setTimeout(() => {
        if (expElement) {
          expElement.style.display = 'none';
        }
      }, 2000);
      
      // Add animation keyframes if they don't exist
      if (!document.getElementById('notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.innerHTML = `
          @keyframes fadeOutUp {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Show level up notification
    _ShowLevelUpMessage(newLevel, statIncreases) {
      if (!this._params.updateUI) {
        return;
      }
      
      // Create level up notification
      let levelUpElement = document.getElementById('level-up-notification');
      
      if (!levelUpElement) {
        levelUpElement = document.createElement('div');
        levelUpElement.id = 'level-up-notification';
        levelUpElement.style.position = 'fixed';
        levelUpElement.style.top = '50%';
        levelUpElement.style.left = '50%';
        levelUpElement.style.transform = 'translate(-50%, -50%)';
        levelUpElement.style.backgroundColor = 'rgba(100, 58, 113, 0.9)';
        levelUpElement.style.color = 'white';
        levelUpElement.style.padding = '20px';
        levelUpElement.style.borderRadius = '10px';
        levelUpElement.style.fontFamily = "'IM Fell French Canon', serif";
        levelUpElement.style.textAlign = 'center';
        levelUpElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
        levelUpElement.style.zIndex = '1001';
        levelUpElement.style.minWidth = '300px';
        document.body.appendChild(levelUpElement);
      }
      
      // Create level up content
      levelUpElement.innerHTML = `
        <h2 style="color: #ffd700; margin: 0 0 15px; font-size: 24px; text-shadow: 1px 1px 3px black;">Level Up!</h2>
        <p style="margin: 0 0 10px; font-size: 18px;">You are now level ${newLevel}!</p>
        <div style="text-align: left; margin: 10px 0;">
          <p style="margin: 5px 0; font-size: 14px;">Strength: +${statIncreases.strength}</p>
          <p style="margin: 5px 0; font-size: 14px;">Wisdomness: +${statIncreases.wisdomness}</p>
          <p style="margin: 5px 0; font-size: 14px;">Benchpress: +${statIncreases.benchpress}</p>
          <p style="margin: 5px 0; font-size: 14px;">Curl: +${statIncreases.curl}</p>
          <p style="margin: 5px 0; font-size: 14px;">Max Health: +${statIncreases.maxHealth}</p>
        </div>
        <button id="level-up-close" style="margin-top: 10px; padding: 5px 15px; background: #e5ac5c; border: none; border-radius: 5px; color: white; cursor: pointer; font-family: 'IM Fell French Canon', serif;">Continue</button>
      `;
      
      levelUpElement.style.display = 'block';
      
      // Add close button functionality
      document.getElementById('level-up-close').onclick = () => {
        levelUpElement.style.display = 'none';
      };
      
      // Play level up sound if available
      this._PlayLevelUpSound();
    }
    
    // Play level up sound
    _PlayLevelUpSound() {
      try {
        const sound = new Audio('./resources/sounds/level-up.mp3');
        sound.volume = 0.5;
        sound.play();
      } catch (e) {
        // Sound playback failed - ignore
        console.log('Level up sound not available');
      }
    }

    _OnDamage(msg) {
      // Validate damage value
      if (typeof msg.value !== 'number' || isNaN(msg.value) || msg.value < 0) {
        console.warn(`Invalid damage value: ${msg.value}, ignoring`);
        return;
      }
      
      const damage = Math.floor(msg.value); // Ensure damage is an integer
      this._health = Math.max(0.0, this._health - damage);
      
      // Show damage taken indicator
      this._ShowDamageTaken(damage);
      
      this._UpdateUI();
      this._SavePlayerStats();
      
      if (this._health == 0) {
        this._OnDeath(msg.attacker);
      }

      this.Broadcast({
        topic: 'health.update',
        health: this._health,
        maxHealth: this._maxHealth,
      });
    }
    
    // Show damage taken indicator
    _ShowDamageTaken(damage) {
      if (!this._params.updateUI) {
        return;
      }
      
      // Create damage indicator element
      const damageElement = document.createElement('div');
      damageElement.style.position = 'absolute';
      damageElement.style.color = '#ff4136';
      damageElement.style.fontFamily = "'IM Fell French Canon', serif";
      damageElement.style.fontSize = '24px';
      damageElement.style.fontWeight = 'bold';
      damageElement.style.textShadow = '1px 1px 2px black';
      damageElement.style.zIndex = '1000';
      damageElement.textContent = `-${damage}`;
      
      // Position indicator above health bar
      const healthBar = document.querySelector('.health-bar');
      if (healthBar && healthBar.parentNode) {
        const rect = healthBar.getBoundingClientRect();
        damageElement.style.left = `${rect.left + Math.random() * rect.width}px`;
        damageElement.style.top = `${rect.top - 30}px`;
        document.body.appendChild(damageElement);
        
        // Animate indicator
        damageElement.style.animation = 'damageFloat 1.5s forwards';
        
        // Add animation keyframes if they don't exist
        if (!document.getElementById('damage-animations')) {
          const style = document.createElement('style');
          style.id = 'damage-animations';
          style.innerHTML = `
            @keyframes damageFloat {
              0% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-30px); }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Remove element after animation
        setTimeout(() => {
          if (damageElement.parentNode) {
            damageElement.parentNode.removeChild(damageElement);
          }
        }, 1500);
      }
    }

    _OnDeath(attacker) {
      // Broadcast stop movement event
      this.Broadcast({
        topic: 'movement.stop',
      });
    
      // Show death UI effects
      this._ShowDeathScreen();
      
      // Update health bar to 0
      const bar = document.getElementById('health-bar');
      if (bar) {
        bar.style.width = '0px';
        bar.style.display = 'block';
      }
      
      this.Broadcast({
        topic: 'health.remove-bar',
      });
    
      if (attacker) {
        attacker.Broadcast({
          topic: 'health.add-experience',
          value: this._params.level * 100
        });
        this.Broadcast({
          topic: 'spawn.items',
          position: this._parent._position,
          items: this._params.dropItems || []
        });
      }
      
      // Add health reset upon death
      setTimeout(() => {
        if (this._params.updateUI) {
          // Only auto-revive player character
          this._health = this._maxHealth;
          this._SavePlayerStats();
          this._UpdateUI();
          
          // Hide death screen
          this._HideDeathScreen();
          
          console.log("Player revived with full health");
        }
      }, 3000); // Wait 3 seconds before reviving
      
      this.Broadcast({
        topic: 'health.death',
      });
    }
    
    // Show death screen overlay
    _ShowDeathScreen() {
      if (!this._params.updateUI) {
        return;
      }
      
      // Create death screen overlay
      let deathScreen = document.getElementById('death-screen');
      
      if (!deathScreen) {
        deathScreen = document.createElement('div');
        deathScreen.id = 'death-screen';
        deathScreen.style.position = 'fixed';
        deathScreen.style.top = '0';
        deathScreen.style.left = '0';
        deathScreen.style.width = '100%';
        deathScreen.style.height = '100%';
        deathScreen.style.backgroundColor = 'rgba(136, 8, 8, 0.5)';
        deathScreen.style.display = 'flex';
        deathScreen.style.flexDirection = 'column';
        deathScreen.style.justifyContent = 'center';
        deathScreen.style.alignItems = 'center';
        deathScreen.style.zIndex = '999';
        deathScreen.style.animation = 'deathFadeIn 0.5s forwards';
        
        // Add death message
        const deathMessage = document.createElement('div');
        deathMessage.textContent = 'You Died';
        deathMessage.style.color = '#ff0000';
        deathMessage.style.fontFamily = "'IM Fell French Canon', serif";
        deathMessage.style.fontSize = '64px';
        deathMessage.style.textShadow = '2px 2px 4px black';
        deathMessage.style.marginBottom = '20px';
        
        // Add respawn message
        const respawnMessage = document.createElement('div');
        respawnMessage.textContent = 'Respawning in 3 seconds...';
        respawnMessage.style.color = 'white';
        respawnMessage.style.fontFamily = "'IM Fell French Canon', serif";
        respawnMessage.style.fontSize = '24px';
        respawnMessage.style.textShadow = '1px 1px 2px black';
        
        deathScreen.appendChild(deathMessage);
        deathScreen.appendChild(respawnMessage);
        document.body.appendChild(deathScreen);
        
        // Add animation keyframes
        if (!document.getElementById('death-animations')) {
          const style = document.createElement('style');
          style.id = 'death-animations';
          style.innerHTML = `
            @keyframes deathFadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes deathFadeOut {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Play death sound
        this._PlayDeathSound();
      } else {
        deathScreen.style.display = 'flex';
        deathScreen.style.animation = 'deathFadeIn 0.5s forwards';
      }
    }
    
    // Hide death screen
    _HideDeathScreen() {
      const deathScreen = document.getElementById('death-screen');
      if (deathScreen) {
        deathScreen.style.animation = 'deathFadeOut 0.5s forwards';
        setTimeout(() => {
          deathScreen.style.display = 'none';
        }, 500);
      }
    }
    
    // Play death sound
    _PlayDeathSound() {
      try {
        const sound = new Audio('./resources/sounds/death.mp3');
        sound.volume = 0.5;
        sound.play();
      } catch (e) {
        // Sound playback failed - ignore
        console.log('Death sound not available');
      }
    }
  };

  return {
    HealthComponent: HealthComponent,
  };

})();