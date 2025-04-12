import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {entity} from './entity.js';

import {math} from './math.js';


export const attack_controller = (() => {

  class AttackController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._timeElapsed = 0.0;
      this._action = null;
    }

    InitComponent() {
      this._RegisterHandler('player.action', (m) => { this._OnAnimAction(m); });
    }

    _OnAnimAction(m) {
      if (m.action != this._action) {
        this._action = m.action;
        this._timeElapsed = 0.0;
      }

      const oldTiming = this._timeElapsed;
      this._timeElapsed = m.time;

      if (oldTiming < this._params.timing && this._timeElapsed >= this._params.timing) {
        const inventory = this.GetComponent('InventoryController');
        const equip = this.GetComponent('EquipWeapon');
        let item = null;
        if (equip) {
          item = inventory.GetItemByName(equip.Name);
          if (item) {
            item = item.GetComponent('InventoryItem');
          }
        }

        const grid = this.GetComponent('SpatialGridController');
        const nearby = grid.FindNearbyEntities(2);

        const _Filter = (c) => {
          if (c.entity == this._parent) {
            return false;
          }
  
          const h = c.entity.GetComponent('HealthComponent');
          if (!h) {
            return false;
          }

          return h.IsAlive();
        };

        const attackable = nearby.filter(_Filter);
        for (let a of attackable) {
          const target = a.entity;

          const dirToTarget = target._position.clone().sub(this._parent._position);
          dirToTarget.normalize();

          const forward = new THREE.Vector3(0, 0, 1);
          forward.applyQuaternion(this._parent._rotation);
          forward.normalize();
    
          let damage = this.GetComponent('HealthComponent')._params.strength;
          if (item) {
            damage *= item.Params.damage;
            damage = Math.round(damage);
          }

          const dot = forward.dot(dirToTarget);
          if (math.in_range(dot, 0.9, 1.1)) {
            target.Broadcast({
              topic: 'health.damage',
              value: damage,
              attacker: this._parent,
            });
          }
        }
      }
    }
  };

  return {
      AttackController: AttackController,
  };
})();
/*
Where to create the files:

Your project structure should look like this:

your-game-folder/
  ├── src/                      
  │   ├── attacker-controller.js
  │   ├── player-entity.js 
  │   ├── database.js          <-- Create this new file here
  │   └── server.js            <-- Create this new file here
  ├── resources/
  ├── index.html
  ├── base.css
  └── package.json

Steps to continue:

1. Create database.js in src folder:
   Open terminal/command prompt and navigate to your src folder:
   ```bash
   cd src
   touch database.js   # On Mac/Linux
   # OR
   type nul > database.js  # On Windows
   ```

2. Create server.js in src folder:
   ```bash
   touch server.js    # On Mac/Linux
   # OR 
   type nul > server.js   # On Windows
   ```

3. Copy the code provided earlier into these files:
   - Copy the database connection code into database.js
   - Copy the Express server code into server.js

4. Update your package.json:
   Make sure it's in your root folder and includes:
   ```json
   {
     "dependencies": {
       "express": "^4.17.1",
       "mysql2": "^2.3.0"
     },
     "scripts": {
       "start": "node src/server.js"
     }
   }
   ```

5. Start the server:
   From your root folder:
   ```bash
   npm start
   ```

Your backend files should be in the src folder alongside your existing game files for better organization and easier imports. The database and server will handle the API endpoints while your game continues to run from index.html.
*/




