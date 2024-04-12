import View from "@/lib/view";
import * as GLOBAL from "@/data/global";
import { NAVIGATE_DRIRECTION, route } from "@/router";
import { generateRandomName } from "@/utils/random_name";
import { getUsername } from "../game/game_view";

export default class TournamentView extends View {

  mapModal = {};
  /** @param{ string[] } nicknames */
  setNickname;
  setMap;
  setSpeed;
  setPowerUp;

  /** @type {{
   * nicknames: boolean,
   * map: boolean,
   * powerUp: boolean,
   * peddleSpeed: boolean
   * }} */ 
  #parameter = {
    nicknames: false,
    map: false,
    powerUp: false,
    peddleSpeed: false
  };

  /** @param {string} name*/ 
  #setParameter(name)  {
    this.#parameter = ({
      ...this.#parameter, //@ts-ignore
      [name]: true
    });
    if (Object.values(this.#parameter).indexOf(false) == -1) {
    }
  }
  constructor({ registerGame }) {
    super();
    const { parameter} = registerGame;
    this.setNickname = /** @param{ string[] } nicknames */(nicknames) => parameter({nicknames})
    this.setMap =  /** @param{ any }  map */
      (map) => parameter({map})

    this.setSpeed = /** @param{ number } speed */
      (speed) => parameter({ speed })
    this.setPowerUp = /** @param{ boolean } powerUp */
      (powerUp) => parameter({ powerUp })
  }

  _setRandomPlayerName() {
    const playerNameElements = this.querySelectorAll('.input-player');
    
    /** @type { HTMLInputElement } */ //@ts-ignore
    const firstInput = playerNameElements[0];
    firstInput.readOnly = true;
    getUsername()
      .then(name =>  {
        if (name)
          firstInput.value = name;
        else  {
          firstInput.readOnly = false;
        firstInput.value = generateRandomName();
        }
      })
      .catch(() => {
        firstInput.value = generateRandomName();
        firstInput.readOnly = false;
      })
    for (let i = 1; i < playerNameElements.length; ++i) {
      /** @type { HTMLInputElement } */ //@ts-ignore
      const input = playerNameElements[i];
      input.value = generateRandomName();
    }
  }

  _playerNameCheck() {
    const playerNameElements = this.querySelectorAll('.input-player');
    const errorMassage = this.querySelector('#error-message');
    const playerNames = Array.from(playerNameElements, (ele) => ele.value).filter(ele => ele !== '');
    const playerNameSet = new Set(playerNames);
    
    if (playerNames.length !== 4) {
      errorMassage.textContent = '빈 문자열은 허용되지 않습니다.';
      return false;
    }
    else if (playerNameSet.size !== 4) {
      errorMassage.textContent = '중복된 이름은 허용되지 않습니다.';
      return false;
    }
    else {
      this.setNickname(playerNames);
      return true;
    }
  }

  _setPaddleModal() {
    const paddleModalBtn = this.querySelector('#confPaddleBtn');
    const paddleModal = this.querySelector('.paddle-wrap');

    paddleModalBtn.addEventListener('click', () => {
      paddleModal.style.display = 'flex'
    })

    paddleModal.querySelector('.btn-close').addEventListener('click', () => {
      paddleModal.style.display = 'none';
    })

    paddleModal.querySelector('.submit').addEventListener('click', () => {
      paddleModal.style.display = 'none';
      this.#setParameter("peddleSpeed");
    })

    paddleModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget)
        paddleModal.style.display = 'none';
    })

    this.querySelector("#paddleSpeed").addEventListener("input", (event) => { //@ts-ignore
      this.setSpeed( Number(event.target.value) )
    })
  }

  _setItemModal() {
    const itemModalBtn = this.querySelector('#confItemBtn');
    const itemModal = this.querySelector('.item-wrap');
    const itemBtns = this.querySelector('.item-btns');

    itemModalBtn.addEventListener('click', () => {
      itemModal.style.display = 'flex'
    })

    itemModal.querySelector('.btn-close').addEventListener('click', () => {
      itemModal.style.display = 'none';
    })

    itemModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget)
        itemModal.style.display = 'none';
    })

    itemBtns.addEventListener('click', () => {
      // TODO: use-item vs disuse-item 선택 적용
      itemModal.style.display = 'none';
    })

    for (const child of Array.from(itemBtns.querySelectorAll("button"))) {
      /** @type { HTMLButtonElement } */ //@ts-ignore
      const button = child;
      const useItem = button.classList.contains("use-item");
      button.addEventListener("click", () => {
        this.setPowerUp(useItem);
        this.#setParameter("powerUp");
      })
    }
  }

  _inputDuplicateCheck() {
    const confirmBtn = this.querySelector('.btn-play');
    confirmBtn.addEventListener('click', (event) => {
      const errorMassage = this.querySelector('#error-message');
      const playerNameElements = this.querySelectorAll('.input-player');
      const valid = this._playerNameCheck();
      if (valid)
        this.#setParameter("nicknames");

      if (valid && Object.values(this.#parameter).indexOf(false) == -1) {
        /** @type { HTMLAnchorElement } */
        const a = this.querySelector("#game-link")
        a.click();
      }
      else
      {
        errorMassage.style.display = 'flex';
        for (const player of playerNameElements)
        {
          player.classList.add(`vibration`);
          setTimeout(() => {
            player.classList.remove("vibration");
            errorMassage.style.display = 'none';
          }, 500);
        }
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    const mapModalBtn = this.querySelector('#confMapBtn');
    const mapModal = this.querySelector("#map-modal");

    mapModalBtn.addEventListener("click", () => {
      mapModal.style.display = "block";
      if (!this.mapModal["allMaps"]) {
        const allCanvas = mapModal.querySelectorAll("canvas");

        this.mapModal["allMaps"] = allCanvas;
        allCanvas.forEach(c => {
          c.addEventListener("click", 
            () => {
              mapModal.style.display = "none";
              this.setMap(c.dataset.map);
              this.#setParameter("map");
            }
          ) 
        })
      }
    })

    this._setRandomPlayerName();
    this._setPaddleModal();
    this._setItemModal();
    this._inputDuplicateCheck();


    const backBtn = document.getElementById('move-to-mode');
    backBtn.addEventListener('click', () => {
      route({
        path: '/mode',
        direction: NAVIGATE_DRIRECTION.backward
      })
    })
  }
}
