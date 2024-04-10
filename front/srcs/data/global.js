import ObservableObject from "@/lib/observable_object";
import User, { createProfile } from "@/data/user";
import GameData from "@/data/game_data";
import GameAnalytics from "@/data/game_analytics";
import { generateRandomName } from "@/utils/random_name.js";
import { GameMap, examples }  from "@/data/game_map";

/** @typedef {(params: {
 * speed?: number,
 * map?: any,
 * nicknames?: string[]
 * }) => void } SetGameParameter */

export const DEBUG = (() => {
  let isDebug = false;

  return ({
    isDebug: () => isDebug,
    setDebug: /** @param {boolean}debug */ 
    (debug) => isDebug = debug,
  });
})();

export const STATE = (() => {
  let isPlayingGame = false;
  /** @type {(() => Promise<boolean>) | null} */
  let cancelGameCallback = null;
  let isRequestPending = false;

  return ({
    isPlayingGame: () => isPlayingGame,
    setPlayingGame: /** @param {boolean} play*/ 
    (play) => isPlayingGame = play,
    /** @type {() => Promise<boolean>} */
    requestCancelGame: () => {
      if (isRequestPending)
        return Promise.resolve(false);
      else if (cancelGameCallback) {
        isRequestPending = true;
        return (cancelGameCallback()
          .then(res => {
            isRequestPending = false
            return res;
          }
          ));
      }
      return Promise.resolve(true);
    },
    setCancelGameCallback: 
    /** @param{(() => Promise<boolean>) | null} callback */
    (callback) => cancelGameCallback = callback
  })
})();

const globalData = (() =>{

  /** @type { GameData | null } */
  let gameData = null;
  /** @type { GameMap| null } */
  let gameMap = null;
  /** @param {{
   * speed?: number,
   * map?: any,
   * nicknames?: string[],
   * powerUp: boolean
   * }} params */
  const setGameParameter = ({
    speed, map, nicknames, powerUp
  }) => {
    if (speed && typeof(speed) == "number" 
      && speed > 0 && speed < 5) {
      gameParameter.peddleSpeed = 1.0 + (speed - 2.5) * 0.1;
    }
    if (map) {
      const walls = JSON.parse(map);
      gameParameter.walls = walls;
    }
    if (nicknames && Array.isArray(nicknames) && nicknames.length > 0 &&
      nicknames.findIndex(name => typeof(name) != "string" || name.trim().length == 0) == -1) {
      gameParameter.nicknames = nicknames; 
    }
    if (powerUp)
      gameParameter.powerUp = powerUp;
  };

  const isParameterValid = () => {
    if (gameParameter.nicknames == null) {
      console.error("nicknames not set setGameParameter({nicknames})");
      return false;
    }
    else if (gameParameter.walls == null) {
      console.error("map not set setGameParameter({map})");
      return false;
    }
    else if (gameParameter.powerUp == null) {
      console.error("powerUp not set setGameParameter({powerUp})");
      return false;
    }
  }

  const registerLocalGame = () => {
    if (!isParameterValid())
      throw "registerLocalGame";
    else if (gameParameter.nicknames.length < 2) {
      console.error(`nicknames.length = ${gameParameter.nicknames}`);
      throw "registerLocalGame";
    }
    gameData = new ObservableObject(GameData.createLocalGame(gameParameter));
    gameParameter.nicknames = null;
    gameParameter.walls = null;
  };

  const registerTournamentGame = () => {
    if (!isParameterValid())
      throw "registerLocalGame";
    else if (gameParameter.nicknames.length < 3) {
      console.error(`nicknames.length = ${gameParameter.nicknames}`);
      throw "registerLocalGame";
    }
    gameData = new ObservableObject(GameData.createTournamentGame(gameParameter));
    gameParameter.nicknames = null;
    gameParameter.walls = null;
  }

  const removeGame = () => { gameData = null };

  const createMap = () => {
    gameMap = GameMap.createFromWalls(gameParameter.walls);
    return gameMap;
  }

  return ({ 
    gameData: () => gameData, 
    gameMap: () => gameMap ?? createMap(),
    registerLocalGame,
    registerTournamentGame, 
    removeGame, 
    setGameParameter 
  });
})();

export default globalData;
export const Types = {};
