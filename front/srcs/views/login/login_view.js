import View from "@/lib/view";
import httpRequest from "@/utils/httpRequest";

export default class LoginView extends View {

  constructor({data}) {
    super({data});
  }

  _getJWT(data) {
    console.log('jwt:', data);
    window.localStorage.setItem('access_token', data.access);
    window.localStorage.setItem('refresh_token', data.refresh);
  }

  connectedCallback() {
    super.connectedCallback();

    const queryString = window.location.search;
    if (queryString)
    {
      const authCode = new URLSearchParams(queryString).get('code');
      console.log('code', authCode);
      const uri = `http://127.0.0.1:8000/users/42/callback?code=${authCode}`;

      httpRequest('GET', uri, null, this._getJWT);
    }
    else
    {
      const loginBtn = this.querySelector('#btn-login');
      loginBtn.addEventListener('click', () => {
        window.location.href = `http://localhost:8000/users/42/login`;
      })
    }
  }
}
