const app = {
    state: {
        user: null,
        currentPage: 'login'
    },

    init() {
        this.render('login');
    },

    async handleLogin() {
        const id = document.getElementById('userId').value;
        const pw = document.getElementById('userPw').value;

        if (pw.length !== 4) return alert('비밀번호는 숫자 4자리입니다.');

        const res = await api.request('login', { id, pw });
        if (res.success) {
            this.state.user = res;
            this.render(res.role === 'admin' ? 'admin' : 'user');
            document.getElementById('navbar').classList.remove('hidden');
            document.getElementById('user-tag').innerText = `${res.name}님`;
        } else {
            alert('정보가 일치하지 않습니다.');
        }
    },

    render(page) {
        const view = document.getElementById('router-view');
        // HTML 컴포넌트를 직접 생성하거나 Template Literal로 주입
        if (page === 'login') {
            view.innerHTML = `
                <div class="auth-card">
                    <h2>Library Login</h2>
                    <input type="text" id="userId" placeholder="ID">
                    <input type="password" id="userPw" maxlength="4" placeholder="4자리 숫자">
                    <button onclick="app.handleLogin()">접속하기</button>
                </div>
            `;
        }
        // ... user, admin 페이지 렌더링 로직 추가
    },

    logout() {
        location.reload();
    }
};

window.onload = () => app.init();
