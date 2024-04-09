import View from "@/lib/view";
import ObservableObject from "@/lib/observable_object";

export default class HomeView extends View {


  constructor({data}) {
    /** @type {ObservableObject} user */
    super({data});
  }

  connectedCallback() {
    super.connectedCallback();
  }
}
