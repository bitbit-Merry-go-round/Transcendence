import View from "@/lib/view";
import Observable from "@/lib/observable";
import binding from "@/lib/binding";
import BindedView from "@/lib/binded_view";
import ObservableObject from "@/lib/observable_object";

export default class LoginView extends BindedView {

  #user;

  constructor({data}) {
    const user = data.user;
    super({
      data,
      bindingParams:{}});
    this.#user = user;
  }

  connectedCallback() {
    super.connectedCallback();
    this.#user.subscribe("profile", () => this.reRender());
    // document.getElementById('login-button').addEventListener('click', () => {
    //   alert('login failed');
    // });
  }
}
