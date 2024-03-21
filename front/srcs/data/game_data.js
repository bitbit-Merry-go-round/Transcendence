import { isEmptyObject } from "@/utils/typeutils";
import { generateRandomName } from "@/utils/random_name";

/**
 * @typedef {Object} GameResult
 * @property {Player[]} players
 * @property {{
 *   [key: string]: number
 * }} scores
 */

/** @typedef {Object} Match 
 *  @property {{
 *    name: string,
 *    score: number | "",
 *    class: string
 *  }} playerA
 *  @property {{
 *    name: string,
 *    score: number | "",
 *    class: string
 *  }} playerB
*/

export const GAME_TYPE = Object.freeze({
  local1on1: "LOCAL_1ON1",
  localTournament: "LOCAL_TOURNAMENT",
  remote: "REMOTE"
});

/** Tournament. */
export class Tournament {

   /** @type {Match} */
  #_currentMatch;

  /** @type {{
   *    numberOfPlayers: number,
   *    matches: Match[]
   * }} */
  #_currentRound;

  #_allRounds;

  get allRounds() {
    return this.#_allRounds;
  }

  /** @type {Player[]} */
  #allPlayers;

  /** @returns {Match} */
  get currentMatch() {
    return {...this.#_currentMatch};
  }

  get currentPlayers() {
    const playerNames = [this.#_currentMatch.playerA.name, this.#_currentMatch.playerB.name];
    return playerNames.map(name => this.#allPlayers.find(p => p.nickname == name));
  }

  /** @returns {{
   *    numberOfPlayers: number,
   *    matches: Match[]
   * }} */
  get currentRound() {
    return {...this.#_currentRound};
  }

  /**
   * constructor.
   * @param {{
   *  players: Player[]
   * }} params
   */
  constructor({players}) {
    this.#allPlayers = players;
    this.#_currentRound = this.#createRound(players);
    this.#_currentMatch = this.#_currentRound.matches[0];
    this.#_allRounds = [this.#_currentRound];
  }

  #createRound(players) {
    let numberOfPlayers = players.length;
    while (numberOfPlayers % 2 != 0)
      numberOfPlayers++;
    const playerIndices = [...Array(players.length).keys()];
    const round = {
      numberOfPlayers,
      matches: []
    }
    playerIndices.sort(() => Math.random() - 0.5);
    while (numberOfPlayers > 0) {
      const playerA = playerIndices.length > 0 ? players[playerIndices.pop()]: null;
      const playerB = playerIndices.length > 0 ? players[playerIndices.pop()]: null;
      round.matches.push({
        playerA: {
          name: playerA?.nickname ?? "",
          score: "",
          class: "",
        },
        playerB: {
          name: playerB?.nickname ?? "",
          score: "",
          class: ""
        }
      })
      numberOfPlayers -= 2;
    }
    return round;
  }
}

/**
 * Player.
 */
export class Player {

  /** @type {string} */
  nickname;

  /** @type {GameResult[]} */
  records = []

  /** @params {string} nickname */
  constructor({nickname}) {
    this.nickname = nickname;
  }
}

/**
 * GameData.
 */
export class GameData {

  static createLocalGame() {
    return new GameData({
      players: [
        { nickname: generateRandomName() },
        { nickname: generateRandomName() }
      ]
    })
  }

  /** @param {string[]} playerNames */
  static createTournamentGame(playerNames) {
    const players = playerNames.map(nickname => ({
        nickname
    }
    ));
    const game = new GameData({ players });
    game.#gameType = GAME_TYPE.localTournament;
    game.#_tournament = new Tournament({
      players 
    });
    return game;
  }

  /** @type {string} */
  #gameType;

  #_winScore = 3;
  get winScore() {
    return this.#_winScore;
  }

  /** @type {Player[]} */
  #players = [ ];

  /** @type {{
   *   [key: string]: number
   * }}
   */
  positions = {};

  /**
   * @type {{
   *   [key: string]: number
   * }}
   */
  scores = {};

  /** @type {Tournament | null} */
  #_tournament;

  get tournament() {
    return this.#_tournament;
  }

  /**
   * @param {{
   *  players: Player[],
   *  positions?: {
   *    [key: string]: number
   *  } 
   * }} args
   */
  constructor({players, positions = {}}) {
    this.#players = players;
    if (players.length < 2) {
      throw "Not enough players";
    }
    if (players.length == 2) {
      this.#gameType = GAME_TYPE.local1on1
    };
    
    this.#players.forEach(player => {
      this.scores[player.nickname] = 0;
    });
    if (!isEmptyObject(positions))  {
      this.setPositions(players);
    }
    else {
      this.positions = positions;
    }
  }

  /** @param {Player[]} players */
  setPositions(players) {
    players.forEach((p, i) => {
      this.positions[p.nickname] = i;
    })
  }

  /**
   * @param {Player} player
   */
  getScore(player) {
    return this.scores[player.nickname];
  }

  get currentPlayers() {
    if (this.#gameType == GAME_TYPE.local1on1)
      return [...this.#players];
    else if(this.#gameType == GAME_TYPE.localTournament) {
      return this.#_tournament.currentPlayers;
    }
  }
}

