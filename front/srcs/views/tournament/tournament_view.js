import View from "@/lib/view";
export default class TournamentView extends View {
  constructor() {
    super();
  }
  _playerNameCheck() {
    const playerNameElements = this.querySelectorAll('.input-player');
    const playerNames = Array.from(playerNameElements, (ele) => ele.value).filter(ele => ele !== '');
    const playerNameSet = new Set(playerNames);
    console.log(playerNames.length, playerNameSet.size);
    if (playerNames.length !== playerNameSet.size)
      return false;
    else
      return true;
  }
  connectedCallback() {
    super.connectedCallback();
    const confirmBtn = this.querySelector('.btn-tournament');
    confirmBtn.addEventListener('click', (event) => {
      const errorPassage = this.querySelector('#multiple-error');
      const playerNameElements = this.querySelectorAll('.input-player');
      const valid = this._playerNameCheck();
      if (valid)
        this.querySelector('#move-to-game').click();
      else
      {
        errorPassage.style.display = 'flex';
        for (const player of playerNameElements)
        {
          player.classList.add(`vibration`);
          setTimeout(() => {
            player.classList.remove("vibration");
            errorPassage.style.display = 'none';
          }, 500);
        }
      }
    });
  }
}