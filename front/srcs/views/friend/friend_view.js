import View from "@/lib/view";

export default class FriendView extends View {


  constructor({data}) {

    super();
    this.data = data
  }

  connectedCallback() {
    super.connectedCallback();
    const profileCardModalBtn = this.querySelector('#profileCardModalBtn');
    const profileCardModal = this.querySelector('#profileCardModal');
    const modalCloseBtn = this.querySelector('.btn-close');
    const editBtn = profileCardModal.querySelector('.btn-to-edit');
    profileCardModalBtn.addEventListener('click', () => {
      editBtn.textContent = '정보변경';
      editBtn.href = '/edit';
      editBtn.setAttribute('data-link', '');
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
      editBtn.textContent = '친구추가';
      editBtn.href = '/friend';
      editBtn.setAttribute('data-link', '');
      profileCardModal.style.display = 'flex';
    })
  }

}
