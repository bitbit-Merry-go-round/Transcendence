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
  #isPaused = true;
  /** @type {HTMLElement} */
  #startButton;
  /** @type {HTMLElement} */
  #resetButton;
  /** @type{GameMap} */
  #gameMap;

  constructor({data}) {
    super({data: data.gameData});
    this.#data = data.gameData;
    this.#data.subscribe("scores", 
      ( /**@type {{ [key: string]: number }} */newScores) => {
        for (let player of this.#data.currentPlayers) {
          const score = newScores[player.nickname];
          
          const label = this.querySelector(
            `span[data-player=${player.nickname}]`);
          label.innerText = score.toString();
          if (score == this.#data.winScore) {
            this.#scene.endGame();
            return;
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

    if (this.#data.gameType == GAME_TYPE.localTournament) {
      this.#showTournamentBoard();
    }
  }

  async #showTournamentBoard() {
    const panel = new TournamentPanel({data:this.#data});
    await panel.render();
    this.appendChild(panel);    
    /** @type {HTMLElement} */ //@ts-ignore
    const board = panel.children[0];
    board.style.display = "block";
    board.style.width = "1200px";
    board.style.height = "800px";
    this.#scene.createBoard(board);
  }
  disconnectedCallback() {
    this.#scene.prepareDisappear();
    super.disconnectedCallback();
  }
}
