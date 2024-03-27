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
    const friendGroup = this.querySelector('ul');

    const profileCardModal = this.querySelector('#profileCardModal');
    friendGroup.addEventListener('click', e => {
      if (e.target === e.currentTarget)
        return ;
      const clickedList = e.target.closest('li');
      
      profileCardModal.querySelector('img').src = clickedList.querySelector('img').src;
      profileCardModal.querySelector('.user-level').textContent = clickedList.querySelector('.user-level').textContent;
      profileCardModal.querySelector('.user-name').textContent = clickedList.querySelector('.user-name').textContent;
      profileCardModal.style.display = 'flex';
    })
  }

  connectedCallback() {
    super.connectedCallback();

    this._friendModalToggler();
    this._fetchFriendList();

  }

}
