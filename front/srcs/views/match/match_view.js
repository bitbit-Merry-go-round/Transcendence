import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";
import MapSelector from "@/views/components/map_selector.js";

export default class MatchView extends View {


  mapModal = {};

  constructor({data}) {
    super();
    this.data = data
  }

  selectMap(map) {
    console.log("select", map);
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
  connectedCallback() {
    super.connectedCallback();
    const mapModalBtn = this.querySelector('#confMapBtn');
    const mapModal = this.querySelector("#map-modal");
    const paddleModalBtn = this.querySelector('#confPaddleBtn');
    const paddleModal = this.querySelector('.paddle-wrap');

    mapModalBtn.addEventListener("click", () => {
      mapModal.style.display = "block";
      if (!this.mapModal["allMaps"]) {
        const allCanvas = mapModal.querySelectorAll("canvas");

        this.mapModal["allMaps"] = allCanvas;
        allCanvas.forEach(c => {
          c.addEventListener("click", (e) => {
            this.selectMap(c.dataset.map);
          }) 
        })
      }
    })
    paddleModalBtn.addEventListener('click', () => {
      paddleModal.style.display = 'flex'
    })

    paddleModal.querySelector('.btn-close').addEventListener('click', () => {
      paddleModal.style.display = 'none';
    })

    paddleModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget)
        paddleModal.style.display = 'none';
    })
  
      this._fetchUserInfo();
  }
}
