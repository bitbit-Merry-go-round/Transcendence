/** @typedef DataInterval 
 *  @property unit "ms" | "sec"
 *  @property value number
 */

/** @typedef {"INSTANT" | "FLUSH" | "LAZY"} EventReactConfig */
/** @typedef {"ball" | "player" | "gameState"} CollectTarget */
/** @typedef {"playerBehvior" | "collision" | "gameDataChange"} EventType */
/** @typedef Config 
 *  @property {DataInterval} emitInterval
 *  @property {{
 *    [key in CollectTarget]: (DataInterval | "IGNORE")
 *  }}  periodicalCollect
 *  @property {{
 *    [key in EventType]: EventReactConfig
 *  }} event
 */

/** @typedef EmitterData 
 *  @property { Date } collectedDate
 *  @property { "PERIODICAL" | "EVENT" } type
 *  @property { any } data
 */

/** @typedef DataOutput
 *  @property { "GAME_DATA_OUTPUT" } prefix
 *  @property { Date } emittedTime
 *  @property { EmitterData[] } data
 */

/** @type {{
 *  [key in string]: ((_: number) => DataInterval)
 * }}
*/
const DATA_INTERVAL = Object.freeze({
  sec: (sec) => ({ unit: "sec", value: sec}),
  ms: (ms) => ({ unit: "ms", value: ms}),
});

export default class GameDataEmitter {

  /** @type Config */
  static DefaultConfig = Object.freeze({
    emitInterval: DATA_INTERVAL.sec(1),
    periodicalCollect: {
      ball: DATA_INTERVAL.ms(100),
      player: DATA_INTERVAL.ms(100),
      gameState: DATA_INTERVAL.ms(500),
    },
    event: {
      playerBehvior: "LAZY",
      collision: "LAZY",
      gameDataChange: "LAZY"
    }
  });

  /** @type Config */
  #config;

  /** @type {((output:DataOutput) => void)[]} */
  #receivers;

  /** @type {{
   *  [key in CollectTarget] : () => Object
   * }} */
  #collectors;

  #isCollecting = false;

  /** @type {EmitterData[]} */
  #pendingData;
  /** @type {number} */
  #lastEmittedDate;
  /** @type {"GAME_DATA_OUTPUT"} */
  static get outputPrefix() {
    return "GAME_DATA_OUTPUT";
  }

  /** @param {{
   *  receiver: (output:DataOutput) => void,
   *  config?: Config
   * }} params */
  constructor({
    receiver,
    config = GameDataEmitter.DefaultConfig,
  }) {
    this.#config = config;
    this.#receivers = [ receiver ];
    // @ts-ignore
    this.#collectors = {};
    this.#pendingData = [];
  }

  startEmit() {
    if (this.#receivers.length == 0) {
      console.error("No receiver");
      return ;
    }
    this.#lastEmittedDate = new Date().getTime();
    this.#emit();
  }

  #emit() {
    const interval = this.#config.emitInterval.value * 
      (this.#config.emitInterval.unit == "sec" ? 1000 : 1);
    if (this.#receivers.length == 0)
      return;
    setTimeout(() => {
      this.#emit();
    }, interval);
    const threshold = this.#lastEmittedDate + interval;
    const data = this.#pendingData;
    /** @type {DataOutput} */
    const output = {
      prefix: GameDataEmitter.outputPrefix,
      data,
      emittedTime: new Date
    };
    for (let receiver of this.#receivers) {
      receiver(output); 
    }
  }

  /** @param {EventType} type
   *  @param {Object} event
   */
  submitEvent(type, event) {
    /** @type {EventReactConfig} */
    const config = this.#config.event[type];
    const date = new Date();
    /** @type {EmitterData} */
    const formatted = {
      collectedDate: date,
      type: "EVENT",
      data: event
    };
    switch (config) {
      case("LAZY"):
        this.#pendingData.push(formatted);
        break;
      default:
        throw "not implemented";
    }
  }

  startCollecting() {
    if (this.#isCollecting)
      return ;
    this.#isCollecting = true;
    for (let k in this.#config.periodicalCollect) {
      /** @type {CollectTarget} */ //@ts-ignore 
      const target = k;
      const config = this.#config.periodicalCollect[target];
      if (config == "IGNORE")
        continue;
      this.#collect(target, config);
    }
  }

  /** @param {CollectTarget} target
   *  @param {DataInterval} interval
   * */
  #collect(target, interval) {
    if (!this.#isCollecting)
      return ;
    setTimeout(() => 
      this.#collect(target, interval),
      interval.value * (interval.unit == "sec" ? 1000 : 1));
    const date = new Date();
    const collector = this.#collectors[target];
    if (collector) {
      this.#pendingData.push({
        collectedDate: date,
        type: "PERIODICAL",
        data: collector()
      });
    }
  }
}
