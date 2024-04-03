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
      if (e.target.value.length >= 5)
      {
          e.preventDefault();
      }
    });
  }

  _failToAuthHandler() {
    const otpInput = this.querySelector('#tfa');
    const submitBtn = this.querySelector('#btn-tfa');
    const errorPassage = this.querySelector('#otp-error');
    
    errorPassage.style.display = 'flex';
    otpInput.classList.add(`vibration`);
    setTimeout(() => {
      otpInput.classList.remove("vibration");
      errorPassage.style.display = 'none';
      submitBtn.removeAttribute('disabled');
    }, 700);
  }

  async _submitBtnControl() {
    const otpInput = this.querySelector('#tfa');
    const submitBtn = this.querySelector('#btn-tfa');
    const url = `http://localhost:8000/2fa`
    const {value} = otpInput;

    submitBtn.addEventListener('click', async (e) => {
      console.log(e.target.value);
      submitBtn.setAttribute('disabled', '');
      if (otpInput.value.length < 5)
      {
        this._failToAuthHandler();
        return ;
      }
      await httpRequest('POST', url, value, (res) => {
        console.log('2fa 인증 성공');
        //move to home logic 옮겨야 함.
      }, this._failToAuthHandler.bind(this));
    })
  }

  connectedCallback() {
    super.connectedCallback();
    this._otpInputControl();
    this._submitBtnControl();
  }
}
