import ObservableObject from "@/lib/observable_object";
import User, { createProfile } from "@/data/user";
import GameData from "@/data/game_data";
import GameAnalytics from "@/data/game_analytics";
import { generateRandomName } from "@/utils/random_name.js";
import { GameMap }  from "@/data/game_map";

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

  const gameParameter = {
    peddleSpeed: 1.0,
    nicknames: null,
    walls: null,
  };

  /** @param {{
   * speed?: number,
   * map?: any,
   * nicknames?: string[]
   * }} params */
  const setGameParameter = ({
    speed, map, nicknames
  }) => {
    if (speed && typeof(speed) == "number" 
      && speed > 0 && speed < 5) {
      gameParameter.peddleSpeed = 1.0 + (speed - 2.5) * 0.1;
    }
    if (map) {
      const walls = JSON.parse(map);
      gameMap = GameMap.createFromWalls(walls);
    }
    if (nicknames && Array.isArray(nicknames) && nicknames.length > 0 &&
      nicknames.findIndex(name => typeof(name) != "string" || name.trim().length == 0) == -1) {
      gameParameter.nicknames = nicknames; 
    }
  };

  const registerLocalGame = () => {
    if (gameParameter.nicknames == null || gameParameter.walls == null) {
      console.error("setGameParameter({nicknames, map})");
      return ;
    }
    gameData = GameData.createLocalGame(gameParameter);
    gameParameter.nicknames = null;
  };

  const registerTournamentGame = () => {
    if (gameParameter.nicknames == null || gameParameter.walls == null) {
      console.error("setGameParameter({nicknames, map})");
      return ;
    }

  }

  const removeGame = () => { gameData = null };

  const createMap = () => {

  }

  return ({ 
    gameData: () => gameData, 
    gameMap: () => gameMap ?? createMap(),
    registerLocalGame,
    registerTournamentGame, 
    removeGame, 
    setGameParameter });
})();


export default globalData;
