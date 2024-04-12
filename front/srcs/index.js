import init from "@/init";
import { anchorToLink, route, NAVIGATE_DRIRECTION } from "@/router";
import { DEBUG, STATE } from "@/data/global";
import { isAvailableAddress, isNavigatableAddress } from "@/views/config";

anchorToLink(document);

document.addEventListener("DOMContentLoaded", async () => {
  init();
  const hash = window.location.hash;
  if (hash === "#debug" || hash === "#DEBUG")
    DEBUG.setDebug(true);

  let path = window.location.pathname;
  const history = window.history.state?.history;
  const index = window.history.state?.index;

  if (!DEBUG.isDebug() && 
    (!history || index == undefined)) {
    path = isAvailableAddress(path) ? path:  "/";
    if (!history || index == undefined) {
      if (handleLogin()) {
        return ;
      }
      window.history.replaceState({
        history: [ path ],
        index: 0,
      }, "42 Pong", path);
    }
  }
  route({
    path,
    direction: NAVIGATE_DRIRECTION.forward
  });
})

window.addEventListener("popstate", 
  (event) => {

    const index = window.history.state?.index;
    /** @type { string[] } */
    const history = window.history.state?.history;
    if (!history || index == undefined)
      return;
    event.preventDefault();
    let path = history[index];

    if (!isNavigatableAddress(path))
      return ;

    if (STATE.isPlayingGame()) {
      STATE.requestCancelGame().then(
        (cancel) => {
          if (!cancel)
            return ;
          route({
            path: "/",
            direction: NAVIGATE_DRIRECTION.backward,
          })
          window.location.assign("/");
        })
    }
    else {
      route({
        path,
        direction: NAVIGATE_DRIRECTION.backward,
      })
    }
  }
)

function handleLogin() {
  const url = window.location.href;
  
  if (!url.includes("code"))
    return false;

  const code = new URL(url).searchParams.get("code");
  const callbackUrl = new URL("/42/callback/", url.replace(":8080", ":8000"));
  callbackUrl.searchParams.append("code", code);
  
  document.body.innerHTML = `
      <div id="app">
        <div class="loading-wrap">
        <div class="loading-spinner my-5"></div>
        <p id="loadingMessage" class="mt-5 loading-message">접속 중...</p>
      </div>
    `
  fetch(callbackUrl, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    }
  })
    .then(res => {
      console.log("logini res", res.status, res.body);
      return res.json();
    })
    .then(json =>  {
      if (json["username"]) {
        window.localStorage.setItem("username", json["username"]);
        route({
          path: "/auth"
        });
        window.history.replaceState({
          history: [ "/" ],
          index: 0,
        }, "42 Pong", "/");
      }
    });
  return true;
}
