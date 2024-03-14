import * as THREE from "three";

/**
 * Particles.
 */
export default class ParticleGenerator {


  /** @type {THREE.Group} */
  #particleContainer;
   /**
    * @type {THREE.Texture[]}
    */
  #particlesTextures = [];
  /**
   * @type {THREE.TextureLoader}
   */
  textureLoader;
  /**
   * @type {number}
   */
  count;
  /**
   * @type {THREE.Points}
   */
  #particles;
  scale = {x: 1, y: 1, z: 1};

  particleData = [];


  /**
   * constructor.
   *
   * @params {{
   *   textureLoader: THREE.TextureLoader,
   *   size: {
   *    x: number,
   *    y: number,
   *    z: number
   *   },
   *   count: number
   * }}
   */
  constructor({
    textureLoader,
    count
  }) {
    this.textureLoader = textureLoader;
    this.count = count;
    this.#particleContainer = new THREE.Group();
  }

  /** createParticles. */
  createParticles() {

    const buffer = new THREE.BufferGeometry()
    const vertices = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    for (let i3 = 0; i3 < this.count; ++i3) {
      //xyz
      const x =  (Math.random() - 0.5);
      const y = (Math.random() - 0.5);
      const z = (Math.random() - 0.5);
      vertices[i3] = x;
      vertices[i3 + 1] = y;
      vertices[i3 + 2] = z;
      // rgb
      colors[i3] = Math.random(); 
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();

      //animate

      const time = Math.random() * 100;
      const speed = Math.random() * 0.01;

      this.particleData.push({
        position: {
          x, y, z
        },
        time,
        speed
      });
    }

    buffer.setAttribute("position",
      new THREE.BufferAttribute(vertices, 3)
    );
    buffer.setAttribute("color",
      new THREE.BufferAttribute(colors, 3)
    )
    const material = new THREE.PointsMaterial({
      transparent: true,
      size: 0.05,
      vertexColors: true,
      sizeAttenuation: true
    });
    this.#particles = new THREE.Points(buffer, material);
    this.#particleContainer.add(this.#particles);
    return this;
  }

  getParticles() {
    return this.#particleContainer;
  }

  /**
   * animate.
   */
  animate() {
    const maxSize = {
      x: 5,
      y: 5,
      z: 1
    }
    for (let i = 0; i < this.count / 2; ++i) {
      const data = this.particleData[i];
      const position = data.position;
    
      const t = (data.time += data.speed);
      
      position.x = Math.cos((t * 0.1)) + (Math.sin(t * 1));
      position.y = Math.cos((t * 0.2)) + (Math.cos(t * 2));
      position.z = Math.cos((t * 0.1));

      const i3 = i * 3;

      this.#particles.geometry.attributes.position.array[i3] = position.x;
      this.#particles.geometry.attributes.position.array[i3 + 1] = position.y;
      this.#particles.geometry.attributes.position.array[i3 + 2] = position.z;
    }


    for (let i = this.count / 2; i < this.count; ++i) {
      const data = this.particleData[i];
      const position = data.position;
    
      const t = (data.time += data.speed);
      
      position.x = Math.cos((t * 0.1)) - (Math.sin(t * 1));
      position.y = Math.cos((t * 0.2)) - (Math.cos(t * 2));
      position.z = Math.cos((t * 0.1));

      const i3 = i * 3;

      this.#particles.geometry.attributes.position.array[i3] = position.x;
      this.#particles.geometry.attributes.position.array[i3 + 1] = position.y;
      this.#particles.geometry.attributes.position.array[i3 + 2] = position.z;
    }

    this.#particles.geometry.attributes.position.needsUpdate = true;
  }
}

