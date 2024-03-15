import { Vector3 } from "three";


export const AnimationCurves = {
  smoothstep: (t) => {
    return t * t * (3 - 2 * t);
  },
  easein: (t) => {
    return 1 - Math.cos(t * Math.PI * 0.5);
  },
  easeout: (t) => {
    return Math.sin(t * Math.PI * 0.5);
  }
}

/**
 * Animation.
 */
export class Animation {

  /** @type {Vector3} */ 
  #start;
  /** @type {Vector3} */
  #end;
  /** @type {boolean} */
  #repeat
  /** @type {(number) => number} */
  #curve;

  /** @type {Vector3} */
  #dir;
  /** @type {number} */
  #_progress = 0;
  /** @type {number} */
  #_passed = 0;

  /** @type {number} */
  #length
  /** @type {string} */
  key;


  /**
   * constructor.
   * @param {{
   *  start: Vector3,
   *  end: Vector3,
   *  repeat: boolean,
   *  key: string,
   *  curve: (t: number) => number,
   * }} params
   */
  constructor({start, end, repeat, key = "", curve}) {
    this.#start = start;  
    this.#end = end;
    this.#repeat = repeat;
    this.#dir = new Vector3().subVectors(end, start);
    this.#length = this.#dir.length();
    this.#dir.normalize();
    this.#curve = curve;
    this.key = key;
  }

  /** @param {number} delta*/
  proceed(delta) {
    this.#_progress += delta;
    this.#_progress = Math.min(this.#_progress, 1);
    this.#_passed = this.#curve(this.#_progress);
  }

  get current() {
    const scaled = this.#_passed * this.#length;
    return ({
      x: this.#start.x + this.#dir.x * scaled,
      y: this.#start.y + this.#dir.y * scaled,
      z: this.#start.z + this.#dir.z * scaled
    });
  }

  /** @returns {boolean} */
  get isFinished() {
    return (this.#_progress >= 1);
  }

  /** @returns {number} */
  get progress() {
    return (this.#_progress);
  }

}
