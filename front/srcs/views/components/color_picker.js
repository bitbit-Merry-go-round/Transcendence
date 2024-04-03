import * as THREE from "three";
import View from "@/lib/view";
import { hsb2rgb } from "@/utils/color_util";
import Observable from "@/lib/observable";

const DEFAULT_SIZE = {
  width: 200,
  height: 200,
};


export default class ColorPicker extends View {

  /** @type {{
   *  vertex: string,
   *  fragment: string
   * }} */ //@ts-ignore
  static #shader = {};
  /** @type {Promise<boolean>} */
  static #shaderLoaded;
  /** @type {{ width: number, height: number }} */
  #size;
  /** @type {HTMLDivElement} */
  #container;
  /** @type {HTMLCanvasElement} */
  #picker;
  #material;
  #renderer;
  #pickedColor;
  #onPickColor;

  /** @param {{ 
   *   color?: Observable,
   *   onPickColor: 
   *   (color: {r: number, g: number, b: number}) => void,
   *   size?: {
   *    width: number,
   *    height:number
   *   },
   *   }} params */
  constructor({color= null, onPickColor, size = DEFAULT_SIZE}) {
    super();
    if (!ColorPicker.#shaderLoaded)
      ColorPicker.#loadShaders();
    if (color) {
      this.#pickedColor = color;
    }
    else {
      this.#pickedColor = new Observable({
        r: 255,
        g: 255,
        b: 255
      });
    }
    this.#onPickColor = onPickColor;
    this.#size = size ?? DEFAULT_SIZE;
    this.#pickedColor.subscribe(color => {
      this.#onColorChange(color)
    })
  }

  connectedCallback() {
    super.connectedCallback();
    /** @type {HTMLElement} */
    this.#container = this.querySelector("#picker-container");
    this.#container.style.width = this.#size.width + "px";
    this.#container.style.height= this.#size.height + "px";

    this.#drawColors()
      .then(() => {
        this.#addEventListener();
        const color = this.#pickedColor.value;
        this.#picker.style.borderColor = 
          `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
      });
  }

  static #loadShaders() {
    const vertex = fetch("srcs/shader/color_picker_v.glsl")
      .then(res => res.text())
      .then(text => {
        ColorPicker.#shader.vertex = text;
        return true;
      });
    const frag = fetch("srcs/shader/color_picker_f.glsl")
      .then(res => res.text())
      .then(text => {
        this.#shader.fragment = text;
        return true;
      });
    this.#shaderLoaded = Promise
      .all([vertex, frag])
      .then(res => res.indexOf(false) == -1);  
  }

  async #drawColors() {
    const isLoaded = await ColorPicker.#shaderLoaded;
    if (!isLoaded) {
      console.error("shader not loaded");
      return ;
    }
    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    geometry.setAttribute
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;
    const vertexShader = ColorPicker.#shader.vertex;
    const fragmentShader = ColorPicker.#shader.fragment;
    const u_resolution = new THREE.Vector2(
      this.#size.width,
      this.#size.height
    );
    this.#material = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: { value: u_resolution },
      },
      vertexShader,
      fragmentShader
    });
    this.#material.needsUpdate = true;
    const mesh = new THREE.Mesh(geometry, this.#material);
    const scene = new THREE.Scene();
    scene.add(mesh);
    this.#renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false
    });
    this.#renderer.setPixelRatio( window.devicePixelRatio );
    this.#renderer.setSize(this.#size.width, 
      this.#size.height);
    this.#picker = this.#renderer.domElement;
    this.#picker.id = "picker";
    this.#container.appendChild(this.#picker);
    this.#renderer.render(scene, camera);
  }

  #addEventListener() {
    this.#container.addEventListener("click", 
      event => {
        this.#pickColor(event.offsetX + 4, event.offsetY + 4);
      })
    //this.#picker.addEventListener("mousemove", 
    //  event => {
    //    console.log("mousemove", event.clientX, event.clientY);
    //  })
  }

  /** @param {number} pointX 
   *  @param {number} pointY
   */
  #pickColor(pointX, pointY) {
    const normalized = {
      x: pointX / this.#size.width,
      y: (this.#size.height - pointY) / this.#size.height
    };
    const toCenter = {
      x: normalized.x - 0.5,
      y: normalized.y - 0.5
    };
    let angle = Math.atan2(toCenter.y, toCenter.x);
    let radius = Math.sqrt(toCenter.x * toCenter.x + toCenter.y * toCenter.y) * 3.5;
    radius = Math.max(0.9, radius);
    if (angle < 0) {
      angle += Math.PI * 2.0;
    }
    const color = hsb2rgb(
      new THREE.Vector3(
        angle/(Math.PI * 2.0), 
        radius,
        1.0
      ));
    color.multiplyScalar(255);
    this.#pickedColor.value = {
      r: color.x,
      g: color.y,
      b: color.z
    };
  }

  #onColorChange(color) {
    this.#picker.style.borderColor = 
      `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
    if (this.#onPickColor) {
      this.#onPickColor(color);
    }
  }
}
