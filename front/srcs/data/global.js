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
