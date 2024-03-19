import HomeView from "@/views/home/home_view";
import globalData from "@/data/global";
import { routes } from "@/views/config";

class Router {

  static _shared;

  /** @type {{
   * prev: { path: null, view: null, } | null,
   * current: { path: null, view: null, } | null,
   * next: { path: null, view: null, } | null,
   * }} */
  #views = {
    prev: null,
    current: null,
    next: null
  };

  static get shared() {
    if (!this._shared) {
      return new Router();
    }
    return this._shared;
  }

  constructor() {
    if (Router._shared) 
      return Router._shared
    Router._shared = this;
  }

  async navigate(view) {
    const app = document.getElementById("app");
    const page = new view({
      data: {
        user: globalData.user
      }
    });
    await page.render();
    if (!this.#views.current) {
      app.innerHTML = "";
      app.appendChild(page);
    }
    anchorToLink(page);
  }
}

export async function route() {
  const match = routes.find((route) => {
    return route.path == location.pathname
  })
  const view = match ? match.view : HomeView;   
  await Router.shared.navigate(view);
}

/** @param {string | URL} url */
function navigate(url) {
  history.pushState(null, null, url);
  route();
}

/** @param {HTMLElement | Document} parent */
export function anchorToLink(parent) {

  /** @type {HTMLAnchorElement[]} */
  const links = Array.from(parent.querySelectorAll("a[data-link]"));
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(link.href);
    })
  })
}

