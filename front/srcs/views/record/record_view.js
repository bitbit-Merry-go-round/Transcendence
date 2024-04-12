import globalData from "@/data/global";
import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

export default class RecordView extends View {

  #username = null;

  constructor({ data }) {
    super();
    this.data = data;
  }

  async #fetchAndRenderPvpResults() {
    /** @type { string | URL } */
    let url = window.location.href.replace(":8080", ":8000");
    if (this.#username) {
      url = new URL(`/game/${this.#username}/1v1s/`, url);
    }
    else {
      url = "http://127.0.0.1:8000/game/me/1v1s/";
    }

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
        console.error("can't fetch record data: ", res);
      });
    }

  #fetchTournamentDetail(res) {
    const tournamentDetailGroup = document.getElementById('tournament-detail-list');
    const tournamentDetails = tournamentDetailGroup.querySelectorAll('li');
    let winner;

    if (res.game_three.player_one_score > res.game_three.player_two_score)
      winner = res.game_three.player_one;
    else
      winner = res.game_three.player_two;
    this.querySelector('.tournament-winner').textContent = `👑 ${winner}`;
    let data;
    for (let i = 0; i < 3; i++)
    {
      if (i == 0)
        data = res.game_one;
      else if (i == 1)
        data = res.game_two;
      else
        data = res.game_three;
      tournamentDetails[i].querySelector('.tournament-play').textContent = `${data.player_one} VS ${data.player_two}`;
      tournamentDetails[i].querySelector('.score-detail').textContent = `${data.player_one_score}:${data.player_two_score}`;
      tournamentDetails[i].querySelector('.second-score-date').textContent = `${data.time}`;
    }
    
  }

  #modalEventSet(moreInfoBtn) {

    moreInfoBtn.addEventListener("click", async (e) => {
      const tournamentId = e.target.closest('li').getAttribute('data-game-id');
      const url =  `http://127.0.0.1:8000/game/tournaments/${tournamentId}/`
      await httpRequest("GET", url, null, this.#fetchTournamentDetail.bind(this), (url, res) => {
        console.error(`can't fetch record data: `, res);
      })
      modal.style.display = "block"; //모달 창을 보이게 설정
    });
    // 모달 창을 가져옵니다.
    const modal = document.getElementById("infoModal");
    // 모달 창의 닫기 버튼을 가져옵니다.
    const closeModalBtn = document.getElementsByClassName("close")[0];
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
    /** @type { string | URL } */
    let url = window.location.href.replace(":8080", ":8000");
    if (this.#username) {
      url = new URL(`/game/${this.#username}/tournaments/`, url);
    }
    else {
    url = 'http://127.0.0.1:8000/game/me/tournaments/';
    }

    httpRequest("GET", url, null, (res) => {
      // 토너먼트 결과를 렌더링할 요소 선택
      const tournamentGroup = document.getElementById('tournament-group');
      const tournamentTemplate = document.getElementById('tournament-list-template');
      res.forEach((tournament, index) => {
        const documentFragment = document.importNode(tournamentTemplate.content, true);
        const tournamentElement = documentFragment.querySelector('li');
        const winner = tournamentElement.querySelector('.score-detail');
        const time = tournamentElement.querySelector('.tournament-time');
        const moreInfoBtn = tournamentElement.querySelector('#infoBtn');
    
        this.#modalEventSet(moreInfoBtn);
        winner.textContent = `${tournament.winner}`;
        time.textContent = `${tournament.time}`;
        tournamentElement.setAttribute('data-game-id', `${tournament.id}`);
        tournamentGroup.appendChild(tournamentElement);
      });
    }, (url, res) => {
      console.error('Error fetching and rendering tournament results:', url, res);
    })
  }

  #fetchProfileInfo() {
    /** @type { string | URL } */
    let url = window.location.href.replace(":8080", ":8000");
    if (this.#username) {
      url = new URL(`/users/${this.#username}/profile/`, url);
    }
    else {
      url = `http://127.0.0.1:8000/users/me/profile/`;
    }

    httpRequest("GET", url, null, this.#initProfileData.bind(this), (res) => {
      console.log('Error fetching Profile data: ', res);
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
    this.#username = globalData.record.getUsername();
    
    this.#fetchProfileInfo();
    this.#fetchAndRenderPvpResults();
    this.#fetchAndRenderTournamentResults();
  }
}

