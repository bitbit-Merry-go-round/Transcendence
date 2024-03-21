import View from "@/lib/view";
import ObservableObject from "@/lib/observable_object";
import User from "@/data/user";

export default class ProfileCard extends View {

  constructor() {
    /** @type {ObservableObject} user */
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    const profileCard = document.querySelector('.profile-card');
    
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
}
