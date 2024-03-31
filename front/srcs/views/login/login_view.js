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
    const url = `http://localhost:8000/users/42/login`;

    httpRequest('GET', url, null, this._getJWT);
  }
}
