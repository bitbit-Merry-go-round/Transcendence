import View from "@/lib/view";
import ObservableObject from "@/lib/observable_object";
import User from "@/data/user";

export default class ProfileCard extends View {

  constructor() {
    /** @type {ObservableObject} user */
    super();
  }

  _profileCardEffect() {
    const profileCard = this.querySelector('.profile-card');
   
    profileCard.addEventListener('mousemove', e => {
      const cardX = profileCard.offsetLeft;
      const cardY = profileCard.offsetTop;
      const x = e.clientX - cardX;
      const y = e.clientY - cardY;
      
      const force = 80;

      const rotateX = +(y / window.innerHeight) * force;
      const rotateY = -(x / window.innerWidth) * force;
      
      profileCard.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }, false);

    profileCard.addEventListener('mouseleave', function() {
        profileCard.style.transform = 'translate(-50%, -50%) perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  async _fetchInfoToProfile() {
    const userAvatar = this.querySelector('.user-avatar');
    const userLevel = this.querySelector('.user-level');
    const userName = this.querySelector('.user-name');
    const userScore = this.querySelector('.score');
    const stateMessage = this.querySelector('.state-message');

    // TODO: user를 어디엔가 저장해두어야 함.
    // user를 임의로 변경하는 경우 어떻게 처리해주어야 할지 결정해야 함. back이냐 front냐.
    const user = 'jeseo';

    await fetch(`http://${window.location.hostname}:8000/users/${user}/profile`)
    .then(res => res.json())
    .then(res => {
      userLevel.textContent = `Lv.${res.level}`;
      userName.textContent = `${res.uid}`
      userAvatar.src = `data:image;base64,${res.avatar}`;
      stateMessage.textContent = `${res.message}`;
    })
  }

  connectedCallback() {
    super.connectedCallback();
    
    this._profileCardEffect();
    this._fetchInfoToProfile();
  }
}
