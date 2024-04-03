import { getRandomFromObject } from "@/utils/type_util";
import PhysicsEntity from "@/game/physics_entity";

/** @typedef {Object} PowerUpInfo
 *  @property {"SUMMON" | "BUFF" | "DEBUFF"} type,
 *  @property {string} key,
 *  @property {string} desc
 */

/**@type {{
 * [key: string]: "SUMMON" | "BUFF" | "DEBUFF" 
 * }} */
export const POWER_UP_TYPES = Object.freeze({
  summon: "SUMMON",
  buff: "BUFF",
  debuff: "DEBUFF",
});

export const POWER_TARGETS = Object.freeze({
  ball: "BALL",
  peddle: "PEDDLE",
});

/** @type {{
 *  [key: string] : PowerUpInfo
 * }} */
export const SUMMONS = Object.freeze({
  block: {
    type: POWER_UP_TYPES.summon,
    key: "SUMMON_BLOCK",
    desc: "🧱 Create block",
  },
  ball: {
    type: POWER_UP_TYPES.summon,
    key: "SUMMON_BALL",
    desc: "🔴 Summon ball",
  },
  peddle: {
    type: POWER_UP_TYPES.summon,
    key: "SUMMON_PEDDLE",
    desc: "🏓 Helper peddle",
  },
});

/** @type {{
 *  [key: string] : PowerUpInfo
 * }} */
export const BUFFS = Object.freeze({
  peddleSize: {
    type: POWER_UP_TYPES.buff,
    key: "PEDDLE_SIZE_UP",
    desc: "⏫ Size up me",
  },
  peddleSpeed: { 
    type: POWER_UP_TYPES.buff,
    key: "PEDDLE_SPEED_UP", 
    desc: "🚀 Speed up me",
  },
});

/** @type {{
 *  [key: string] : PowerUpInfo
 * }} */
export const DEBUFFS = Object.freeze({
  peddleSize: { 
    type: POWER_UP_TYPES.debuff,
    key: "PEDDLE_SIZE_DOWN", 
    desc: "⏬ Size down opponent"
  },
  peddleSpeed: {
    type: POWER_UP_TYPES.debuff,
    key: "PEDDLE_SPEED_DOWN", 
    desc: "🐢 Slow down opponent"
  },
});

export default class PowerUp {

  /** @type {"SUMMON" | "BUFF" | "DEBUFF"} type */
  #_type;

  /** @type {PowerUpInfo} */
  #info;

  #defaultTargetStatus = null;

  get info() {
    return ({
      type: this.#_type,
      desc: this.#info.desc 
    });
  }

  /** @type {((target: any) => void)[]} */
  #useCallbacks = [];

  /** @type {((target: any) => void)[]} */
  #revokeCallbacks = [];

  /** @type {number} */
  #_duration;
  get duration() {
    return this.#_duration;
  }

  #_target;
  get target() {
    return this.#_target;
  }

  /**
   * constructor.
   * @param {{
   *  info: PowerUpInfo,
   *  duration: number,
   * }} params
   */
  constructor({info, duration}) {

    if (duration <= 0) {
      throw "Invalid duration";
    }
    this.#_type = info.type;
    this.#info = info;
    this.#_duration = duration;
    this.#_target = null;
  }

  /** @param {any} target */
  use(target) {
    this.#_target = target;
    
    switch (this.#_type) {
      case(POWER_UP_TYPES.buff):
        this.#useBuff();
        break;
      case(POWER_UP_TYPES.debuff):
        this.#useDebuff();
        break;
    }
    this.#useCallbacks.forEach(callback => {
      callback(target);
    });
  }

  revoke() {

    this.#revokeCallbacks.forEach(callback => {
      callback(this.#_target);
    });
  }

  update(duration) {
    if (this.#_duration == 0)
      return ;
    this.#_duration = Math.max(this.#_duration - duration, 0);
    switch (this.#_type) {
      case (POWER_UP_TYPES.buff):
        this.#updateBuff();
        break;
      case (POWER_UP_TYPES.debuff):
        this.#updateDebuff();
        break;
      case (POWER_UP_TYPES.summon):
        break;
    }
  }

  get isEnd() {
    return this.#_duration == 0;
  }


  /** @param {(target: any) => void} callback */
  setUseCallback(callback) {
    this.#useCallbacks.push(callback);
  }

  /** @param {(target: any) => void} callback */
  setRevokeCallback(callback) {
    this.#revokeCallbacks.push(callback);
  }

  #useBuff() {
    if (this.#info == BUFFS.peddleSize) {
      /** @type {PhysicsEntity} */
      const peddle = this.#_target;
      this.#defaultTargetStatus = peddle.width;
      peddle.setWidth(peddle.width * 2);
    }
    else if (this.#info == BUFFS.peddleSpeed) {
      /** @type {PhysicsEntity} */
      const peddle = this.#_target;
      this.#defaultTargetStatus = {...peddle.velocity};
      if (peddle.velocity.x > 0) {
        peddle.velocity.x += 1;
      }
      else {
        peddle.velocity.x -= 1;
      }
    }
  }

  #updateBuff() {
    if (this.#info == BUFFS.peddleSpeed) {
      /** @type {PhysicsEntity} */
      const peddle = this.#_target;
      peddle.velocity.x *= 1.1;
    }
  }

  #useDebuff() {
    if (this.#info == DEBUFFS.peddleSize) {
      /** @type {PhysicsEntity} */
      const peddle = this.#_target;
      this.#defaultTargetStatus = peddle.width;
      peddle.setWidth(peddle.width * 0.5);
    }
    else if (this.#info == DEBUFFS.peddleSpeed) {
      /** @type {PhysicsEntity} */
      const peddle = this.#_target;
      this.#defaultTargetStatus = {...peddle.velocity};
      if (peddle.velocity.x > 0) {
        peddle.velocity.x = Math.max(peddle.velocity.x - 1, 0);
      }
      else {
        peddle.velocity.x = Math.min(peddle.velocity.x + 1, 0);
      }
    }
  }

  #updateDebuff() {
    if (this.#info == DEBUFFS.peddleSpeed) {
      /** @type {PhysicsEntity} */
      const peddle = this.#_target;
      if (peddle.velocity.x > 0) {
        peddle.velocity.x = Math.min(peddle.velocity.x , 2);
      }
      else {
        peddle.velocity.x = Math.max(peddle.velocity.x , -2);
      }
    }
  }
}

export const Types = {};

