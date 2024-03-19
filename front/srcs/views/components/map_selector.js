import View from "@/lib/view";
import MapImageGenarator from "@/game/mapImageGenerator";
import { GameMap } from "@/data/game_map";
import { ASSETS } from "@/game/game_scene";

const examples = [1, 2, 3, 4].map(i => ({
  textureName: "brick",
  map: new GameMap({
    safeWalls: [
      {
        centerX: 10 * i + 10,
        centerY: 30,
        width: 30,
        height: 5
      },
      {
        centerX: 10 * i + 20,
        centerY: 50,
        width: 5,
        height: 20
      },
      {
        centerX: 80,
        centerY: 10 * i + 25,
        width: 10,
        height: 40
      }
    ],
    trapWalls: [
        
    ]
  })})
)
examples.forEach(({map}) => map.addBorderWalls());

export default class MapSelector extends View {

  /** @type HTMLElement */
  #container;
  /** @type HTMLElement */
  #background;
  canvasSize = {
    width: 256,
    height: 256
  };

  constructor(params) {
    super();
  }

  hide() {
    const parent = this.parentNode;
    if (parent) {
      parent.style.display = "none";
    }
    else {
      this.#background.style.visibility = "hidden";
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.#container = this.querySelector("#map-selector-container");
    this.#background = this.querySelector("#map-selector-background");

    this.querySelector("#map-selector-close-button")
    .addEventListener("click", () => this.hide());
    this.#drawMaps();
  }

  async #drawMaps() {
    const mapGenerator = new MapImageGenarator({
      size: this.canvasSize
    });
    const textureName = "brick";
    await mapGenerator.loadTexture([{
      name: textureName,
      path: ASSETS.getColorTexture(textureName)  
    }]);
    for (let {map, textureName} of examples) {
      const image = mapGenerator.generate({map, textureName});
      const canvas = document.createElement("canvas");
      canvas.dataset.map = JSON.stringify(map.allWalls); 
      canvas.classList.add("map-preview");
      const ctx = canvas.getContext("bitmaprenderer");
      ctx.transferFromImageBitmap(image);
      this.#container.append(canvas); 
      image.close();
    }
  }

  showMap(map) {
  }
  
  disConnectedCallback() {
    super.disConnectedCallback();
  }
}
