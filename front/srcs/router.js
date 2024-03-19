import HomeView from "@/views/home/home_view";
import globalData from "@/data/global";
import { routes } from "@/views/config";

class Router {

  static shared;

  constructor() {
    if (Router.shared) 
      return Router.shared
    Router.shared = this;
  }
}

export async function route() {
  const match = routes.find((route) => {
    return route.path == location.pathname
  })
  const view = match ? match.view : HomeView;   
  const app = document.getElementById("app");
  app.innerHTML = "";
  const page =  new view({
    data: {
      user: globalData.user
    }
  });
  await page.render();
  app.appendChild(page);
  anchorToLink(app);
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

