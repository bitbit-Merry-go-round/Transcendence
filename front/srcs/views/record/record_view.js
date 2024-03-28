import View from "@/lib/view";

export default class RecordView extends View {


  constructor({data}) {
    super({data});
    this.data = data;
  }

  _friendModalToggler() {
    const friendGroup = this.querySelector('ul');
    const profileCardModal = this.querySelector('#profileCardModal');
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

  connectedCallback() {
    super.connectedCallback();
    
    this._friendModalToggler();
  }
}
