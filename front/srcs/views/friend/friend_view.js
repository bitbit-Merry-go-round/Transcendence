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

  
  async _modalBtnHandler(e) {
    let url;
    const profileCardModal = e.target.closest('#profileCardModal')

    const type = profileCardModal.getAttribute('data-user-type');
    const user = profileCardModal.getAttribute('data-user');
    console.log(`${type}, ${user}`);
    e.target.setAttribute('disabled', '');
    e.target.classList.add('disabled');
    if (type === TYPE_DELETE)
    {
      url = `http://${window.location.hostname}:8000/users/me/friends/${user}/`;
      console.log(`delete ${user}`);
      await httpRequest('DELETE', url, null, () => {
        alert(`Your friend <${user}> is deleted!`);
      });
    }
    else if (type === TYPE_ADD)
    {
      console.log(`add ${user}`);
      url = `http://${window.location.hostname}:8000/users/me/friends/`;
      const body = JSON.stringify({"to_user": `${user}`})
      await httpRequest('POST', url, body, () => {
        alert(`<${user}> is your friend now!`);
      }, (res) => (console.log('failed res: ', res)));
    }
  }

  _modalBtnEventSet() {
    const addFriendBtn = this.querySelector('.btn-add-friend');

    addFriendBtn.addEventListener('click', this._modalBtnHandler);
  }

  _modalBtnSetter(type)
  {
    const addFriendBtn = this.querySelector('.btn-add-friend');

    console.log('this: ', this, 'btn: ', addFriendBtn);
    addFriendBtn.classList.remove('btn-del-friend');
    if (type === TYPE_EDIT)
    {
      addFriendBtn.href = '/edit';
    }
    else if (type === TYPE_ADD)
    {
      addFriendBtn.textContent = '친구추가';
      addFriendBtn.href = '/friend';
    }
    else
    {
      addFriendBtn.classList.add('btn-del-friend');
      addFriendBtn.textContent = '친구삭제';
      addFriendBtn.href = '/friend';
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
          friendElement.setAttribute('data-user-type', `${TYPE_DELETE}`);
          friendGroup.appendChild(friendElement);
        }
        friendGroup.removeChild(friendGroup.firstChild);
      }
    })
  }

  _fillModalData(data) {
    const profileCardModal = document.getElementById('profileCardModal');
    const userAvatar = profileCardModal.querySelector('.user-avatar');
    const userLevel = profileCardModal.querySelector('.user-level');
    const userName = profileCardModal.querySelector('.user-name');
    const userScore = profileCardModal.querySelector('.score');
    const stateMessage = profileCardModal.querySelector('.state-message');
    
    profileCardModal.setAttribute('data-user', `${data.username}`);
    if (data.is_me === true)
      profileCardModal.setAttribute('data-user-type', `${TYPE_EDIT}`);
    else if (data.is_friend === true)
      profileCardModal.setAttribute('data-user-type', `${TYPE_DELETE}`);
    else
      profileCardModal.setAttribute('data-user-type', `${TYPE_ADD}`);

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
    const url = `http://${window.location.hostname}:8000/users/${user}/profile`;
    
    await httpRequest('GET', url, null, (res) => {
      this._fillModalData(res);
      this._modalBtnSetter(TYPE_DELETE);

      profileCardModal.style.display = 'flex';
    })
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
        this._fillModalData(res);
        this._modalBtnSetter(TYPE_EDIT);
      });
    });
  }
    
  async _searchFriend() {
    const friendNameInput = this.querySelector('#search-friend');
    const profileCardModal = document.getElementById('profileCardModal');
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
        this._fillModalData(res);
        if (res.is_me === true)
        {
          this._modalBtnSetter(TYPE_EDIT);
        }
        else if (res.is_friend === true)
        {
          this._modalBtnSetter(TYPE_DELETE);
        }
        else
        {
          this._modalBtnSetter(TYPE_ADD)
        }
        profileCardModal.style.display = 'flex';
      }, (url, res) => {
        console.log(url, res);
        alert(`${username} is not exist.`)
      })
    });
  }

    connectedCallback() {
      super.connectedCallback();
      
      this._modalBtnEventSet();
      this._friendModalToggler();
      this._fetchFriendList();
      this._fillModalWithUserData();
      this._searchFriend();
    }
}
