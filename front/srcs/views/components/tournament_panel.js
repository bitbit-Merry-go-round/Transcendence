import View from "@/lib/view";

/** @typedef {Object} Match 
 *  @property {{
 *    name: string,
 *    score: number | null,
 *    class: string
 *  }} playerA
 *  @property {{
 *    name: string,
 *    score: number | null,
 *    class: string
 *  }} playerB
*/

/** @type {Match} */
const match = {
  playerA:  {
    name: "a",
    score: 10,
    class: "winner",
  },
  playerB: {
    name: "b",
    score: 12,
    class: "looser",
  }
};

export default class TournamentPanel extends View {

  /** @type {{
   *   rounds: 
   *     {
   *      playerCounts: number
   *      matches : Match[]
   *     }[]
  * }} */
  data;

  constructor(params) {
    const gameData = params?.data?.gameData;
    if (gameData) {
      const tournament = gameData.tournament;
      const rounds = tournament.allRounds;
      const data = {
        rounds
      };
      super({data});
      this.data = data;
    }
    else {
      super({data: {}});
      this.data = {};
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.querySelectorAll("ul")
      .forEach(ul => {
        const space = document.createElement("li");
        space.innerHTML = "&nbsp;";
        ul.appendChild(space)
      }) 
  }

}
