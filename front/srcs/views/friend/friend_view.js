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
        friendGroup.firstChild.textContent = "친구를 검색하여 추가해보세요🌱";
        friendGroup.firstChild.classList.add('align-items-center', 'justify-content-center');
        return ;
      }
      else
      {
        console.log(res);
        for (const friend of res) {
          const friendElement = friendGroup.firstChild.cloneNode(true);
          friendElement.querySelector('img').src = `data:image;base64,${friend.avatar}`;
          if (friend.status === 'OF')
            friendElement.querySelector('.status-circle-sm').classList.add('status-offline');
          friendElement.querySelector('.user-level').textContent = `Lv.${friend.level}`;
          friendElement.querySelector('.user-name').textContent = `${friend.uid}`;
          friendElement.setAttribute('data-user', `${friend.uid}`);
          friendGroup.appendChild(friendElement);
        }
        friendGroup.removeChild(friendGroup.firstChild);
      }
    })
  }  
  
  _friendModalToggler() {
    const profileCardModalBtn = document.getElementById('profileCardModalBtn');
    const profileCardModal = document.getElementById('profileCardModal');
    const friendGroup = this.querySelector('ul');

    friendGroup.addEventListener('click', async (e) => {
      if (e.target === e.currentTarget)
      return ;
      const clickedList = e.target.closest('li');
      const user = clickedList.getAttribute('data-user');
      
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
        
        // get이 아니라 delete로 보낼 수 있어야 함. 자꾸 GET을 보내려고 한다.
        addFriendBtn.classList.add('btn-del-friend');
        addFriendBtn.textContent = '친구삭제';
        addFriendBtn.href = '';
        addFriendBtn.removeAttribute('data-link');
        console.dir(addFriendBtn);
        addFriendBtn.addEventListener('click', () => {
          const me = 'jeseo';
          fetch(`http://${window.location.hostname}:8000/users/${me}/friends/${user}`), {
            method: 'DELETE',
          }
        })

        profileCardModal.style.display = 'flex';
      });
    })
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
        userLevel.textContent = `Lv.${res.level}`;
        userName.textContent = `${res.uid}`
        userAvatar.src = `data:image;base64,${res.avatar}`;
        userScore.textContent = `${res.wins} 승 ${res.loses} 패`;
        stateMessage.textContent = `${res.message}`;
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
