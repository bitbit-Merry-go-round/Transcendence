import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

export default class LoginView extends View {

  constructor({data}) {
    super({data});
  }

  connectedCallback() {
    super.connectedCallback();
    localStorage.clear();

    const loginBtn = this.querySelector('#btn-login');
    loginBtn.addEventListener('click', () => {
      const client_id = 'u-s4t2ud-9c16991b58c036772092c27d7f302fb8e92f7c4635ef6f8e57d97bccbbdbfa2d';
      const redirect_uri = 'http%3A%2F%2F127.0.0.1%3A8080%2Flogin';
      window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`;
    })
  }
}
