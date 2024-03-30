import * as THREE from "three";
import Asset from "@/game/asset";
import ASSET_PATH from "@/assets/path";
import Physics from "@/game/physics";
import { EPSILON } from "@/game/physics_utils";
import PhysicsEntity from "@/game/physics_entity";
import GameData  from "@/data/game_data";
import Player, { PLAYER_POSITION } from "@/data/player";
import ParticleGenerator from "@/game/particle_generator";
import { WALL_TYPES, DIRECTION, GameMap } from "@/data/game_map";
import GUI from "node_modules/lil-gui/dist/lil-gui.esm.min.js";
import { resizeTexture } from "@/utils/three_util";
import Timer from "./timer";

const FRAME_TIME_THRESHOLD = 0.01;
const MAX_PEDDLE_SPEED = 50;
const PEDDLE_ACCEL = 10;
const PEDDLE_DECEL_RATIO = 0.5;
const SOUND_EFFECT_THRESHOLD = 0.3;
const SAFE_WALL_STUCK_THRESHOLD = 4;

export default class GameScene extends THREE.Group {

  /** @type {Physics} */
  #physics;
  /** @type {GameData} */
  #gameData;
  #gameMap;
  #timer;

  #hitSound = {
    sound: Asset.shared.get("AUDIO", ASSET_PATH.hitSound),
    lastPlayed: 0,
    volume: 1
  };

  /** @type {{
   *    mesh: THREE.Mesh,
   *    physicsId: number
   *  }[]}
   */
  #objects = [];

  /** @type {"TOP" | "BOTTOM" | null} */
  #lostSide = null;

  /**
   * @type {{
   *  mesh: THREE.Mesh | null,
   *  physicsId: number | null,
   * }} 
   */
  #ball = { mesh: null, physicsId: null };
  get ball() {
    return {...this.#ball};
  }

  ballColor = 0xff0000;
  #ballRadiusInGame = 3;
  #ballSpeed = 40;
  #ballStartDirection = {
    x: DIRECTION.left,
    y: DIRECTION.bottom
  };
  #stuckHandler;

  /** @type {{
   *  [key in string]: {
   *    colorTexture: THREE.Texture,
   *    normalTexture: THREE.Texture,
   *    aoRoughnessMetallnessTexture: THREE.Texture
   *  }
   * }} */
  #loadedTextures = { };

  /**
   * @type {{
   *  [key: number]: THREE.Mesh // physicsId: Mesh
   * }} 
   */
  #walls = {}; 
  #wallTextureRepeat = 0.05;
  
  /** @type {number} */
  wallColor = 0x00ff00;

  #safeWallHitCount = 0;

  /** @type {{
   *    mesh: THREE.Mesh,
   *    physicsId: number
   *  }[]}
   */
  #peddles = [];

  /** @type {{
   *    pressed: {
   *      player: number,
   *      x: number,
   *      y: number,
   *      key: string | null,
   *    }
   *   }[]}
   */
  #peddleControls = [
    {
      pressed: {
        player: 0,
        x: 0,
        y: 0,
        key: null
      }
    }, 
    {
      pressed: {
        player: 1,
        x: 0,
        y: 0,
        key: null
      }
    }
  ];

  isBallMoving = false;
  /**
   * Constants
   */
  peddleColors = {
    "player1": 0x00ffff,
    "player2": 0xffff00,
  };

  peddleSizeInGame = {
    width: 0.15,
    height: 0.015
  };

  #gameSize = {
    width: 100,
    height: 100,
    depth: 1
  };

  #depth = {
    wall: 5,
    peddle: 3
  };

  /** @type {{
   *  desc: string,
   *  id: number
   * }[]} */
  #eventsIds = [];

  /** @type {ParticleGenerator} */
  #gameParticle;

  /** @param {{ 
   *  timer: Timer,
   *  stuckHandler: ((isStuck:boolean) => void) | null,
   *  data: GameData,
   *  map: GameMap
   *  }} params
  * */
  constructor({timer, stuckHandler, data, map}) {
    super();
    this.#timer = timer;
    this.#gameData = data;
    this.#gameMap = map;
    this.#stuckHandler = stuckHandler;
  }

  init() {
    this.#physics = new Physics();
    this
      .#setBackground()
      .#addObjects()
      .#addControls()
      .#addEvents()
    this.#gameParticle.isPlaying = true;
  }

  /** @param {number} frameTime */
  update(frameTime) {
    let frameSlice = Math.min(frameTime, FRAME_TIME_THRESHOLD);
    this.#updateObjects({frameTime, frameSlice})
    this.#gameParticle.animate();
  }

  addBall() {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.#ballRadiusInGame, 16, 16),
      new THREE.MeshStandardMaterial({
        color: this.ballColor,
        metalness: 0.3,
        roughness: 0.4
      })
    );
    mesh.position.set(0, 0, 0);
    const ballWidth =  this.#ballRadiusInGame;
    const ballHeight = this.#ballRadiusInGame;

    const ballPhysics = PhysicsEntity.createCircle({
      type: "MOVABLE",
      collideType: "DYNAMIC",
      radius: Math.max(ballWidth, ballHeight),
      center: { x: 0, y:0 }
    });
    this.#ballStartDirection.x = (Math.random() > 0.5) ? DIRECTION.left: DIRECTION.right;
    this.#ballStartDirection.y = (this.#lostSide == DIRECTION.top) ? DIRECTION.bottom: DIRECTION.top;
    let velX = (this.#ballStartDirection.x == DIRECTION.right? 1 : -1) * this.#ballSpeed * (Math.random() + 0.5);
    let velY = (this.#ballStartDirection.y == DIRECTION.top? 1 : -1) * this.#ballSpeed;

    ballPhysics.velocity = {
      x: velX,
      y: velY,
    };

    const physicsId = this.#physics.addObject(ballPhysics)[0];

    this.#objects.push(
      {
        mesh,
        physicsId
      },
    );
    this.add(mesh);
    this.#ball = {
      mesh,
      physicsId,
    };
    return this;
  }

  removeBall() {
    const mesh = this.#ball.mesh;
    const id = this.#ball.physicsId
    this.#physics.removeCollisionCallback(id);
    this.#physics.removeObject(id);
    this.remove(mesh);
    this.#ball.mesh = null;
    this.#ball.physicsId = null;
    return this;
  }

  removeParticle() {
    this.#gameParticle.remove();
  }

  #addWalls() {
    const sizes = this.#gameMap.wallSizes;
    sizes.forEach(size => {
      const walls = this.#gameMap.getWallsBySize(size);
      const entities = this.#addWall(
        size,
        walls.map(wall => ({
          x: (wall.centerX * 0.01 - 0.5) * this.#gameSize.width,
          y: (wall.centerY * 0.01 - 0.5) * this.#gameSize.height,
          z: this.#depth.wall * 0.5,
        })
        )
      );
      for (let i = 0; i < walls.length; ++i) {
        const wall = walls[i];
        entities[i].data = {
          wallType: wall.type,
        };
        if (wall.type == WALL_TYPES.trap) {
          if (wall.centerX == 50)
            entities[i].data.direction = 
              wall.centerY > 50 ? DIRECTION.top: DIRECTION.bottom;
        }
      }
    })
    return this;
  }

  /** @param {{
   *   width: number,
   *   height: number
   * }} wallSize
   * @param {{
   *   x: number,
   *   y: number,
   *   z: number
   * }[]} wallPositions
   */
  #addWall(wallSize, wallPositions) {

    const geometry = new THREE.BoxGeometry(wallSize.width, wallSize.height, this.#depth.wall);
    const material = this.#createMaterialFromTexture(
      "brick", 
      (texture) => {
        resizeTexture({
          texture,
          x: wallSize.width * this.#wallTextureRepeat,
          y: wallSize.height * this.#wallTextureRepeat,
        })
      }
    ) 

    const meshes = wallPositions.map(pos =>  {
      const mesh = new THREE.Mesh(
        geometry, 
        material
      );
      mesh.position.set(pos.x, pos.y, pos.z);
      return mesh;
    });

    const physics = wallPositions.map(pos => {
      return PhysicsEntity.createRect({
        type: "IMMOVABLE",
        width: wallSize.width,
        height: wallSize.height,
        center: {
          x: pos.x, 
          y: pos.y
        }
      });
    });
    const physicsIds = this.#physics.addObject(...physics);
    for (let i = 0; i < physicsIds.length; ++i) {
      this.#objects.push(
        {
          mesh: meshes[i],
          physicsId: physicsIds[i]
        },
      );
      this.#walls[physicsIds[i]] = meshes[i];
    }
    this.add(...meshes);
    return physics;
  }
  /** @param {string} name
   *  @param {((loaded: THREE.Texture) => void)?} onload
   */
  #createMaterialFromTexture(name, onload = null) {

    const loadedTextures = this.#loadedTextures[name];
    if (loadedTextures &&
      loadedTextures.colorTexture && 
      loadedTextures.normalTexture &&
      loadedTextures. aoRoughnessMetallnessTexture) {

      const textures = {};
      Object.entries(loadedTextures)
        .forEach(([ key, text ]) => {
          textures[key] = text.clone();
        });
      return new THREE.MeshStandardMaterial({
        map: textures.colorTexture,
        normalMap: textures.normalTexture,
        aoMap: textures.aoRoughnessMetallnessTexture,
        roughnessMap: textures.aoRoughnessMetallnessTexture,
        metalnessMap: textures.aoRoughnessMetallnessTexture,
      });

    }
    //@ts-ignore
    this.#loadedTextures[name] = {};

    /** @type {THREE.Texture} */
    const colorTexture = Asset.shared.get(
      "TEXTURE",
       ASSET_PATH.getTexture.color(name),
    ).clone();

    /** @type {THREE.Texture} */
    const normalTexture = Asset.shared.get(
      "TEXTURE",
      ASSET_PATH.getTexture.normal(name)
    ).clone();


    /** @type {THREE.Texture} */
    const aoRoughnessMetallnessTexture = Asset.shared.get(
      "TEXTURE",
      ASSET_PATH.getTexture.arm(name)
    ).clone();

    if (onload) {
      onload(colorTexture);
      onload(normalTexture);
      onload(aoRoughnessMetallnessTexture);
    }

    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      aoMap: aoRoughnessMetallnessTexture,
      roughnessMap: aoRoughnessMetallnessTexture,
      metalnessMap: aoRoughnessMetallnessTexture,
    });

    return material;
  }

  #setBackground() {

    const size = {
      x: this.#gameSize.width * 0.8,
      y: this.#gameSize.height * 0.8,
      z: this.#gameSize.depth * 0.5
    };

    const container = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.z, size.z),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    );
    this.#gameParticle = new ParticleGenerator({
      count: 100,
      particleSize: 0.001,
      maxSize: {
        x: 70,
        y: 70,
        z: 20
      }
    });
    this.#gameParticle.setColor([
      "#008DDA",
      "#41C9E2",
      "#ACE2E1",
      "#F7EEDD",
    ])
    this.#gameParticle.animationConfig.speedCoefficient = 0.001;
    this.#gameParticle.animationConfig.speedVariantCoefficient = 0.001;
    this.#gameParticle.animationConfig.speedVariantConstant = 50;
    this.#gameParticle.createParticles();
    const particles = this.#gameParticle.getParticles();
    container.add(particles);
    container.scale.set(0.8, 0.8, 0.2);
    this.add(container);
    return this;
  }

  #addObjects() {
    this.#addWalls()
      .#addPeddles()
    return this;
  }

  #addPeddles() {
    const size = {
      width: this.#gameSize.width * this.peddleSizeInGame.width,
      height: this.#gameSize.height * this.peddleSizeInGame.height,
    };

    const geometry = new THREE.BoxGeometry(
      size.width,
      size.height,
      this.#depth.peddle
    );

    const materials = Object.entries(this.peddleColors).map(([_, color]) => {
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.5,
      })
    })

    const positions = [
      {
        x: 0,
        y: this.#gameSize.height * 0.4
      },
      {
        x: 0,
        y: this.#gameSize.height * - 0.4
      },
    ];
    const meshes = materials.map((material, index) => {
      const mesh = new THREE.Mesh(
        geometry,
        material
      );
      const pos = positions[index];
      mesh.position.set(pos.x, pos.y, this.#depth.peddle * 0.5);
      return mesh;
    });

    const physicsEntities = positions.map((pos, index) => {
      const entity = PhysicsEntity.createRect({
        type: "MOVABLE",
        width: size.width,
        height: size.height,
        center: {
          x: pos.x,
          y: pos.y
        }
      });
      entity.data = {
        isPeddle: true,
        player: PLAYER_POSITION[ index == 0 ? DIRECTION.top: DIRECTION.bottom]
      };
      return entity;
    });
    const physicsIds = this.#physics.addObject(...physicsEntities);
    for (let i = 0; i < physicsIds.length; ++i) {
      this.#objects.push({
        mesh: meshes[i],
        physicsId: physicsIds[i]
      });
      this.#peddles.push({
        mesh: meshes[i],
        physicsId: physicsIds[i]
      })
    };
    this.add(...meshes);
  }

  #addControls() {
    window.addEventListener("keydown", event => {
      const controlKey = this.#gameData.controlMap[event.key];
      if (!controlKey)
        return ;
      this.#peddleControls[controlKey.player].pressed = {
        ...controlKey,
        key: event.key
      };
    });

    window.addEventListener("keyup", event => {
      const controlKey = this.#gameData.controlMap[event.key];
      if (!controlKey)
        return ;
      if (this.#peddleControls[controlKey.player].pressed.key == 
        event.key) {
        this.#peddleControls[controlKey.player].pressed = {
          x: 0, 
          y: 0,
          key: null,
          player: controlKey.player
        };
      };
    })
    return this;
  }

  #addEvents() {

    const hitSoundEventId = this.#physics.addCollisionCallback(
      (collider, collidee, _time) => {
        if (Math.abs(this.#timer.elapsedTime - this.#hitSound.time) < SOUND_EFFECT_THRESHOLD)
          return false;
        if (collider.isShape("CIRCLE") || collidee.isShape("CIRCLE")) {
          return true;
        }
        return false;
      },
      () => {
        this.#hitSound.sound.currentTime = 0;
        this.#hitSound.sound.volume = this.#hitSound.volume;
        this.#hitSound.sound.play();
        this.#hitSound.time = this.#timer.elapsedTime;
      }
    );

    const hitBallEffectId = this.#physics.addCollisionCallback(
      (collider, collidee, _time) => {

        if (!collider.isShape("CIRCLE") && !collidee.isShape("CIRCLE")) {
          return false;
        }
        return (collider.data?.isPeddle || collidee.data?.isPeddle);
      },
      (collider, collidee, _time) => {
        if (this.#stuckHandler && this.#safeWallHitCount > SAFE_WALL_STUCK_THRESHOLD) {
          this.#stuckHandler(false);
        }
        this.#safeWallHitCount = 0;
        /** @type {PhysicsEntity} */
        const ball = collider.isShape("CIRCLE") ? collider: collidee;
        /** @type {PhysicsEntity} */
        const peddle = ball == collider ? collidee: collider;
        ball.velocity.x += peddle.velocity.x * 0.1;
      }
    )

    const safeWallEventId = this.#physics.addCollisionCallback(
      (collider, collidee, _time) => {

        if (!this.#stuckHandler) 
          return false;
        if (!collider.isShape("CIRCLE") && !collidee.isShape("CIRCLE")) {
          return false;
        } 
        return (collidee.data?.wallType == WALL_TYPES.safe) ;
      },
      (_collider, _collidee, _time) => {
        this.#safeWallHitCount += 1;
        if (this.#safeWallHitCount > SAFE_WALL_STUCK_THRESHOLD) {
          this.#stuckHandler(true); 
        }
      }
    )

    const ballOutEventId = this.#physics.addCollisionCallback(
      (collider, collidee, _time) => {

        if (!collider.isShape("CIRCLE") && !collidee.isShape("CIRCLE")) {
          return false;
        }
        return (collidee.data && collidee.data.wallType &&
          collidee.data.wallType == WALL_TYPES.trap);
      },
      (_collider, collidee, _time) => {
        this.#lostSide = collidee.data.direction;
        if (this.#stuckHandler && this.#safeWallHitCount > SAFE_WALL_STUCK_THRESHOLD) {
          this.#stuckHandler(false);
        }
        this.#safeWallHitCount = 0;
        this.removeBall()
          .#updateGameData();
      }
    )

    this.#eventsIds.push({
      desc: "hitSoundEvent",
      id: hitSoundEventId
    });
    this.#eventsIds.push({
      desc: "ballOutEvent",
      id: ballOutEventId
    });
    this.#eventsIds.push({
      desc: "hitBallEffect",
      id: hitBallEffectId
    });
    this.#eventsIds.push({
      desc: "safeWallEventId",
      id: safeWallEventId
    });
    return this;
  }

  #updateGameData() {
    if (!this.#lostSide)
      return ;
    /** @type {GameData} */ //@ts-ignore: casting
    const gameData = this.#gameData;
    /** @type {Player[]} */
    const players = gameData.currentPlayers;
    if (this.#lostSide != DIRECTION.top && 
      this.#lostSide != DIRECTION.bottom) {
      throw "invalid side " + this.#lostSide;
    }
    const winSide = this.#lostSide == DIRECTION.top ? DIRECTION.bottom: DIRECTION.top;
    const winPlayer = players[PLAYER_POSITION[winSide]];
    
    gameData.setScore({
      player: winPlayer, 
      score: gameData.getScore(winPlayer) + 1
    })
    return this;
  }

  /**
   * @param {{
   *  frameTime: number,
   *  frameSlice: number
   * }} args
   */
  #updateObjects({frameTime, frameSlice}) {
    this.#peddles.forEach((peddle, index) => {
      const control = this.#peddleControls[index];
      this.#physics.setState(peddle.physicsId,
        (state) => {
          let vel = { ...state.velocity };
          if (control.pressed.x == 0) {
            vel.x = Math.abs(vel.x) < EPSILON ? 0: vel.x * PEDDLE_DECEL_RATIO;
          }
          else if (control.pressed.x > 0) {
            vel.x = Math.min(MAX_PEDDLE_SPEED, vel.x + PEDDLE_ACCEL);
          }
          else {
            vel.x = Math.max(-MAX_PEDDLE_SPEED, vel.x - PEDDLE_ACCEL);
          }
          return { velocity: {
            ...vel
          }};
        })
    })
    while (frameTime > EPSILON) {
      this.#physics.update(frameSlice);
      frameTime -= frameSlice; 
      frameSlice = Math.min(frameTime, FRAME_TIME_THRESHOLD);
    }
    const states = this.#physics.allStates;
    this.#objects.forEach(({mesh, physicsId}) => {
      if (!states[physicsId])
        return ;
      const position = states[physicsId].position;
      mesh.position.set(position.x, position.y, mesh.position.z);
    })
  }

  _addHelper() {
    this.gui = new GUI();
    this.gui.close();

    const color = this.gui.addFolder("color");

    color.addColor(this, "ballColor")
      .onChange(newColor => {
        if (this.#ball.mesh)
          this.#ball.mesh.material.color.set(newColor);
      })

    color.addColor(this, "wallColor")
      .onChange(newColor => {
        Object.entries(this.#walls) 
          .forEach(([id, mesh]) => {
            mesh.material.color.set(newColor);
          })

      })

    Object.entries(this.peddleColors).forEach(([player], index) => {
      color.addColor(this.peddleColors, player) 
        .onChange(newColor => {
          this.#peddles[index].mesh.material.color.set(newColor);
        })
    })

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.setColors(
      new THREE.Color(0xffffff), 
      new THREE.Color(0xffffff), 
      new THREE.Color(0xffffff)
    )
    this.add(axesHelper);
  }
}
