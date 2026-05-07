// ⚠️ 여기에 본인의 GAS 배포 URL을 넣으세요!
const API_URL = "https://script.google.com/macros/s/YOUR_GAS_URL/exec";

window.app = {
    user: null,

    init() {
        this.renderLogin();
    },

    // 1. 로그인 화면 렌더링
    renderLogin() {
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="card">
                <h1>Library 3.0</h1>
                <p>어르신들을 위한 편한 도서관</p>
                <input type="text" id="userId" placeholder="아이디">
                <input type="password" id="userPw" maxlength="4" placeholder="숫자 4자리 비밀번호" 
                       oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                <button onclick="window.app.handleLogin()">로그인 하기</button>
            </div>
        `;
    },

    // 2. 로그인 통신
    async handleLogin() {
        const id = document.getElementById('userId').value;
        const pw = document.getElementById('userPw').value;

        if (pw.length !== 4) return alert("비밀번호 4자리를 입력해주세요.");

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'login', id, pw })
            });
            const res = await response.json();

            if (res.success) {
                this.user = res;
                this.renderDashboard();
            } else {
                alert(res.message);
            }
        } catch (err) {
            console.error(err);
            alert("서버 연결 실패! GAS URL을 확인하세요.");
        }
    },

    // 3. 메인 대시보드
    renderDashboard() {
        document.getElementById('main-nav').classList.remove('hidden');
        document.getElementById('user-display').innerText = this.user.name;
        
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="dashboard" style="width:100%; text-align:left;">
                <h2 style="font-size:40px;">반갑습니다, ${this.user.name}님</h2>
                <div class="menu-grid">
                    <p>도서 대여 및 정보를 확인하실 수 있습니다.</p>
                </div>
            </div>
        `;
    },

    // 4. 로그아웃 (이제 에러가 나지 않습니다)
    logout() {
        if(confirm("정말 로그아웃 하시겠습니까?")) {
            location.reload();
        }
    }
};

// 앱 시작
window.onload = () => window.app.init();
