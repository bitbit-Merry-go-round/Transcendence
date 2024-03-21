import View from "@/lib/view";

/** @typedef {Object} Match 
 *  @property {{
 *    name: string,
 *    score: number | null
 *  }} playerA
 *  @property {{
 *    name: string,
 *    score: number | null
 *  }} playerB
*/

/** @type {Match} */
const match = {
  playerA:  {
    name: "a",
    score: 10
  },
  playerB: {
    name: "b",
    score: 12
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

  constructor() {
    const data = {
      rounds: [
        {
          playerCounts: 8,
          matches: [
            { playerA: { name: "1", score: 12 }, playerB: { name: "2", score: 12 } },
            { playerA: { name: "3", score: 12 }, playerB: { name: "4", score: 12 } },
            { playerA: { name: "5", score: 12 }, playerB: { name: "6", score: 12 } },
            { playerA: { name: "7", score: 12 }, playerB: { name: "8", score: 12 } },
          ]
        },
        {
          playerCounts: 4,
          matches: [
            {
              playerA: {
                name: "a",
                score: 12
              },
              playerB: {
                name: "b",
                score: 12
              }
            },
            {
              playerA: {
                name: "c",
                score: 12
              },
              playerB: {
                name: "d",
                score: 12
              }
            },
          ]
        }
      ]
    } 
    super({data});
    this.data = data;
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
