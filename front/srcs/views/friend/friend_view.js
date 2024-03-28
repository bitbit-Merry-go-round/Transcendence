import View from "@/lib/view";

export default class FriendView extends View {

  constructor({data}) {
    super();
    this.data = data
  }

  async _fetchFriendList() {
    const friendGroup = this.querySelector('ul');
    const user = 'jeseo';
    const url = `http://${window.location.hostname}:8000/users/${user}/friends/`;
    
    await fetch(url)
    .then(res => res.json())
    .then(res => {
      if (res.length === 0)
      {
        friendGroup.classList.add('justify-content-center', 'align-items-center');
        friendGroup.textContent = "친구를 검색하여 추가해보세요🌱";
        return ;
      }
      else
      {
        for (const friend of res) {
          const friendElement = friendGroup.firstChild.cloneNode(true);
          friendElement.querySelector('img').src = `data:image;base64,${friend.avatar}`;
          if (friend.status === 'OF')
          {
            friendElement.querySelector('.status-circle-sm').classList.add('status-offline');
          }
          friendElement.querySelector('.user-level').textContent = `Lv.${friend.level}`;
          friendElement.querySelector('.user-name').textContent = `${friend.uid}`;
          friendElement.setAttribute('data-user', `${friend.uid}`);
          friendGroup.appendChild(friendElement);
        }
        friendGroup.removeChild(friendGroup.firstChild);
      }
    });
  }  
  
  async _deleteBtnHandler(user, event) {
    const me = 'jeseo';
    fetch(`http://${window.location.hostname}:8000/users/${me}/friends/${user}`, {
      method: 'DELETE',
    });
  }

  _friendModalClose(handler) {
    const profileCardModal = this.querySelector('#profileCardModal');
    const modalCloseBtn = this.querySelector('.btn-close');
    const friendDeleteBtn = profileCardModal.querySelector('.btn-to-edit');
    modalCloseBtn.addEventListener('click', () => {
      profileCardModal.style.display = 'none';
      friendDeleteBtn.removeEventListener('click', handler);
    });
    profileCardModal.addEventListener('click', e => {
      if (e.target === e.currentTarget)
      {
        profileCardModal.style.display = 'none';
        friendDeleteBtn.removeEventListener('click', handler);
      }
    });
  }

  async _modalEventHandler(e) {
    if (e.target === e.currentTarget)
      return ;
    const clickedList = e.target.closest('li');
    const user = clickedList.getAttribute('data-user');
    const profileCardModal = document.getElementById('profileCardModal');
    const _deleteBtnHandler = this._deleteBtnHandler.bind(this, user);
    
    await fetch(`http://${window.location.hostname}:8000/users/${user}/profile`, {
      mode: "cors",
      credentials: "include"
    })
      .then(res => res.json())
      .then(res => {
        const userAvatar = profileCardModal.querySelector('.user-avatar');
        const userLevel = profileCardModal.querySelector('.user-level');
        const userName = profileCardModal.querySelector('.user-name');
        const userScore = profileCardModal.querySelector('.score');
        const stateMessage = profileCardModal.querySelector('.state-message');
        const addFriendBtn = profileCardModal.querySelector('.btn-add-friend');
        userLevel.textContent = `Lv.${res.level}`;
        userName.textContent = `${res.uid}`
        userAvatar.src = `data:image;base64,${res.avatar}`;
        userScore.textContent = `${res.wins} 승 ${res.loses} 패`;
        stateMessage.textContent = `${res.message}`;
        
        addFriendBtn.classList.add('btn-del-friend');
        addFriendBtn.textContent = '친구삭제';
        addFriendBtn.href = '';

        addFriendBtn.addEventListener('click', _deleteBtnHandler);
        profileCardModal.style.display = 'flex';
    });
    this._friendModalClose(_deleteBtnHandler);
  }

  _friendModalToggler() {
    const friendGroup = this.querySelector('ul');
    friendGroup.addEventListener('click', this._modalEventHandler.bind(this));
  }

  _bindProfileCardWithUser() {
    const profileCardModalBtn = document.getElementById('profileCardModalBtn');
    const profileCardModal = document.getElementById('profileCardModal');
    const user = 'jeseo';

    profileCardModalBtn.addEventListener('click', async () => {
      await fetch(`http://${window.location.hostname}:8000/users/${user}/profile`, {
        mode: "cors",
        credentials: "include"
      })
      .then(res => res.json())
      .then(res => {
        const userAvatar = profileCardModal.querySelector('.user-avatar');
        const userLevel = profileCardModal.querySelector('.user-level');
        const userName = profileCardModal.querySelector('.user-name');
        const userScore = profileCardModal.querySelector('.score');
        const stateMessage = profileCardModal.querySelector('.state-message');
        const addFriendBtn = profileCardModal.querySelector('.btn-add-friend');
        userLevel.textContent = `Lv.${res.level}`;
        userName.textContent = `${res.uid}`
        userAvatar.src = `data:image;base64,${res.avatar}`;
        userScore.textContent = `${res.wins} 승 ${res.loses} 패`;
        stateMessage.textContent = `${res.message}`;
        addFriendBtn.classList.remove('btn-del-friend');
        addFriendBtn.href = '/edit';
      });
    })
  }

  connectedCallback() {
    super.connectedCallback();

    this._friendModalToggler();
    this._fetchFriendList();
    this._bindProfileCardWithUser();
  }
}
