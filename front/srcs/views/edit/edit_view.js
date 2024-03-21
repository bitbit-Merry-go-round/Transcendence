
import View from "@/lib/view";

export default class EditView extends View {
  constructor({data}) {
    super();
    this.data = data
  }

  connectedCallback() {
    super.connectedCallback();

    const editProfileImg = document.querySelector('.edit-profile-img');
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
      } else {
        profileImg.src = "srcs/assets/imac.png";
      }
    })
  }
}

