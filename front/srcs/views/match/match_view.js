import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";
import * as GLOBAL from "@/data/global";

export default class MatchView extends View {


  mapModal = {};

  setNickname;
  setMap;
  setSpeed;
  setPowerUp;

  constructor({data, registerGame}) {
    super();
    this.data = data
    const { parameter } = registerGame;
    this.setNickname = /** @param{ string[] } nicknames */
      (nicknames) => parameter({nicknames})
    this.setMap =  /** @param{ any }  map */
      (map) => parameter({map})
    this.setSpeed = /** @param{ number } speed */
      (speed) => parameter({ speed })
    this.setPowerUp = /** @param{ boolean } powerUp */
      (powerUp) => parameter({ powerUp })
  }

  _initUserCard(data) {
    const userAvatar = this.querySelector('.match-player-card .user-avatar-match');
    const userLevelId = this.querySelector('.match-player-card .user-level-id');
    const userScore = this.querySelector('.match-player-card .score');
    const stateMessage = this.querySelector('.match-player-card .state-message');

    userLevelId.textContent = `Lv.${data.level} ${data.username}`
    userAvatar.src = `data:image;base64,${data.avatar}`;
    userScore.textContent = `${data.wins} 승 ${data.loses} 패`;
    stateMessage.textContent = `${data.message}`;
  }

  async _fetchUserInfo() {
    const url = `http://${window.location.hostname}:8000/users/me/profile`;

    await httpRequest('GET', url, null, this._initUserCard.bind(this));
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
      // TODO: use-item vs disuse-item
      itemModal.style.display = 'none';
    })
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
  
    this._fetchUserInfo();
    this._setPaddleModal();
    this._setItemModal();
  }
}
