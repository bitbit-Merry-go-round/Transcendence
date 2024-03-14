import * as THREE from "three";

/**
 * Particles.
 */
export default class ParticleGenerator {


  /** @type {THREE.Group} */
  #particleContainer;

   /** @type {THREE.Texture[]} */
  #particlesTextures = [];

  /** @type {THREE.TextureLoader} */
  textureLoader;

  /** @type {number} */
  count;

  /** @type {number} */
  particleSize;

  /** @type {THREE.Points} */
  #particles;

  /** @type{{
      position: {
        x: number, 
        y: number, 
        z: number
      },
      time: number,
      speed: number,
      factor: number
    }[]}
    */
  particleData = [];

  /** @type {{
      x: number, 
      y: number, 
      z: number
    }}
    */
  maxSize


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
   *   count: number,
   *   particleSize: number,
   *   maxSize?: {
   *    x: number,
   *    y: number,
   *    z: number
   *   }
   * }}
   */
  constructor({
    textureLoader,
    count,
    particleSize,
    maxSize = null
  }) {
    this.textureLoader = textureLoader;
    this.count = count;
    this.particleSize = particleSize;
    this.#particleContainer = new THREE.Group();
    this.maxSize = maxSize;
  }

  /** createParticles. */
  createParticles() {

    const buffer = new THREE.BufferGeometry()
    const vertices = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    for (let i3 = 0; i3 < this.count; ++i3) {
      //xyz
      const x =  (Math.random() - 0.5) * this.maxSize.x;
      const y = (Math.random() - 0.5) * this.maxSize.y;
      const z = (Math.random() - 0.5) * this.maxSize.z;
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
      const factor = Math.random() * 100 + 1; 

      this.particleData.push({
        position: {
          x, y, z
        },
        time,
        speed,
        factor
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
      size: this.particleSize,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
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

    for (let i = 0; i < this.count; ++i) {
      const data = this.particleData[i];
      const { position, factor } = data;
    
      const t = (data.time += data.speed);
      
      position.x += (Math.cos((t * 0.1) * factor) + (Math.sin(t * 1) * factor)) * 0.001;
      position.y += (Math.sin((t * 0.1) * factor) + (Math.cos(t * 2) * factor)) * 0.001;
      position.z += (Math.cos((t * 0.1) * factor) + (Math.sin(t * 3) * factor)) * 0.001; //@ts-ignore: performance
      if (this.maxSize) {
        position.x *= 1 - (Math.abs(position.x) > this.maxSize.x) //@ts-ignore: performance
        position.y *= 1 - (Math.abs(position.y) > this.maxSize.y) //@ts-ignore: performance
        position.z *= 1 - (Math.abs(position.z) > this.maxSize.z)

      }
      const i3 = i * 3;
      this.#particles.geometry.attributes.position.array[i3] = position.x;
      this.#particles.geometry.attributes.position.array[i3 + 1] = position.y;
      this.#particles.geometry.attributes.position.array[i3 + 2] = position.z;
    }

    this.#particles.geometry.attributes.position.needsUpdate = true;
  }
}

