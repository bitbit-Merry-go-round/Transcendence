import ObservableObject from "@/lib/observable_object";
import User, { createProfile } from "@/data/user";
import GameData from "@/data/game_data";
import GameAnalytics from "@/data/game_analytics";
import { generateRandomName } from "@/utils/random_name.js";

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

  let game = GameData.createTournamentGame(
    [
      generateRandomName(),  
      generateRandomName(),  
      generateRandomName(),  
      generateRandomName(),  
    ]
  );
  let analytics = new GameAnalytics({gameData: game});

  const gameData = new ObservableObject(game);
  const registerGame = (newGame) => {
    game = newGame;
    analytics = new GameAnalytics({ gameData: newGame });
  };

  return ({ gameData, registerGame, analytics });
})();


export default globalData;
