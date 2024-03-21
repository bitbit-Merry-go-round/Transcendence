import View from "@/lib/view";
import Scene from "@/game/game_scene";
import { GameData, Player } from "@/data/game_data";
import ObservableObject from "@/lib/observable_object";
import { GameMap, WALL_TYPES } from "@/data/game_map";

const WIN_SCORE = 3;

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
  /** @type{GameMap} */
  #gameMap;

  constructor({data}) {
    super({data: data.gameData});
    this.#data = data.gameData;
    console.log(this.#data.currentPlayers);
    this.#data.subscribe("scores", 
      ( /**@type {{ [key: string]: number }} */newScores) => {
        for (let nickname in newScores) {
          const player = this.#data.currentPlayers.find(p => p.nickname == nickname);
          const score = newScores[player.nickname];
          /** @type {HTMLElement} */
          const label = this.querySelector(
            `span[data-player=${nickname}]`);
          label.innerText = score.toString();
          if (score == WIN_SCORE) {
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
      gameMap: this.#gameMap
    });
    this.#startButton = this.querySelector("#start-button");
    setTimeout(() => {
      this.#startButton.style.visibility = "visible";  
    }, 3000);
    this.#startButton
      .addEventListener("click", () => {
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
  }

  disConnectedCallback() {
    console.log("disConnectedCallback");
    super.disConnectedCallback();
    this.#scene.prepareDisappear();
  }
}
