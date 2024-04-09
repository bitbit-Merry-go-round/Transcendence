import View from "@/lib/view";

export default class ModeView extends View {

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  }

}
