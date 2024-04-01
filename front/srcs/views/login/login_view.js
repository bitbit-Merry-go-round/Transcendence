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
    // const url = `http://localhost:8000/users/42/login`;
    const loginBtn = this.querySelector('#btn-login');
    loginBtn.addEventListener('click', () => {
      const FOURTYTWO_CLIENT_ID="u-s4t2ud-9c16991b58c036772092c27d7f302fb8e92f7c4635ef6f8e57d97bccbbdbfa2d";
      const FOURTYTWO_CALLBACK_URI = `http://127.0.0.1:8000/users/42/callback`;
      const url = `https://api.intra.42.fr/oauth/authorize`;
      const body = JSON.stringify({
        client_id: FOURTYTWO_CLIENT_ID,
        redirect_uri: FOURTYTWO_CALLBACK_URI,
        response_type: 'code'
      })

      // window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${FOURTYTWO_CLIENT_ID}&redirect_uri=${FOURTYTWO_CALLBACK_URI}&response_type=code`;
      window.location.href = `http://localhost:8000/users/42/login`;
      // httpRequest('GET', url, null, this._getJWT);

    })

  }
}
