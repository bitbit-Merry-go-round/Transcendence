import View from "@/lib/view";

export default class ModeView extends View {

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    const waitToMatch = document.querySelector('.online-mode .online-game');
    waitToMatch.addEventListener('click', () => {
      const loadingWrap = document.querySelector('.loading-wrap');
      const matchCompleted = loadingWrap.querySelector('a');
      loadingWrap.style.display = 'flex';
      setTimeout(() => {
        matchCompleted.click();
      }, 5000);
    })
  }
}
