import View from "@/lib/view";

export default class NavBar extends View {
  
  constructor() {
    super();
    // 컴포넌트 안에서 fetch 해온 데이터를 사용할 수 있게 하기.    
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

  async _fetchInfo() {
    const user = 'jeseo'; 
    
    await fetch(`http://${window.location.hostname}:8000/users/${user}/profile`, {
      mode: "cors",
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        const userName = this.querySelector('p');
        const userImg = this.querySelector('#profileCardModalBtn');
    
        userName.textContent = `Lv.${res.level} ${res.uid}`;
        userImg.src = `data:image;base64,${res.avatar}`;
      });
  }
    
  async _setProfileCard() {
    const user = 'jeseo';
    await fetch(`http://${window.location.hostname}:8000/users/${user}/profile`, {
      mode: "cors",
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        const userAvatar = this.querySelector('.user-avatar');
        const userLevel = this.querySelector('.user-level');
        const userName = this.querySelector('.user-name');
        const userScore = this.querySelector('.score');
        const stateMessage = this.querySelector('.state-message');
        userLevel.textContent = `Lv.${res.level}`;
        userName.textContent = `${res.uid}`
        userAvatar.src = `data:image;base64,${res.avatar}`;
        userScore.textContent = `${res.wins} 승 ${res.loses} 패`;
        stateMessage.textContent = `${res.message}`;
      });
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this._fetchInfo();
    // 가능하다면, 한 번 받아온 데이터를 두 군데서 초기화해줄 수 있도록 처리하기.
    this._modalToggler();
    this._setProfileCard();
    
  }
}
