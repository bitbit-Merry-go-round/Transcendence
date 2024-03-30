import View from "@/lib/view";

const DEFAULT_SIZE = {
  width: 200,
  height: 200,
};


export default class ColorPicker extends View {

  /** @type {HTMLCanvasElement} */
  #canvas;
  /** @type {{ width: number, height: number }} */
  #size;

  constructor(param) {
    super();
    this.#size = param?.size ?? DEFAULT_SIZE;
  }

  connectedCallback() {
    super.connectedCallback();

    /** @type {HTMLElement} */
    const container = this.querySelector("#picker-container");
    container.style.width = this.#size.width + "px";
    container.style.height= this.#size.height+ "px";

    this.#canvas = this.querySelector("#picker-canvas");
    this.#canvas.width = this.#size.width;
    this.#canvas.height= this.#size.height;
  }

  #drawColors() {

  }
}
