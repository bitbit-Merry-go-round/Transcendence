import init from "@/init";
import { anchorToLink, route, NAVIGATE_DRIRECTION } from "@/router";
import { DEBUG } from "@/data/global";
import { isAvailableAddress } from "@/views/config";

anchorToLink(document);

document.addEventListener("DOMContentLoaded", async () => {
  init();
  const hash = window.location.hash;
  const debug = hash === "#debug" || hash === "#DEBUG";
  if (debug) {
    DEBUG.setDebug(true);
  }
  if (!DEBUG.isDebug() && 
    !isAvailableAddress(window.location.pathname)) {
    window.location.assign("/");
  }
  route({direction: NAVIGATE_DRIRECTION.forward});
})

window.addEventListener("popstate", () => route({direction: NAVIGATE_DRIRECTION.backward}));

