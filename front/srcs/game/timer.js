import * as THREE from "three";
import Observable from "@/lib/observable";

export default class Timer {

  /**  @type {THREE.Clock} */
  #clock;
  #lastElapsedTime;
  #callbacks;

  /** @returns {number} */
  get elapsedTime() {
    return this.#lastElapsedTime.value;
  }

  constructor() {
    this.#clock = new THREE.Clock();
    this.#lastElapsedTime = new Observable(0);
    this.#clock.stop();
    this.#callbacks = [];
  }

  /** @param {(frameTime: number) => void} callback */
  onTick(callback) {
    this.#callbacks.push(callback); 
  }

  start() {
    if (this.#clock.running)
      return;
    this.#clock.start();
    window.requestAnimationFrame(() => this.#tick());
  }

  #tick() {
    const current = this.#clock.getElapsedTime();
    const time = current - this.#lastElapsedTime.value;
    this.#lastElapsedTime.value = current;
    window.requestAnimationFrame(() => this.#tick());
    for (let callback of this.#callbacks) {
      callback(time);
    }
  }
}
