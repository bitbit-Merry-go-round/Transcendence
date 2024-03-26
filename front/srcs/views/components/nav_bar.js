import View from "@/lib/view";

export default class NavBar extends View {
  constructor() {
    super();
    // 컴포넌트 안에서 fetch 해온 데이터를 사용할 수 있게 하기.    
  }
  
  async _fetchUserInfoToNavbar() {
    const userName = this.querySelector('p');
    const userImg = this.querySelector('#profileCardModalBtn');
    
    // 로그인 이후에 알고있게 함으로써 처리?? 브라우저 스토리지나 쿠키
    const user = 'jeseo'; 

    await fetch(`http://${window.location.hostname}:8000/users/${user}/profile`)
      .then(res => res.json())
      .then(res => {
        userName.textContent = `Lv.${res.level} ${res.uid}`;
        userImg.src = `data:image;base64,${res.avatar}`;
      });
  }

  connectedCallback() {
    super.connectedCallback();
    this._fetchUserInfoToNavbar();
  }
}
