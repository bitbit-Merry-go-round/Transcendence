import * as THREE from "three";
import Physics from "@/game/physics";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EPSILON } from "@/game/physics_utils";
import GameData,{ GAME_TYPE } from "@/data/game_data";
import Player from "@/data/player";
import ParticleGenerator from "@/game/particle_generator";
import ObservableObject from "@/lib/observable_object";
import GUI from "node_modules/lil-gui/dist/lil-gui.esm.min.js";
import { Animation, AnimationCurves } from "@/game/animation";
import { DIRECTION, GameMap } from "@/data/game_map";
import LeafGenerator from "@/game/leaf_generator";
import ImageGenerator from "@/utils/image_generator";
import UserLabel from "@/views/components/user_label";
import ASSET_PATH from "@/assets/path";
import Asset from "@/game/asset";
import GameScene from "@/game/game_scene";
import Timer from "@/game/timer";

const FRAME_TIME_THRESHOLD = 0.01;
const MAX_PEDDLE_SPEED = 50;
const PEDDLE_ACCEL = 10;
const PEDDLE_DECEL_RATIO = 0.5;

/**
 * Game Scene.
 */
export default class Scene {

  // debug
  #isDebug = false;

  #scene;
  #scene_objs = {};
  /** @type {GameData} */
  #gameData;

  /** @type {"TOP" | "BOTTOM" | null} */
  #lostSide = null;

  /** @type {GameScene} */
  #gameScene;
  #canvas;
  /** @type {{
   *  width: number
   *  height: number
   * }} */

  /** @type {{
   *  container: THREE.Group,
   *  board: THREE.Object3D,
   *  generator: ImageGenerator
   * }}
   */
  #tournamentBoard = null;
  #windowSize;

  /** @type {THREE.PerspectiveCamera} */
  #camera;
  /** @type {OrbitControls} */
  #controls;

  cameraPositions = { 
    start: { x: 0, y: 70, z: 30 },
    startRotate: { x: 0, y: 20, z: 10 },
    play: { x: 0.2, y: 1.8, z: 0.75 },
  };

  cameraRotations = {
    play: { x: -0.26, y: 0, z: 0}
  };

  /** @type {HTMLAudioElement} */
  #bgm;

  /** @type {THREE.WebGLRenderer} */
  #renderer;

  /** @type {{
   * ambientLight: THREE.AmbientLight,
   * directionalLight: THREE.DirectionalLight
   * }} */ //@ts-ignore: setLights
  #lights = {};

  lightConfigs = {
    ambientColor: 0xffffff,
    ambientIntensity: 2.1,
    directionalColor: 0xffffff,
    directionalIntensity: 2.1
  };

  /**
   *  Object
   */

  /** @type {Timer} */
  #timer;

  /** @type {{
   *    mesh: THREE.Mesh,
   *    physicsId: number
   *  }[]}
   */
  #objects = [];

  /**
   * @type {{
   *  mesh: THREE.Mesh | null,
   *  physicsId: number | null,
   * }} 
   */
  #ball = { mesh: null, physicsId: null };

  ballColor = 0xff0000;
  #ballRadiusInGame = 3;
  #ballSpeed = 40;
  #ballStartDirection = {
    x: DIRECTION.left,
    y: DIRECTION.bottom
  };

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
  peddleColors = {
    "player1": 0x00ffff,
    "player2": 0xffff00,
  };

  peddleSizeInGame = {
    width: 0.15,
    height: 0.015
  };

  /** @type {{
   *  desc: string,
   *  id: number
   * }[]} */
  #eventsIds = [];

  /**
   * Effect
   */

  /** @type {ParticleGenerator} */
  #sceneParticle;

  /** @type {LeafGenerator} */
  #leaf;

  /** @type {{
   *    key: string,
   *    animation: Animation,
   *    speed: number,
   *    onProgress: (
   *    current: ({ x: number, y: number, z: number }|
   *    { x: number, y: number } | number)) => void,
   *    onEnded: (last: { x: number, y: number, z: number }) => void
   *  }[]} 
   */
  #animations = [];

  /** @type {{
   *  [key in string]: {
   *    colorTexture: THREE.Texture,
   *    normalTexture: THREE.Texture,
   *    aoRoughnessMetallnessTexture: THREE.Texture
   *  }
   * }} */
  #loadedTextures = { };

  /** @type {THREE.Object3D} */
  #trophy;

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
   *  topLeft:{
   *    generator: ImageGenerator,
   *    mesh: Promise<THREE.Mesh>,
   *    view: UserLabel
   *  },
   *  bottomRight: {
   *    generator: ImageGenerator,
   *    mesh: Promise<THREE.Mesh>,
   *    view: UserLabel
   *  },
   *  label: UserLabel,
   *  size: {
   *    width: number,
   *    height: number
   *  },
   * }}
   */
  #playerLabels;

  #stuckHandler;

  /**
   * @params {Object} params
   * @param {{
   *  canvas: HTMLCanvasElement,
   *  gameData: ObservableObject,
   *  gameMap: GameMap,
   *  stuckHandler: ((isStuck:boolean) => void) | null
   * }} params
   */
  constructor({canvas, gameData, gameMap, stuckHandler = null}) {
    this.#canvas = canvas;
    //@ts-ignore
    this.#gameData = gameData;
    this.#scene = new THREE.Scene();
    this.#timer = new Timer();
    this.#gameScene = new GameScene({
      timer: this.#timer,
      map: gameMap,
      data: this.#gameData,
      stuckHandler: (stuckHandler) ? 
      /**@param {boolean} isStuck */ 
      (isStuck) => stuckHandler(isStuck): null
    });
    this.#windowSize = {
      width: canvas.width,
      height: canvas.height
    };
    this
      .#loadAsset()
      .#init();
    this.#gameScene.init();
    this
      .#addHelpers()
      .#loadLeaf()
      .#startRender();
  }

  updateLabels() {
    this.#updateLabel({
      player: this.#gameData.currentPlayers[0],
      position: "TopLeft"}
    );
    this.#updateLabel({
      player: this.#gameData.currentPlayers[1],
      position: "BottomRight"}
    );
  }

  startGame() {
    this.#gameScene.addBall();
    this.isBallMoving = true;
  }

  resetBall() {
    if (this.#ball.mesh) {
      this.#gameScene.removeBall();
    }
    this.#gameScene.addBall();
    this.isBallMoving = true;
  }

  endGame() {
    if (this.#ball.mesh)  {
      this.#gameScene.removeBall();
    }
    const sound = Asset.shared.get("AUDIO", ASSET_PATH.winSound
    );
    sound.volume = 0.8;
    sound.play();
    this.isBallMoving = false;
    const cameraDest = { ...this.cameraPositions.play };
    cameraDest.z += 0.5;
    this.#showLeaves();
    if (this.#gameData.gameType == GAME_TYPE.localTournament &&
    this.#gameData.tournament.isLastRound) {
      cameraDest.z += 3;
      this.#moveObject({
        target: this.#camera,
        dest: cameraDest,
        speed: 0.005,
        curve: AnimationCurves.easein,
        onEnded: () => {
          this.#gameScene.removeParticle();
          this.#showTrophy();
        }
      });
    }
    else {
      this.#moveObject({
        target: this.#camera,
        dest: cameraDest,
        speed: 0.01,
        curve: AnimationCurves.easein
    });
    }
  }

  #showLeaves() {
    const container = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    );
    container.position.z = 0.5;
    this.#scene.add(container);
    this.#leaf.generate({
      count: 50,
      startY: 5,
      endY: -1,
      container
    });
    return this;
  }

  showTournamentBoard(onEnded) {
    const cameraDest = { ...this.cameraPositions.play };
    cameraDest.x -= 1.0;
    cameraDest.z += 1.5;
    this.#moveObject({
      target: this.#camera,
      dest: cameraDest,
      speed: 0.01,
      curve: AnimationCurves.easein,
      onEnded: () => {
        /** @type {THREE.Object3D} */
        const target = this.#tournamentBoard.board;
        const targetPos = new THREE.Vector3();
        target.getWorldPosition(targetPos);
        targetPos.z += 0.5;
        this.#rotateCameraTo({
          targetPos,
          speed: 0.01,
          curve: AnimationCurves.easein,
          onEnded: onEnded
        })
      }
    });
  }

  goToGamePosition(onEnded) {
    this.#moveObject({
      target: this.#camera,
      dest: {...this.cameraPositions.play},
      curve: AnimationCurves.easeout,
      speed: 0.015,
    });
    this.#animateRotation({
      target: this.#camera,
      dest: {...this.cameraRotations.play},
      speed: 0.015,
      onEnded: onEnded
    })
  }

  #showTrophy(onEnded) {
    if (!this.#trophy) {
      console.error("trophy is not loaded");
      return ;
    }
    this.#trophy.position.set(
      this.#camera.position.x,
      this.#camera.position.y + 0.5, 
      this.#camera.position.z - 1.5
    )
    const spotLight = new THREE.SpotLight(new THREE.Color("white"));
    spotLight.intensity = 100;
    spotLight.distance = 5;
    spotLight.angle = Math.PI * 0.1;
    spotLight.position.set(
      this.#trophy.position.x,
      this.#trophy.position.y + 1,
      this.#trophy.position.z
    );
    spotLight.target = this.#trophy;
    this.#trophy.visible = true;
    this.#scene.add(spotLight);
    const dest = new THREE.Vector3().copy(this.#trophy.position);
    dest.y -= 0.5;
    this.#moveObject({
      target: this.#trophy,
      curve: AnimationCurves.easeout,
      dest,
      speed: 0.01,
      onEnded: () => {
        this.#animateRotation({
          target:this.#trophy,
          curve: AnimationCurves.linear,
          speed: 0.001,
          dest: {
            x: this.#trophy.rotation.x,
            y: this.#trophy.rotation.y + Math.PI * 2.0,
            z: this.#trophy.rotation.z
          },
          repeat: true
        });

      }
    });
  }

  updateBoard(content) {
    this.#tournamentBoard.generator.generate(content)
      .then(canvas =>  {
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        /** @type {THREE.Mesh} */ //@ts-ignore
        const board = this.#tournamentBoard.board;
        /** @type {THREE.MeshBasicMaterial} */ //@ts-ignore
        const material = board.material;
        material.map = texture
        material.needsUpdate = true;
        return ;
      });
  }

  /** @param {HTMLElement} content */
  createBoard(content) {
    Asset.shared.load({
      path: ASSET_PATH.board,
      type: "GLTF",
      onLoad: (gltf) => {
        /** @type {THREE.Object3D} */
        let root = gltf.scene;
        while (root.children.length == 1) {
          root = root.children[0];
        }
        const board = root.children.find(
          o => o.name == "Board"
        ); 
        const scene = gltf.scene;
        const width = content.style.width;
        const height = content.style.height;
        const size = {
          width: Number(width.replace("px", "")),
          height: Number(height.replace("px", "")),
        };
        this.#tournamentBoard = {
          container: scene,
          board,
          generator: new ImageGenerator({ size })
        };
        scene.rotation.y = Math.PI * 0.4;
        board.scale.x = -0.8;
        scene.position.set(-2.5, 0, 1);
        board.position.z -= 0.1;
        board.rotation.y = Math.PI;
        this.#scene.add(scene);
        this.#tournamentBoard.generator.generate(content)
          .then(canvas => {
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            /** @type {THREE.Mesh} */ //@ts-ignore
            const mesh = board;
            mesh.material = new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true
            });
          })
      }
    })
  }

  #setPlayerLabels() {

    //@ts-ignore
    this.#playerLabels = {};
    const players = this.#gameData.currentPlayers;
    this.#playerLabels.size = { width: 300, height: 250 };
    //@ts-ignore 
    this.#playerLabels.topLeft = {
      generator :
      new ImageGenerator({
        size: this.#playerLabels.size
      })
    };
    //@ts-ignore 
    this.#playerLabels.bottomRight = {
      generator :
      new ImageGenerator({
        size: this.#playerLabels.size
      })
    };
    this.#playerLabels.topLeft.mesh = this.#createLabel({
      player: players[0],
      position: "TopLeft",
    });
    this.#playerLabels.bottomRight.mesh = this.#createLabel({
      player: players[1],
      position: "BottomRight",
    });
    return this;
  }

  /** @param {{
   *  player: Player,
   *  position: "TopLeft" | "BottomRight"
   * }} params */
  async #updateLabel({ player, position }) {
    const {view, generator, mesh} = position == "TopLeft" ?
      this.#playerLabels.topLeft: 
      this.#playerLabels.bottomRight;
    const powerUps = this.#gameData.getPowerUps(player);
    view.data.name = player.nickname;
    view.data.texts = ["item", ...powerUps.map(p => p.desc)];
    await view.render();
    /** @type {HTMLElement} */
    const canvas = await generator.generate(view);
    mesh.then(mesh => {
      const texture = new THREE.Texture(canvas);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.needsUpdate = true;
        /** @type {THREE.MeshBasicMaterial} */ //@ts-ignore
      const material = mesh.material;
      material.map = texture
      material.needsUpdate = true;
    })
  }

  /** @param {{
   *  player: Player,
   *  position: "TopLeft" | "BottomRight"
   * }} params */
  async #createLabel({player, position}) {
    const powerUps = this.#gameData.getPowerUps(player);
    const view = new UserLabel({data: {
      name: player.nickname,
      texts: ["item", ...powerUps.map(p => p.desc)]
    }})
    await view.render();
    if (position == "TopLeft") {
      this.#playerLabels.topLeft.view = view;
    }
    else {
      this.#playerLabels.bottomRight.view = view;
    }
    //@ts-ignore 
    view.children[0].style.width = this.#playerLabels.size.width + "px";
    //@ts-ignore 
    view.children[0].style.height = this.#playerLabels.size.height+ "px";
    const generator = position == "TopLeft" ? this.#playerLabels.topLeft.generator : this.#playerLabels.bottomRight.generator;
    return generator.generate(view)
      .then(canvas => {
        const texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        const plane = new THREE.PlaneGeometry(
          0.3, 
          0.3
        );
        const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        }));
        mesh.scale.set(1.5, 1, 1);
        return mesh;
      });
  }

  prepareDisappear() {
    this.#bgm.pause();
    this.#bgm.currentTime = 0;
  }

  #loadAsset() {
    this.#loadScene()
      .#loadTrophy();
    return this;
  }

  #loadScene() {
    /**
     * Scene
     */
    Asset.shared.load({
      type: "GLTF",
      path: ASSET_PATH.scene,
      onLoad: (gltf) => {
        const scene= gltf.scene;
        scene.scale.set(2, 2, 2);
        scene.children.forEach(obj =>  {
          this.#scene_objs[obj.name] = obj;
        });

        /** @type {THREE.Mesh} */
        const keyboard = this.#scene_objs["keyboard"];
        keyboard.scale.x *= -1;
        keyboard.position.z -= 0.1;

        /** @type {THREE.Mesh} */
        const mac = this.#scene_objs["macintosh"];


        /** @type {THREE.Mesh} */
        let screen;
        mac.traverse(obj => {
          if (obj.name == "screen") //@ts-ignore
            screen = obj
        });
        const screenBox= new THREE.Box3().setFromObject(screen);
        const screenSize = {
          x: screenBox.max.x - screenBox.min.x,
          y: screenBox.max.y - screenBox.min.y,
          z: screenBox.max.z - screenBox.min.z
        };

        const sceneBox = new THREE.Box3().setFromObject(this.#gameScene);
        const sceneSize = {
          x: sceneBox.max.x - sceneBox.min.x,
          y: sceneBox.max.y - sceneBox.min.y,
          z: sceneBox.max.z - sceneBox.min.z
        };

        this.#gameScene.position.copy(screen.position)
        this.#gameScene.position.z += 0.1;

        this.#gameScene.scale.set(
          (screenSize.x / sceneSize.x) * 0.7,
          (screenSize.y / sceneSize.y) * 0.65,
          (screenSize.x / sceneSize.x) * 0.8
        );
        const labelContainer = screen.parent;
        this.#playerLabels.topLeft.mesh
          .then(label => {
            label.position.set(-0.6, 1.2, 1.5);
            labelContainer.add(label)}
          );
        this.#playerLabels.bottomRight.mesh
          .then(label => {
            label.position.set(0.5, -0.4, 1.5);
            labelContainer.add(label);
          });
         
        screen.parent.add(this.#gameScene);
        screen.removeFromParent();

        this.#scene.add(scene);
        this.#camera.position.set(
          this.cameraPositions.start.x,
          this.cameraPositions.start.y,
          this.cameraPositions.start.z,
        );
        const screenPos = new THREE.Vector3();
        this.#gameScene.getWorldPosition(screenPos);
        if (this.#isDebug)
          this.#controls.target = screenPos;
        this.#camera.lookAt(0, 0, 0);
        this.#moveObject({
          target: this.#camera,
          dest: {...this.cameraPositions.startRotate},
          speed: 0.008,
          curve: AnimationCurves.easein,
          onEnded: () => {
            this.#sceneParticle.isPlaying = false;
            this.goToGamePosition(); 
          }
        });
      }
    })
    return this;
  }

  #loadTrophy() {
    if (this.#gameData.gameType !=
      GAME_TYPE.localTournament) {
      return this;
    }
    Asset.shared.load({
      type: "GLTF",
      path: ASSET_PATH.laurel_wreath,
      onLoad: (gltf) => {
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        gltf.scene.position.set(1, 2, 2);
        this.#trophy = gltf.scene;
        this.#trophy.visible = false;
        this.#scene.add(this.#trophy);
      }
    })
    return this;
  }

  /** @param {{
   *    target: THREE.Object3D,
   *    dest: {
   *      x: number, y: number, z: number
   *    },
   *    speed: number,
   *    curve?: (t: number) => number,
   *    onEnded?: (last:{
   *      x: number, y: number, z: number
   *    }) => void
   * }} params
   */
  #moveObject({target, dest, speed, curve = AnimationCurves.smoothstep, onEnded = () => {}}) {
    const animation = new Animation({
      start: target.position.clone(),
      end: new THREE.Vector3(
        dest.x, 
        dest.y,
        dest.z
      ),
      curve,
      repeat: false,
      key: target.name + "Move"
    })
    this.#animations.push({
      animation,
      speed,
      onProgress: (pos) => { //@ts-ignore 
        target.position.set(pos.x, pos.y, pos.z);
      },
      onEnded,
      key: animation.key
    });
    return (this.#animations[this.#animations.length - 1]);
  }

  /** @param {{
   *    targetPos: THREE.Vector3,
   *    speed: number,
   *    curve?: (t: number) => number,
   *    onEnded?: (last:{
   *      x: number, y: number, z: number
   *    }) => void
   * }} params 
   * */
  #rotateCameraTo({targetPos, speed, 
    curve = AnimationCurves.smoothstep, onEnded = () => {}}) {
    const qCamera = this.#camera.quaternion.clone();
    this.#camera.lookAt(targetPos);
    const dest = this.#camera.quaternion.clone();
    this.#camera.quaternion.copy(qCamera);
    const animation = new Animation({
      start: 0,
      end: 1,
      curve,
      repeat: false,
      key: "cameraRotateTo"
    })
    this.#animations.push({
      animation,
      speed,
      onProgress: (progress) => { //@ts-ignore 
        this.#camera.quaternion.slerp(dest, progress);
      },
      onEnded,
      key: animation.key
    });
    return (this.#animations[this.#animations.length - 1]);
    
  }

  /** @param {{
   *    target: THREE.Object3D,
   *    dest: {
   *      x: number, y: number, z: number
   *    },
   *    speed: number,
   *    curve?: (t: number) => number,
   *    repeat?: boolean,
   *    onEnded?: (last:{
   *      x: number, y: number, z: number
   *    }) => void
   * }} params
   */
  #animateRotation({
    target,
    dest, 
    speed, 
    curve = AnimationCurves.smoothstep, 
    repeat = false,
    onEnded = () => {}}) {
    const animation = new Animation({
      start: new THREE.Vector3().copy(target.rotation),
      end: new THREE.Vector3(
        dest.x,
        dest.y,
        dest.z
      ),
      curve,
      repeat,
      key: target.name + "rotate"
    })
    this.#animations.push({
      animation,
      speed,
      onProgress: (rotation) => { //@ts-ignore 
        target.rotation.set(rotation.x, rotation.y, rotation.z);
      },
      onEnded,
      key: animation.key
    });
    return (this.#animations[this.#animations.length - 1]);
  }

  #init() {
    this
      .#setBgm()
      .#setSceneBackground()
      .#setLights()
      .#setCamera()
      .#setRenderer()
      .#setPlayerLabels()
      .#addResizeCallback();
    return this;
  }


  #setLights() {

    const gameAmbientLight = new THREE.AmbientLight(this.lightConfigs.ambientColor, this.lightConfigs.ambientIntensity);
    const gameDirectionalLight = new THREE.DirectionalLight(
    );
    gameDirectionalLight.castShadow = true;
    gameDirectionalLight.shadow.mapSize.set(1024, 1024);
    gameDirectionalLight.shadow.camera.far = 15;
    gameDirectionalLight.position.set(0, 0, 1);
    this.#gameScene.add(gameAmbientLight, gameDirectionalLight);
    this.#lights.ambientLight = gameAmbientLight;
    this.#lights.directionalLight = gameDirectionalLight;
    return this;
  }

  #setSceneBackground() {
    this.#scene.background = new THREE.Color("black");
    const container = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
      })
    );
    this.#sceneParticle= new ParticleGenerator({
      count: 500,
      particleSize: 0.3,
      computeDepth: true,
      maxSize: {
        x: 2, 
        y: 2,
        z: 2
      },
    });
    this.#sceneParticle.animationConfig.speedCoefficient = 0.0001;
    this.#sceneParticle.animationConfig.speedVariantConstant = 1;
    this.#sceneParticle.setColor(["#ffffff", "#ddd0b2", "#f8edde", "#3ac4d6"]);

    this.#sceneParticle.createParticles();
    const particles = this.#sceneParticle.getParticles();
    container.add(particles);
    container.scale.set(100, 100, 100);
    this.#scene.add(container);

    return this;
  }

  #setBgm() {
    this.#bgm = Asset.shared.get("AUDIO", ASSET_PATH.bgm);
    this.#bgm.loop = true;
    this.#bgm.volume = 0.05;
    this.#bgm.play()
    return this;
  }

  #setCamera() {
    this.#camera = new THREE.PerspectiveCamera(
      75,
      this.#windowSize.width / this.#windowSize.height,
      0.1,
      150
    );
    this.#scene.add(this.#camera);
    if (this.#isDebug) {
      this.#controls = new OrbitControls(this.#camera, this.#canvas);
      this.#controls.enableDamping = true;
    }
    return this;
  }

  #setRenderer() {
    this.#renderer = new THREE.WebGLRenderer({
      canvas: this.#canvas,
      alpha: true,
      antialias: true
    });
    this.#renderer.shadowMap.enabled = true;
    this.#renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.#renderer.setSize(this.#windowSize.width, 
      this.#windowSize.height);
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    return this;
  }

  #addResizeCallback() {
    const resizeCallback = (() => {

      const width = this.#canvas.parentElement.offsetWidth;
      const height = this.#canvas.parentElement.offsetHeight;

      this.#windowSize = {
        width,
        height,
      };

      this.#camera.aspect = width / height;
      this.#camera.updateProjectionMatrix();
      this.#renderer.setSize(width, height);
      this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    }).bind(this);
    window.addEventListener("resize", () => resizeCallback()) 
    return this;
  }

  /*
   * Dev tool
   */
  #addHelpers() {
    if (!this.#isDebug)
      return this;
    this.gui = new GUI();
    this.gui.close();
    this.configs = {
      envMapIntensity: 1,
      bgmVolume: 0.05,
      effectVolume: 0.8,
    };

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.setColors(
      new THREE.Color(0xffffff), 
      new THREE.Color(0xffffff), 
      new THREE.Color(0xffffff)
    )
    this.#scene.add(axesHelper);
    const gameAxesHelper = new THREE.AxesHelper(5);
    gameAxesHelper.setColors(
      new THREE.Color(0x0000ff), 
      new THREE.Color(0x0000ff), 
      new THREE.Color(0x0000ff)
    );
    this.#gameScene.add(gameAxesHelper); 


    const sound = this.gui.addFolder("sound");

    sound.add(this.configs, "bgmVolume")
      .min(0)
      .max(1)
      .step(0.001)
      .onChange(volume => {
        this.#bgm.volume = volume;
      })

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

    const light = this.gui.addFolder("light");

    light.add(this.configs, "envMapIntensity")
      .min(0)
      .max(3)
      .step(0.001)
      .onChange((intensity) => {
        this.#scene.traverse(child => {
          if (child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = intensity;
          }
        })
      })
    light.addColor(this.lightConfigs, "ambientColor")
      .onChange(color => {
        this.#lights.ambientLight.color.set(color);
      })

    light.addColor(this.lightConfigs, "directionalColor")
      .onChange(color => {
        this.#lights.directionalLight.color.set(color);
      })

    light.add(this.lightConfigs, "ambientIntensity")
      .min(0).max(5)
      .step(0.01)
      .onChange(value => this.#lights.ambientLight.intensity = value);

    light.add(this.lightConfigs, "directionalIntensity")
      .min(0).max(5)
      .step(0.01)
      .onChange(value => this.#lights.directionalLight.intensity = value);

    const background = this.gui.addFolder("background");
    background.add(this.#scene, "backgroundBlurriness")
      .min(0).max(1).step(0.001);
    background.add(this.#scene, "backgroundIntensity")
      .min(0).max(1).step(0.001);

    return this;
  }

  #loadLeaf() {
    this.#leaf = new LeafGenerator();
    this.#leaf.load();
    return this;
  }

  #startRender() {
    this.#timer.onTick(frameTime => {
      if (this.#isDebug)
        this.#controls.update()
      this.#gameScene.update(frameTime);
      this.#runAnimations();
      this.#sceneParticle.animate();
      this.#leaf.animate();
      this.#renderer.render(this.#scene, this.#camera);
    });
    this.#timer.start();
    return this;
  }

  #runAnimations() {
    this.#animations.forEach(
      ({animation, speed, onProgress, key, onEnded}) => {
        animation.proceed(speed);
        onProgress(animation.current);
        if (animation.isFinished) {
          onEnded(animation.current);
        }
      })
    this.#animations = this.#animations.filter(e => !e.animation.isFinished);
  }
}
