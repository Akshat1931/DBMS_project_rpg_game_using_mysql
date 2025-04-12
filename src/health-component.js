import {entity} from "./entity.js";

export const health_component = (() => {

  class HealthComponent extends entity.Component {
    constructor(params) {
      super();
      this._health = params.health;
      this._maxHealth = params.maxHealth;
      this._params = params;
    }

    InitComponent() {
      this._RegisterHandler('health.damage', (m) => this._OnDamage(m));
      this._RegisterHandler('health.add-experience', (m) => this._OnAddExperience(m));

      // Check if player health is stored in localStorage and if it's 0 or less, reset it to full health
      this._CheckAndResetHealth();
      this._UpdateUI();
    }

    IsAlive() {
      return this._health > 0;
    }

    // New method to check and reset health if needed
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
            const response = await fetch('http://localhost:3000/api/player', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: uniqueUsername,
                health: this._health,
                max_health: this._maxHealth,
                level: this._params.level || 1,
                experience: this._params.experience || 0,
                strength: this._params.strength || 50,
                wisdomness: this._params.wisdomness || 5,
                benchpress: this._params.benchpress || 20,
                curl: this._params.curl || 100
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(errorText || 'Failed to save player stats');
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
          const response = await fetch(`http://localhost:3000/api/player/${this._params.playerId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              health: this._health,
              max_health: this._maxHealth,
              level: this._params.level,
              experience: this._params.experience,
              strength: this._params.strength,
              wisdomness: this._params.wisdomness,
              benchpress: this._params.benchpress,
              curl: this._params.curl
            })
          });

          if (!response.ok) {
            throw new Error('Failed to update player stats');
          }
        }
      } catch (error) {
        console.error('Error saving player stats:', error);
      }
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

      // Make sure all stats UI elements exist before updating them
      const strengthElement = document.getElementById('stats-strength');
      const wisdomnessElement = document.getElementById('stats-wisdomness');
      const benchpressElement = document.getElementById('stats-benchpress');
      const curlElement = document.getElementById('stats-curl');
      const experienceElement = document.getElementById('stats-experience');

      if (strengthElement) strengthElement.innerText = this._params.strength;
      if (wisdomnessElement) wisdomnessElement.innerText = this._params.wisdomness;
      if (benchpressElement) benchpressElement.innerText = this._params.benchpress;
      if (curlElement) curlElement.innerText = this._params.curl;
      if (experienceElement) experienceElement.innerText = this._params.experience;
    }

    _ComputeLevelXPRequirement() {
      const level = this._params.level;
      // Blah just something easy
      const xpRequired = Math.round(2 ** (level - 1) * 100);
      return xpRequired;
    }

    _OnAddExperience(msg) {
      this._params.experience += msg.value;
      const requiredExperience = this._ComputeLevelXPRequirement();
      const MAX_LEVEL = 10; // Prevent over-leveling
      this._UpdateUI();
      this._SavePlayerStats();
    
      if (this._params.experience < requiredExperience || this._params.level >= MAX_LEVEL) {
        return;
      }
    
      this._params.level += 1;
      this._params.strength += 1;
      this._params.wisdomness += 1;
      this._params.benchpress += 1;
      this._params.curl += 2;
    
      const spawner = this.FindEntity(
          'level-up-spawner').GetComponent('LevelUpComponentSpawner');
      spawner.Spawn(this._parent._position);
    
      this.Broadcast({
          topic: 'health.levelGained',
          value: this._params.level,
      });
    
      this._UpdateUI();
    }

    _OnDeath(attacker) {
      // Broadcast stop movement event
      this.Broadcast({
        topic: 'movement.stop',
      });
    
      // Modified death logic - don't hide the health bar anymore
      const bar = document.getElementById('health-bar');
      if (bar) {
        // Still set width to 0 to show empty health bar
        bar.style.width = '0px';
        // But keep it visible
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
          console.log("Player revived with full health");
        }
      }, 3000); // Wait 3 seconds before reviving
      
      this.Broadcast({
        topic: 'health.death',
      });
    }

    _OnDamage(msg) {
      this._health = Math.max(0.0, this._health - msg.value);
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

      this._UpdateUI();
    }
  };

  return {
    HealthComponent: HealthComponent,
  };

})();