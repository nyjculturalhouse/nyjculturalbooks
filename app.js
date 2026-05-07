const API_URL = "https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec";

window.app = {
    user: null,

    // 초기 실행
    init() {
        console.log("App 구동 시작");
        this.renderLogin();
    },

    // 1. 로그인 화면
    renderLogin() {
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="card">
                <h1>Library 3.0</h1>
                <p class="subtitle">큰 글씨로 편하게 이용하세요</p>
                <input type="text" id="userId" placeholder="아이디를 입력하세요">
                <input type="password" id="userPw" maxlength="4" placeholder="비밀번호(숫자 4자리)" 
                       oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                <button onclick="window.app.handleLogin()">로그인 하기</button>
            </div>
        `;
    },

    // 2. 로그인 통신 (GAS API 호출)
    async handleLogin() {
        const id = document.getElementById('userId').value;
        const pw = document.getElementById('userPw').value;

        if (!id || pw.length !== 4) {
            alert("아이디와 비밀번호(4자리)를 정확히 입력해주세요.");
            return;
        }

        const btn = document.querySelector('button');
        btn.innerText = "연결 중...";
        btn.disabled = true;

        try {
            // GAS는 POST 요청 시 JSON을 보내야 함
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'login', id, pw })
            });
            const res = await response.json();

            if (res.success) {
                this.user = res;
                this.renderDashboard();
            } else {
                alert(res.message || "로그인 정보를 확인하세요.");
                btn.innerText = "로그인 하기";
                btn.disabled = false;
            }
        } catch (err) {
            console.error(err);
            alert("서버 연결에 실패했습니다. GAS 배포 URL과 시트 권한을 확인하세요.");
            btn.innerText = "로그인 하기";
            btn.disabled = false;
        }
    },

    // 3. 로그인 후 화면
    renderDashboard() {
        document.getElementById('main-nav').classList.remove('hidden');
        document.getElementById('user-display').innerText = this.user.name;
        
        const view = document.getElementById('view');
        view.innerHTML = `
            <div class="card" style="max-width: 900px;">
                <h1>반갑습니다, ${this.user.name}님</h1>
                <p class="subtitle">도서 대출 시스템에 접속하셨습니다.</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <button onclick="alert('준비 중입니다')">도서 대여</button>
                    <button onclick="alert('준비 중입니다')">내 대여 정보</button>
                </div>
            </div>
        `;
    },

    // 4. 로그아웃 기능
    logout() {
        if (confirm("정말 로그아웃 하시겠습니까?")) {
            location.reload();
        }
    }
};

// 페이지 로드 완료 시 앱 실행
window.onload = () => window.app.init();
