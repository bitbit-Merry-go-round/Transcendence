import View from "@/lib/view";
import ObservableObject from "@/lib/observable_object";
import User from "@/data/user";
import MapImageGenarator from "@/game/mapImageGenerator";

export default class HomeView extends View {

  /** @type {ObservableObject} user */
  #user;

  constructor({data}) {
    /** @type {ObservableObject} user */
    super({data});
    this.#user = data.user;
  }

  connectedCallback() {
    super.connectedCallback();
    const profileCardModalBtn = this.querySelector('#profileCardModalBtn');
    const profileCardModal = this.querySelector('#profileCardModal');
    const modalCloseBtn = this.querySelector('.btn-close');
    profileCardModalBtn.addEventListener('click', () => {
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
}

