import View from "@/lib/view";
import HomeView from "@/views/home/home_view";
import LoginView from "@/views/login/login_view";
import GameView from "@/views/game/game_view";
import FriendView from "@/views/friend/friend_view";
import ObservableObject from "@/lib/observable_object";
import User, { createProfile } from "@/data/user";

const user = new ObservableObject(new User({
  profile:
    createProfile({
      id: "heshin",
      level: 30,
      profileUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSEOCV5tCOWEb17GSCGh-mv8QfhjmWo-eIO-Go32AHeA&s" ,
    }), 
    friends: [ 
      createProfile({
        id: "jeseo",
        level: 25,
        profileUrl: "https://ca.slack-edge.com/T039P7U66-U03M2KCK5T6-e75d6c9b8cb3-512"
      }),
    ...["eunjiko", "hyecheon", "yham", 'test 1', 'test 2', 'test 3', 'test 4', 'test 5', 'test 6', 'test 7', 'test 8', 'test 9', 'test 10']
      .map(name => createProfile({id: name}))
  ]
}))


export async function route() {
  console.log(user);
  const routes = [
    { path: "/friend", view: HomeView},
    { path: "/login", view: LoginView},
    { path: "/", view: FriendView},
    { path: "/game", view: GameView },
  ]
  const match = routes.find((route) => {
    return route.path == location.pathname
  })
  const view = match ? match.view : HomeView;   
  const app = document.getElementById("app");
  app.innerHTML = "";
  const page =  new view({
    data: {
      user
    }
  });
  // console.log(user);
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

