import View from "@/lib/view";

export default class MatchView extends View {

  constructor({data}) {
    
    super();
    this.data = data
  }

  connectedCallback() {
    super.connectedCallback();

  }
}
