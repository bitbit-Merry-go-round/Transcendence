import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

export default class NavBar extends View {
  
  constructor() {
    super();
  }

  _modalToggler() {
    const profileCardModalBtn = this.querySelector('#profileCardModalBtn');
    const profileCardModal = this.querySelector('#profileCardModal');
    const modalCloseBtn = this.querySelector('.btn-close');
    const editBtn = profileCardModal.querySelector('.btn-to-edit');
    profileCardModalBtn.addEventListener('click', () => {
      editBtn.textContent = '정보변경';
      editBtn.href = '/edit';
      editBtn.setAttribute('data-link', '');
      profileCardModal.style.display = 'flex';
    });
    modalCloseBtn.addEventListener('click', () => {
      profileCardModal.style.display = 'none';
    });
    profileCardModal.addEventListener('click', e => {
      if (e.target === e.currentTarget)
        profileCardModal.style.display = 'none';
    });
  }

  _initModalData (data) {
    const userAvatar = this.querySelector('.user-avatar');
    const userLevelId = this.querySelector('.user-level-id');
    const userScore = this.querySelector('.score');
    const stateMessage = this.querySelector('.state-message');
    if (!userLevelId)
    {
      // 왜 this 아래 아무것도 없는지 의아.
      return;
    }
    userLevelId.textContent = `Lv.${data.level} ${data.uid}`
    userAvatar.src = `data:image;base64,${data.avatar}`;
    userScore.textContent = `${data.wins} 승 ${data.loses} 패`;
    stateMessage.textContent = `${data.message}`;
  }

  _initNavbarData(data) {
    const userLevelId = this.querySelector('.user-level-id');
    const userImg = this.querySelector('#profileCardModalBtn');
    if (!userLevelId)
    {
      // 왜 this 아래 아무것도 없는지 의아.
      return;
    }
    userLevelId.textContent = `Lv.${data.level} ${data.uid}`;
    userImg.src = `data:image;base64,${data.avatar}`;
    this._initModalData(data);
  }

  async _fetchInfo() {
    const user = 'jeseo'; 
    const url = `http://${window.location.hostname}:8000/users/${user}/profile`;

    await httpRequest('GET', url, null, this._initNavbarData.bind(this));
  }
    
  connectedCallback() {
    super.connectedCallback();
    
    this._fetchInfo();
    // 가능하다면, 한 번 받아온 데이터를 두 군데서 초기화해줄 수 있도록 처리하기.
    this._modalToggler();    
  }
}
