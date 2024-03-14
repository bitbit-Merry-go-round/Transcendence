import View from "@/lib/view";

export default class FriendView extends View {


  constructor({data}) {
    
    super();
    this.data = data
  }

  connectedCallback() {
    super.connectedCallback();
    // const profileCardModalBtn = document.getElementById('profileCardModalBtn');
    // const profileCardModal = document.getElementById('profileCardModal');
    // const modalCloseBtn = document.querySelector('.btn-close');
    // profileCardModalBtn.addEventListener('click', () => {
    //   profileCardModal.style.display = 'flex';
    // });
    // modalCloseBtn.addEventListener('click', () => {
    //   profileCardModal.style.display = 'none';
    // });
    // profileCardModal.addEventListener('click', e => {
    //   if (e.target === e.currentTarget)
    //     profileCardModal.style.display = 'none';
    // });

    /* test on/offline */
    const profileCardModal = document.querySelector('ul');
    profileCardModal.addEventListener('click', e => {
      if (e.target === e.currentTarget)
        return ;
      const choosedList = e.target.closest('li');
      const statusBadge = choosedList.querySelector('.status-circle-sm');
      statusBadge.classList.toggle('status-offline');
    })
  }
}
