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

  //  if (!path.includes("login") &&
  //  !localStorage.getItem("access") && !DEBUG.isDebug()) {
  //    path = "/login";
  //  }

  if (!DEBUG.isDebug() && 
    (!history || index == undefined)) {
    path = isAvailableAddress(path) ? path:  "/";
    if (!history || index == undefined) {
      window.history.replaceState({
        history: [ path ],
        index: 0,
      }, "42 Pong", "/");
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
          path,
          direction: NAVIGATE_DRIRECTION.backward,
        })
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

