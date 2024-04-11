import View from "@/lib/view";
import * as GLOBAL from "@/data/global";
import { route } from "@/router";
export default class TournamentView extends View {

  /** @param{ string[] } nicknames */
  setNickname;
  setMap;
  setSpeed;
  setPowerUp;

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
    
    // TODO: 랜덤 이름 적용
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
      // TODO: submit paddle speed
      paddleModal.style.display = 'none';
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
  }

  _inputDuplicateCheck() {
    const confirmBtn = this.querySelector('.btn-play');
    confirmBtn.addEventListener('click', (event) => {
      const errorMassage = this.querySelector('#error-message');
      const playerNameElements = this.querySelectorAll('.input-player');
      const valid = this._playerNameCheck();
      if (valid) {
        // TODO: 이름 체크 성공 시 game으로 이동
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
            () => this.setMap(c.dataset.map)
          ) 
        })
      }
    })
  
    this._setRandomPlayerName();
    this._setPaddleModal();
    this._setItemModal();
    this._inputDuplicateCheck();
  }
}
