import View from "@/lib/view";
import Scene from "@/game/game_scene";
import { GameData, GAME_TYPE, Player } from "@/data/game_data";
import ObservableObject from "@/lib/observable_object";
import { GameMap, WALL_TYPES } from "@/data/game_map";
import TournamentPanel from "../components/tournament_panel";

export default class GameView extends View {

  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {Scene} */
  #scene;
  /** @type {ObservableObject} */
  #data;
  /** @type {GameData} */
  #gameData;
  #isPaused = true;
  /** @type {HTMLButtonElement} */
  #startButton;
  /** @type {HTMLButtonElement} */
  #resetButton;
  /** @type{GameMap} */
  #gameMap;
  /** @type {TournamentPanel} */
  #tournamentPanel;

  constructor({data}) {
    super({data: data.gameData});
    this.#data = data.gameData;
    //@ts-ignore
    this.#gameData = data.gameData;
    this.#data.subscribe("scores", 
      ( /**@type {{ [key: string]: number }} */newScores) => {
        /** @type {GameData} */
        for (let player of this.#gameData.currentPlayers) {
          const score = newScores[player.nickname];
          /** @type {HTMLSpanElement} */
          const label = this.querySelector(
          `span[data-player=${player.nickname}]`);
          label.innerText = score.toString();
          if (score == this.#gameData.winScore) {
            this.#scene.endGame();
            switch (this.#gameData.gameType) {
                case GAME_TYPE.local1on1:
                  // TODO: go to next view
                return;
              case GAME_TYPE.localTournament:
                const tournament = this.#gameData.tournament;
                if (!tournament.isLastRound)
                  tournament.goToNextMatch(); 
                else {
                  return ;
                }
                // TODO: next match button?
                setTimeout(() => this.#playNextMatch(), 5000)
            }
          }
        }
        this.#isPaused = true;
        this.#startButton.style.visibility = "visible";
    })
    this.#gameMap = new GameMap({
      safeWalls: [],
      trapWalls: [],
    });
    this.#gameMap.addBorderWalls();
    this.#gameMap.addWalls([
      {
        width: 40,
        height: 2,
        centerX: 20,
        centerY: 30
      },
      {
        width: 40,
        height: 2,
        centerX: 80,
        centerY: 70
      }
    ], WALL_TYPES.safe);
  }

  connectedCallback() {
    super.connectedCallback();
    this.#canvas = this.querySelector(".game_canvas")
    const container = this.#canvas.parentElement;
    this.#canvas.width = container.offsetWidth
    this.#canvas.height = container.offsetHeight;
    this.#scene = new Scene({
      canvas: this.#canvas,
      gameData: this.#data,
      gameMap: this.#gameMap,
      stuckHandler: (isStuck) => {
        this.#resetButton.style.visibility = isStuck ? "visible": "hidden";
        this.#resetButton.disabled = !isStuck;
      }
    });
    this.#startButton = this.querySelector("#start-button");
    setTimeout(() => {
      this.#startButton.style.visibility = "visible";  
    }, 3000);
    this.#startButton
      .addEventListener("click", () => {
        this.#scene.changePlayer([
          new Player({nickname: "hello"}),
          new Player({nickname: "bart"}),
        ])

      if (this.#isPaused) {
        this.#scene.startGame();
        this.#isPaused = false;
        this.#startButton.style.visibility = "hidden";
      }
    })
    window.addEventListener("keypress", event => {
      if (event.key == "Enter" && this.#isPaused) {
        this.#scene.startGame();
        this.#isPaused = false;
        this.#startButton.style.visibility = "hidden";
      }
    }) 
    this.#resetButton = this.querySelector("#reset-button");
    this.#resetButton.addEventListener("click", () => {
      this.#scene.resetBall();
      this.#resetButton.style.visibility = "hidden";
        this.#resetButton.disabled = true;
    }) 

    /** @type {GameData} */ //@ts-ignore
    if (this.#gameData.gameType == GAME_TYPE.localTournament) {
      this.#showTournamentBoard();
    }
  }

  #showNextMatch() {
    /** @type {GameData} */ //@ts-ignore
    const nextPlayers = this.#gameData.currentPlayers;
    /** @type {NodeListOf<HTMLSpanElement>}*/
    const labels = this.querySelectorAll(".player-nickname");
    labels[0].innerText = nextPlayers[0].nickname;
    labels[1].innerText = nextPlayers[1].nickname;
    /** @type {NodeListOf<HTMLSpanElement>}*/
    const scoresLabels = this.querySelectorAll(".score-placeholder");
    scoresLabels[0].innerText = "0";
    scoresLabels[0].dataset["player"] = nextPlayers[0].nickname;
    scoresLabels[1].innerText = "0";
    scoresLabels[1].dataset["player"] = nextPlayers[1].nickname;
  }

  async #showTournamentBoard() {
    const panel = new TournamentPanel({
      data:this.#data,
      onUpdated : () => this.#updatedTournamentBoard(panel)
    });
    
    panel.defaultBoardStyle = {
      display: "block",
      width:  "1200px",
      height: "800px",
    };
    await panel.render();
    this.#tournamentPanel = panel;
    /** @type {HTMLElement} */ //@ts-ignore
    const board = panel.children[0];
    this.#scene.createBoard(board);
  }
  disconnectedCallback() {
    this.#scene.prepareDisappear();
    super.disconnectedCallback();
  }

  async #updatedTournamentBoard(panel) {
    /** @type {HTMLElement} */ //@ts-ignore
    const board = panel.children[0];
    this.#scene.updateBoard(board);
  }

  #playNextMatch() {
    this.#scene.moveCameraToGamePosition(() => {
      this.#showNextMatch();
      this.#scene.changePlayer(this.#gameData.currentPlayers);
    })
  }
}
