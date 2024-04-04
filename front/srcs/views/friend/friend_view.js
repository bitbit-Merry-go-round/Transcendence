import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

const TYPE_EDIT = "TYPE_EDIT"
const TYPE_ADD = "TYPE_ADD"
const TYPE_DELETE = "TYPE_DELETE"

export default class FriendView extends View {

  constructor({data}) {
    super();
    this.data = data
  }

  
  async _deleteBtnHandler(user, event) {
    const url = `http://${window.location.hostname}:8000/users/me/friends/${user}`;
    
    await httpRequest('DELETE', url, null, () => {
      alert(`Your friend <${user}> is deleted!`);
    })
  }

  _modalBtnSetter(type)
  {
    const addFriendBtn = this.querySelector('.btn-add-friend');

    if (type === TYPE_EDIT)
    {
      addFriendBtn.classList.remove('btn-del-friend');
      addFriendBtn.href = '/edit';
    }
    else if (type === TYPE_ADD)
    {

    }
    else
    {
      addFriendBtn.classList.add('btn-del-friend');
      addFriendBtn.textContent = '친구삭제';
      addFriendBtn.href = '/';
    }
  }

  async _fetchFriendList() {
    const friendGroup = this.querySelector('ul');
    const url = `http://${window.location.hostname}:8000/users/me/friends/`;
    
    httpRequest('GET', url, null, (res) => {
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
          else
          {
            friendElement.querySelector('.status-circle-sm').classList.remove('status-offline');
          }
          friendElement.querySelector('.user-level').textContent = `Lv.${friend.level}`;
          friendElement.querySelector('.user-name').textContent = `${friend.username}`;
          friendElement.setAttribute('data-user', `${friend.username}`);
          friendGroup.appendChild(friendElement);
        }
        friendGroup.removeChild(friendGroup.firstChild);
      }
    })
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

  _fillModalWithFriendData(data) {
    const profileCardModal = document.getElementById('profileCardModal');
    const userAvatar = profileCardModal.querySelector('.user-avatar');
    const userLevel = profileCardModal.querySelector('.user-level');
    const userName = profileCardModal.querySelector('.user-name');
    const userScore = profileCardModal.querySelector('.score');
    const stateMessage = profileCardModal.querySelector('.state-message');
    
    userLevel.textContent = `Lv.${data.level}`;
    userName.textContent = `${data.username}`
    userAvatar.src = `data:image;base64,${data.avatar}`;
    userScore.textContent = `${data.wins} 승 ${data.loses} 패`;
    stateMessage.textContent = `${data.message}`;
  }

  async _friendListModalEventHandler(e) {
    if (e.target === e.currentTarget)
      return ;
    const clickedList = e.target.closest('li');
    const user = clickedList.getAttribute('data-user');
    const profileCardModal = document.getElementById('profileCardModal');
    const deleteBtnHandler = this._deleteBtnHandler.bind(this, user);
    const url = `http://${window.location.hostname}:8000/users/${user}/profile`;
    const addFriendBtn = this.querySelector('.btn-add-friend');
    
    await httpRequest('GET', url, null, (res) => {
      this._fillModalWithFriendData(res);
      this._modalBtnSetter(TYPE_DELETE);

      addFriendBtn.addEventListener('click', deleteBtnHandler);
      profileCardModal.style.display = 'flex';
    })
    await this._friendModalClose(deleteBtnHandler);
  }

  _friendModalToggler() {
    const friendGroup = this.querySelector('ul');
    friendGroup.addEventListener('click', this._friendListModalEventHandler.bind(this));
  }

  _fillModalWithUserData() {
    const profileCardModalBtn = document.getElementById('profileCardModalBtn');

    profileCardModalBtn.addEventListener('click', async () => {
      const url = `http://${window.location.hostname}:8000/users/me/profile`;

      await httpRequest('GET', url, null, (res) => {
          this._fillModalWithFriendData(res);
        });
      });
    }
    
  async _searchFriend() {
    const friendNameInput = this.querySelector('#search-friend');
    function is_alnum(str) { return /^[a-zA-Z0-9]+$/.test(str); }
    
    friendNameInput.addEventListener('keydown', async (e) => {
      const username = e.target.value;
      if (e.key !== 'Enter')
        return ;
      if (!is_alnum(username))
      {
        alert(`${username} is not valid.`)
        return ;
      }
      const url = `http://${window.location.hostname}:8000/users?search=${username}`;

      await httpRequest('GET', url, null, (res) => {
        console.log(res);
        this._fillModalWithFriendData(res);
        if (res.is_me === true)
        {
          this._modalBtnSetter(TYPE_EDIT);
        }
        else if (res.is_Friend === true)
        {
          this._modalBtnSetter(TYPE_DELETE);
        }
        else
        {
          this._modalBtnSetter(TYPE_DELETE)
          // TODO: event handler 추가해주어야 함.
        }
      }, (res) => {
        console.log(res);
        alert(`${username} is not exist.`)
      })
    });
  }

    connectedCallback() {
      super.connectedCallback();
      
      this._friendModalToggler();
      this._fetchFriendList();
      this._fillModalWithUserData();
      this._searchFriend();
    }
}
