import View from "@/lib/view";

export default class RecordView extends View {

  constructor({data}) {
    
    super();
    this.data = data
  }

  connectedCallback() {
    super.connectedCallback();
    const profileCardModalBtn = this.querySelector('#profileCardModalBtn');
    const profileCardModal = this.querySelector('#profileCardModal');
    const modalCloseBtn = this.querySelector('.btn-close');
    profileCardModalBtn.addEventListener('click', () => {
      profileCardModal.querySelector('img').src = "https://media.istockphoto.com/id/1251434169/ko/%EC%82%AC%EC%A7%84/%EC%97%B4%EB%8C%80-%EC%9E%8E-%EC%A0%95%EA%B8%80%EC%9D%98-%EC%A7%99%EC%9D%80-%EB%85%B9%EC%83%89-%EB%8B%A8%ED%92%8D-%EC%9E%90%EC%97%B0-%EB%B0%B0%EA%B2%BD.jpg?s=612x612&w=0&k=20&c=-v5nlfyzPmVxWkzUVcZ8-LJ7edlQIpbT6Tf1O-eAXEs="
      profileCardModal.querySelector('.user-level').textContent = 'Lv.20';
      profileCardModal.querySelector('.user-name').textContent = '홍길동';
      profileCardModal.style.display = 'flex';
    });
    modalCloseBtn.addEventListener('click', () => {
      profileCardModal.style.display = 'none';
    });
    profileCardModal.addEventListener('click', e => {
      if (e.target === e.currentTarget)
        profileCardModal.style.display = 'none';
    });

    /* test on/offline */
    const friendGroup = this.querySelector('ul');
    friendGroup.addEventListener('click', e => {
      if (e.target === e.currentTarget)
        return ;
      const clickedList = e.target.closest('li');
      const statusBadge = clickedList.querySelector('.status-circle-sm');
      statusBadge.classList.toggle('status-offline');
      
      profileCardModal.querySelector('img').src = clickedList.querySelector('img').src;
      profileCardModal.querySelector('.user-level').textContent = clickedList.querySelector('.user-level').textContent;
      profileCardModal.querySelector('.user-name').textContent = clickedList.querySelector('.user-name').textContent;
      profileCardModal.style.display = 'flex';
    })
  }
}
