import View from "@/lib/view";
import HomeView from "@/views/home/home_view";
import LoginView from "@/views/login/login_view";
import GameView from "@/views/game/game_view";
import FriendView from "@/views/friend/friend_view";
import ModeView from "@/views/mode/mode_view";
import RecordView from "@/views/record/record_view";
import TournamentView from "@/views/tournament/tournament_view";
import MatchView from "@/views/match/match_view";
import ObservableObject from "@/lib/observable_object";
import User, { createProfile } from "@/data/user";
import { routes } from "@/views/viewClasses";
import global from "@/data/global";

export async function route() {
  const match = routes.find((route) => {
    return route.path == location.pathname
  })
  const view = match ? match.view : HomeView;   
  const app = document.getElementById("app");
  app.innerHTML = "";
  const page =  new view({
    data: {
      user: global.user
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

