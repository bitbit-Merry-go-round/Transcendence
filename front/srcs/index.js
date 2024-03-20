import init from "@/init";
import { anchorToLink, route, NAVIGATE_DRIRECTION } from "@/router";

anchorToLink(document);

document.addEventListener("DOMContentLoaded", async () => {
  init();
  route({direction: NAVIGATE_DRIRECTION.forward});
})

window.addEventListener("popstate", () => route({direction: NAVIGATE_DRIRECTION.backward}));

