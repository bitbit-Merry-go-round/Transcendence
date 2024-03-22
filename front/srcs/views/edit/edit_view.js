
import View from "@/lib/view";

export default class EditView extends View {
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
      profileCardModal.style.display = 'flex';
    });
    modalCloseBtn.addEventListener('click', () => {
      profileCardModal.style.display = 'none';
    });
    profileCardModal.addEventListener('click', e => {
      if (e.target === e.currentTarget)
        profileCardModal.style.display = 'none';
    });

    const editProfileImg = this.querySelector('.edit-profile-img');
    const profileImg = editProfileImg.querySelector('.img-profile');
    const imgWrapper = editProfileImg.querySelector('.img-wrapper');
    const imgInput = editProfileImg.querySelector('input');
    const imgContainer = editProfileImg.querySelector('.test');

    imgContainer.addEventListener('mouseenter', e => {
      imgWrapper.style.display = 'block';
    }, false);

    imgContainer.addEventListener('mouseleave', e => {
      imgWrapper.style.display = 'none';
    }, false);

    imgInput.addEventListener('input', e => {
      if (imgInput.files && imgInput.files[0]) {
        profileImg.src = URL.createObjectURL(file.files[0]);;
      }
    })
  }
}

