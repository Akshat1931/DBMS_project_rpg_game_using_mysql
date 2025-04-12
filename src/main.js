import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {third_person_camera} from './third-person-camera.js';
import {entity_manager} from './entity-manager.js';
import {player_entity} from './player-entity.js'
import {entity} from './entity.js';
import {gltf_component} from './gltf-component.js';
import {health_component} from './health-component.js';
import {player_input} from './player-input.js';
import {npc_entity} from './npc-entity.js';
import {math} from './math.js';
import {spatial_hash_grid} from './spatial-hash-grid.js';
import {ui_controller} from './ui-controller.js';
import {health_bar} from './health-bar.js';
import {level_up_component} from './level-up-component.js';
import {quest_component} from './quest-component.js';
import {spatial_grid_controller} from './spatial-grid-controller.js';
import {inventory_controller} from './inventory-controller.js';
import {equip_weapon_component} from './equip-weapon-component.js';
import {attack_controller} from './attacker-controller.js';


// Check for player authentication
const playerId = localStorage.getItem('playerId');
if (!playerId) {
  // Redirect to login if no player ID is found
  window.location.href = '/';
}


const _VS = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;


const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;


class HackNSlashDemo {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.gammaFactor = 2.2;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.domElement.id = 'threejs';

    document.getElementById('container').appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 25);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xFFFFFF);
    this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(-10, 500, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    this._sun = light;

    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000, 10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x1e601c,
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    this._entityManager = new entity_manager.EntityManager();
    this._grid = new spatial_hash_grid.SpatialHashGrid(
        [[-1000, -1000], [1000, 1000]], [100, 100]);

    this._LoadControllers();
    this._LoadPlayer();
    this._LoadFoliage();
    this._LoadClouds();
    this._LoadSky();

    this._previousRAF = null;
    this._RAF();
  }

  _LoadControllers() {
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this._entityManager.Add(ui, 'ui');
  }

  async _LoadPlayer() {
    try {
      // Retrieve the playerId from localStorage
      const storedPlayerId = localStorage.getItem('playerId');
      
      // Initialize player stats
      let playerStats = {
        health: 100,
        maxHealth: 100,
        strength: 50,
        wisdomness: 5,
        benchpress: 20,
        curl: 100,
        experience: 0,
        level: 1
      };
  
      if (storedPlayerId) {
        // If playerId exists in localStorage, fetch the player's data from the backend
        const response = await fetch(`http://localhost:3000/api/player/${storedPlayerId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch player data');
        }
  
        // Load the existing player data into playerStats
        const existingPlayer = await response.json();
        console.log('Existing player loaded with ID:', storedPlayerId);
    
        // Update playerStats with fetched data
        playerStats = { 
          ...playerStats, 
          ...existingPlayer,
          health: existingPlayer.health,
          maxHealth: existingPlayer.max_health || existingPlayer.maxHealth || 100
        };
        
        // Store the playerId
        this._params = { ...this._params, playerId: storedPlayerId };
      } else {
        // If playerId does not exist in localStorage, create a new player
        console.log("Creating a new player...");
        const response = await fetch('http://localhost:3000/api/player', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: `Player${Date.now()}`,  // Generate a unique username based on timestamp
            ...playerStats
          })
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create player');
        }
  
        // Store the new playerId in localStorage and update _params
        const newPlayer = await response.json();
        localStorage.setItem('playerId', newPlayer.id);
        console.log('New player created with ID:', newPlayer.id);
    
        // Set the new playerId in _params
        this._params = { ...this._params, playerId: newPlayer.id };
      }
  
      const params = {
        camera: this._camera,
        scene: this._scene,
      };
  
      const levelUpSpawner = new entity.Entity();
      levelUpSpawner.AddComponent(new level_up_component.LevelUpComponentSpawner({
          camera: this._camera,
          scene: this._scene,
      }));
      this._entityManager.Add(levelUpSpawner, 'level-up-spawner');
  
      // Create weapon entities
      const axe = new entity.Entity();
      axe.AddComponent(new inventory_controller.InventoryItem({
          type: 'weapon',
          damage: 3,
          renderParams: {
            name: 'Axe',
            scale: 0.25,
            icon: 'war-axe-64.png',
          },
      }));
      this._entityManager.Add(axe);
  
      const sword = new entity.Entity();
      sword.AddComponent(new inventory_controller.InventoryItem({
          type: 'weapon',
          damage: 3,
          renderParams: {
            name: 'Sword',
            scale: 0.25,
            icon: 'pointy-sword-64.png',
          },
      }));
      this._entityManager.Add(sword);
  
      // Add NPC
      const girl = new entity.Entity();
      girl.AddComponent(new gltf_component.AnimatedModelComponent({
          scene: this._scene,
          resourcePath: './resources/girl/',
          resourceName: 'peasant_girl.fbx',
          resourceAnimation: 'Standing Idle.fbx',
          scale: 0.035,
          receiveShadow: true,
          castShadow: true,
      }));
      girl.AddComponent(new spatial_grid_controller.SpatialGridController({
          grid: this._grid,
      }));
      girl.AddComponent(new player_input.PickableComponent());
      girl.AddComponent(new quest_component.QuestComponent());
      girl.SetPosition(new THREE.Vector3(30, 0, 0));
      this._entityManager.Add(girl);
  
      // Create the player entity with the loaded or newly created stats
      const player = new entity.Entity();
      player.AddComponent(new player_input.BasicCharacterControllerInput(params));
      player.AddComponent(new player_entity.BasicCharacterController(params));
      player.AddComponent(
        new equip_weapon_component.EquipWeapon({anchor: 'RightHandIndex1'}));
      player.AddComponent(new inventory_controller.InventoryController(params));
      
      // Add health component with the loaded or newly created stats
      const healthComponent = new health_component.HealthComponent({
          updateUI: true,
          ...playerStats,
          camera: this._camera,
          scene: this._scene,
      });
      
      player.AddComponent(healthComponent);
      
      player.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      player.AddComponent(new attack_controller.AttackController({timing: 0.7}));
      this._entityManager.Add(player, 'player');
  
      player.Broadcast({
          topic: 'inventory.add',
          value: axe.Name,
          added: false,
      });
  
      player.Broadcast({
          topic: 'inventory.add',
          value: sword.Name,
          added: false,
      });
  
      player.Broadcast({
          topic: 'inventory.equip',
          value: sword.Name,
          added: false,
      });
  
      const camera = new entity.Entity();
      camera.AddComponent(
          new third_person_camera.ThirdPersonCamera({
              camera: this._camera,
              target: this._entityManager.Get('player')}));
      this._entityManager.Add(camera, 'player-camera');
  
      // Load monsters
      for (let i = 0; i < 50; ++i) {
        const monsters = [
          {
            resourceName: 'Ghost.fbx',
            resourceTexture: 'Ghost_Texture.png',
          },
          {
            resourceName: 'Alien.fbx',
            resourceTexture: 'Alien_Texture.png',
          },
          {
            resourceName: 'Skull.fbx',
            resourceTexture: 'Skull_Texture.png',
          },
          {
            resourceName: 'GreenDemon.fbx',
            resourceTexture: 'GreenDemon_Texture.png',
          },
          {
            resourceName: 'Cyclops.fbx',
            resourceTexture: 'Cyclops_Texture.png',
          },
          {
            resourceName: 'Cactus.fbx',
            resourceTexture: 'Cactus_Texture.png',
          },
        ];
        const m = monsters[math.rand_int(0, monsters.length - 1)];
  
        const npc = new entity.Entity();
        npc.AddComponent(new npc_entity.NPCController({
            camera: this._camera,
            scene: this._scene,
            resourceName: m.resourceName,
            resourceTexture: m.resourceTexture,
        }));
        npc.AddComponent(
            new health_component.HealthComponent({
                health: 50,
                maxHealth: 50,
                strength: 2,
                wisdomness: 2,
                benchpress: 3,
                curl: 1,
                experience: 0,
                level: 1,
                camera: this._camera,
                scene: this._scene,
            }));
        npc.AddComponent(
            new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        npc.AddComponent(new health_bar.HealthBar({
            parent: this._scene,
            camera: this._camera,
        }));
        npc.AddComponent(new attack_controller.AttackController({timing: 0.35}));
        npc.SetPosition(new THREE.Vector3(
            (Math.random() * 2 - 1) * 500,
            0,
            (Math.random() * 2 - 1) * 500));
        this._entityManager.Add(npc);
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
    }
  }

  _LoadSky() {
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this._scene.add(hemiLight);

    const uniforms = {
      "topColor": { value: new THREE.Color(0x0077ff) },
      "bottomColor": { value: new THREE.Color(0xffffff) },
      "offset": { value: 33 },
      "exponent": { value: 0.6 }
    };
    uniforms["topColor"].value.copy(hemiLight.color);

    this._scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this._scene.add(sky);
  }

  _LoadClouds() {
    for (let i = 0; i < 20; ++i) {
      const index = math.rand_int(1, 3);
      const pos = new THREE.Vector3(
          (Math.random() * 2.0 - 1.0) * 500,
          100,
          (Math.random() * 2.0 - 1.0) * 500);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/nature2/GLTF/',
        resourceName: 'Cloud' + index + '.glb',
        position: pos,
        scale: Math.random() * 5 + 10,
        emissive: new THREE.Color(0x808080),
      }));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      e.SetActive(false);
    }
  }

  _LoadFoliage() {
    for (let i = 0; i < 100; ++i) {
      const names = [
          'CommonTree_Dead', 'CommonTree',
          'BirchTree', 'BirchTree_Dead',
          'Willow', 'Willow_Dead',
          'PineTree',
      ];
      const name = names[math.rand_int(0, names.length - 1)];
      const index = math.rand_int(1, 5);

      const pos = new THREE.Vector3(
          (Math.random() * 2.0 - 1.0) * 500,
          0,
          (Math.random() * 2.0 - 1.0) * 500);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/nature/FBX/',
        resourceName: name + '_' + index + '.fbx',
        scale: 0.25,
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        receiveShadow: true,
        castShadow: true,
      }));
      e.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      e.SetActive(false);
    }
  }

  async _SavePlayerData(playerId, health, strength) {
    try {
        const response = await fetch(`http://localhost:3000/api/player/${playerId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                playerId,
                health, 
                strength 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Player stats saved:', data);
        return data;
    } catch (error) {
        console.error('Error saving player stats:', error);
        throw error;
    }
}

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _UpdateSun() {
    const player = this._entityManager.Get('player');
  
    // Ensure player is loaded and has a position
    if (player && player._position) {
      const pos = player._position;
      this._sun.position.copy(pos);
      this._sun.position.add(new THREE.Vector3(-10, 500, -10));
      this._sun.target.position.copy(pos);
      this._sun.updateMatrixWorld();
      this._sun.target.updateMatrixWorld();
    } else {
      console.warn("Player or player position is undefined. Skipping sun update.");
    }
  }
  
  
  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this._UpdateSun();

    this._entityManager.Update(timeElapsedS);
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new HackNSlashDemo();
});