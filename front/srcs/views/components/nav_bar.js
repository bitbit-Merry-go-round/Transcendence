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
    const profileCardModal = this.querySelector('#profileCardModal');
    const userAvatar = profileCardModal.querySelector('.user-avatar');
    const userLevelId = profileCardModal.querySelector('.user-level-id');
    const userScore = profileCardModal.querySelector('.score');
    const stateMessage = profileCardModal.querySelector('.state-message');
    if (!userLevelId)
    {
      // 왜 this 아래 아무것도 없는지 의아.
      return;
    }
    userLevelId.textContent = `Lv.${data.level} ${data.username}`
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
    userLevelId.textContent = `Lv.${data.level} ${data.username}`;
    userImg.src = `data:image;base64,${data.avatar}`;
    this._initModalData(data);
  }

  async _fetchInfo() {
    const url = `http://${window.location.hostname}:8000/users/me/profile`;

    await httpRequest('GET', url, null, this._initNavbarData.bind(this));
  }
    
  _logoutEvent() {
    const logoutBtn = this.querySelector('#logout');
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
    })
  }

  connectedCallback() {
    super.connectedCallback();
    
    this._fetchInfo();
    this._logoutEvent();
    this._modalToggler();    
  }
}
