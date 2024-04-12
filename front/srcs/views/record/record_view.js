import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

export default class RecordView extends View {
  constructor({ data }) {
    super();
    this.data = data;
  }

  async #fetchAndRenderPvpResults() {
    const url = "http://127.0.0.1:8000/game/me/1v1s/";

    httpRequest("GET", url, null, (res) => {
      const pvpLists = document.getElementById("pvp-lists");
      const pvpListTemplate = document.getElementById("pvp-list-template");

      res.forEach((res, index) => {
        const documentFragment = document.importNode(
          pvpListTemplate.content,
          true
        );
        const pvpListElement = documentFragment.querySelector("li");
        const detail = pvpListElement.querySelector(".score-detail");
        const date = pvpListElement.querySelector(".score-date");

        detail.textContent = `${res.player_one_score}:${res.player_two_score}`;
        date.textContent = `${res.time}`;
        pvpLists.appendChild(pvpListElement);
      })
      }, (res) => {
        console.error("can't fetch record data: ", res.status);
      });
    }

  #modalEventSet() {
    var moreInfoBtn = document.getElementById("infoBtn");
    // "more info" 버튼을 클릭할 때 모달 창을 보이게 합니다.
    moreInfoBtn.addEventListener("click", function () {
      modal.style.display = "block"; //모달 창을 보이게 설정
    });
    // 모달 창을 가져옵니다.
    var modal = document.getElementById("infoModal");
    // 모달 창의 닫기 버튼을 가져옵니다.
    var closeModalBtn = document.getElementsByClassName("close")[0];
    // 모달 창의 닫기 버튼을 클릭할 때 모달 창을 숨깁니다.
    closeModalBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
    window.addEventListener("click", function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    });
  }
  
  async #fetchAndRenderTournamentResults() {
    const url = 'http://127.0.0.1:8000/game/me/tournaments/';

    httpRequest("GET", url, null, (res) => {
      // 토너먼트 결과를 렌더링할 요소 선택
      const tournamentList = document.getElementById('tournament-list');
      const tournamentTemplate = document.getElementById('tournament-template');
      res.forEach((tournament, index) => {
        const documentFragment = document.importNode(tournamentTemplate.content, true);
        const tournamentElement = documentFragment.querySelector('li');
        const winner = tournamentElement.querySelector('.tournament-winner');
        const time = tournamentElement.querySelector('.tournament-time');
    
        winner.textContent = `${tournament.winner}`;
        time.textContent = `${tournament.time}`;
    
        tournamentList.appendChild(tournamentElement);
      });
    }, (res) => {
      console.error('Error fetching and rendering tournament results:', res.status);
    })
  }

  #fetchProfileInfo() {
    const url = `http://127.0.0.1:8000/users/me/profile`;

    httpRequest("GET", url, null, this.#initProfileData.bind(this), (res) => {
      console.log('Error fetching Profile data: ', res.status);
    });
  }

  // 서버에서 가져온 프로필 정보로 모달 업데이트
  #initProfileData(data) {
    const profileCardRecord = this.querySelector('.profile-card-record');
    const userAvatar = profileCardRecord.querySelector(".user-avatar");
    const userLevelId = profileCardRecord.querySelector(".user-level");
    const userScore = profileCardRecord.querySelector(".score");
    const stateMessage = profileCardRecord.querySelector(".state-message");

    userLevelId.textContent = `Lv.${data.level} ${data.username}`;
    userAvatar.src = `data:image;base64,${data.avatar}`;
    userScore.textContent = `${data.wins} 승 ${data.loses} 패`;
    stateMessage.textContent = `${data.message}`;
  }

  connectedCallback() {
    super.connectedCallback();

    this.#modalEventSet();
    this.#fetchAndRenderPvpResults();
    this.#fetchAndRenderTournamentResults();
    this.#fetchProfileInfo();
  }
}

