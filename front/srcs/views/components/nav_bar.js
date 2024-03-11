import View from "@/lib/view";

export default class NavBar extends View {

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    const profileCardModalBtn = document.getElementById('profileCardModalBtn');
    const profileCardModal = document.getElementById('profileCardModal');
    console.log(profileCardModal);
    profileCardModalBtn.addEventListener('click', (e) => {
      profileCardModal.style.display = 'flex';
    })
  }
}
