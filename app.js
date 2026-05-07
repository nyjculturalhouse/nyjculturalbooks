const GAS_URL = "https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec";

window.app = {
    async fetch(action, data = {}) {
        const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action, data }) });
        return await res.json();
    },

    render(viewName) {
        const menu = document.getElementById('main-menu');
        const view = document.getElementById('content-view');
        const homeBtn = document.getElementById('home-btn');
        
        menu.classList.add('hidden');
        homeBtn.classList.remove('hidden');

        if (viewName === 'search') {
            view.innerHTML = `<h1>도서 찾기</h1><div id="book-list" class="book-grid">불러오는 중...</div>`;
            this.loadBooks();
        } else if (viewName === 'join') {
            view.innerHTML = `
                <div class="card">
                    <h1>회원가입</h1>
                    <input type="text" id="j_name" placeholder="성함">
                    <input type="text" id="j_phone" placeholder="전화번호 (010-0000-0000)">
                    <input type="password" id="j_pw" maxlength="4" placeholder="비밀번호 숫자 4자리">
                    <button onclick="window.app.handleJoin()" class="menu-btn blue">가입완료</button>
                </div>`;
        } else if (viewName === 'login') {
            view.innerHTML = `
                <div class="card">
                    <h1>대여/반납 로그인</h1>
                    <input type="text" id="l_id" placeholder="회원번호">
                    <input type="password" id="l_pw" maxlength="4" placeholder="비밀번호">
                    <button onclick="window.app.handleLogin()" class="menu-btn green">로그인</button>
                </div>`;
        }
    },

    async loadBooks() {
        const books = await this.fetch('getBooks');
        const list = document.getElementById('book-list');
        list.innerHTML = books.map(b => `
            <div class="book-item">
                <img src="${b.표지URL || 'https://via.placeholder.com/150x220'}" class="book-cover">
                <div class="book-title">${b.제목}</div>
                <div class="book-info">${b.저자} | ${b.출판사}</div>
                <div class="book-info" style="color:${b.대여상태==='대여가능'?'blue':'red'}">${b.대여상태}</div>
            </div>
        `).join('');
    },

    async handleJoin() {
        const data = {
            name: document.getElementById('j_name').value,
            phone: document.getElementById('j_phone').value,
            pw: document.getElementById('j_pw').value
        };
        if(data.pw.length !== 4) return alert("비밀번호 4자리를 입력하세요.");
        
        const res = await this.fetch('join', data);
        if(res.success) alert(`가입 완료! 회원님의 번호는 [ ${res.memberId} ] 입니다. 꼭 기억해주세요!`);
        location.reload();
    }
};
