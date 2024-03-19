import View from "@/lib/view";

export default class MatchView extends View {

  constructor({data}) {
    
    super();
    this.data = data
  }

  connectedCallback() {
    super.connectedCallback();
    const mapModalBtn = document.getElementById('confMapBtn');
    const paddleModalBtn = document.getElementById('confPaddleBtn');
    const mapModal = document.querySelector('.map-wrap');
    const paddleModal = document.querySelector('.paddle-wrap');

    mapModalBtn.addEventListener('click', () => {
      mapModal.style.display = 'flex';
    });

    mapModal.querySelector('.btn-close').addEventListener('click', () => {
      mapModal.style.display = 'none';
    })

    mapModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget)
        mapModal.style.display = 'none';
    })

    paddleModalBtn.addEventListener('click', () => {
      paddleModal.style.display = 'flex'
    })

    paddleModal.querySelector('.btn-close').addEventListener('click', () => {
      paddleModal.style.display = 'none';
    })

    paddleModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget)
        paddleModal.style.display = 'none';
    })
  }
}
