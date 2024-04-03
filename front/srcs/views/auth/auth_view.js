import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

export default class AuthView extends View {

  constructor({data}) {
    super({data});
  }

  _otpInputControl() {
    const otpInput = this.querySelector('input');
    
    otpInput.addEventListener('keydown', (e) => {
      if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key))
      {
          e.preventDefault();
      }
    });
    otpInput.addEventListener('keypress', (e) => {
      const {value} = e.target;
      if (value.length >= 5)
      {
          e.preventDefault();
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._otpInputControl();
  }
}
