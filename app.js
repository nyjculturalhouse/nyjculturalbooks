const API_URL = "https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec";

document.addEventListener('DOMContentLoaded', () => {
    // 버튼 연결 (이벤트 리스너)
    document.getElementById('nav-search').addEventListener('click', () => switchView('view-search'));
    document.getElementById('nav-join').addEventListener('click', () => switchView('view-join'));
    document.getElementById('nav-login').addEventListener('click', () => switchView('view-login'));
    document.getElementById('btn-home').addEventListener('click', () => location.reload());

    // 도서 검색 로직
    document.getElementById('btn-search-exec').addEventListener('click', async () => {
        const query = document.getElementById('search-input').value;
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'getBooks' }) });
        const books = await res.json();
        const filtered = books.filter(b => b.제목.includes(query) || b.저자.includes(query));
        
        document.getElementById('search-results').innerHTML = filtered.map(b => `
            <div class="rental-item">
                <div><b>${b.제목}</b><br><small>${b.저자}</small></div>
                <div style="color:${b.대여상태 === '대여가능' ? '#2ECC71' : '#E74C3C'}">${b.대여상태}</div>
            </div>
        `).join('');
    });

    // 회원가입 로직
    document.getElementById('btn-join-exec').addEventListener('click', async () => {
        const data = {
            name: document.getElementById('j-name').value,
            phone: document.getElementById('j-phone').value,
            pw: document.getElementById('j-pw').value
        };
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'join', data: data }) });
        const result = await res.json();
        alert(`가입 성공! 회원번호는 ${result.memberId} 입니다.`);
        location.reload();
    });

    // 로그인 및 마이페이지 로딩
    document.getElementById('btn-login-exec').addEventListener('click', async () => {
        const id = document.getElementById('l-id').value;
        const pw = document.getElementById('l-pw').value;
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'login', id, pw }) });
        const result = await res.json();

        if (result.success) {
            switchView('view-mypage');
            document.getElementById('user-name').innerText = `${result.name} 님의 독서 기록부`;
            loadMyData(id);
        } else {
            alert(result.message);
        }
    });
});

async function loadMyData(userId) {
    const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'getMyRentals', id: userId }) });
    const result = await res.json();
    const { current, stats } = result.data;

    // 분야별 통계 (제안서 분석 기능 반영)
    document.getElementById('stats-area').innerHTML = Object.entries(stats).map(([name, count]) => `
        <div class="stats-box">${name}: ${count}권</div>
    `).join('');

    // 현재 대여 목록 (스카이블루 강조 반영)
    document.getElementById('current-list').innerHTML = current.length ? current.map(r => `
        <div class="rental-item overdue">
            <div><b>${r.도서명}</b><br><small>반납예정: ${r.반납예정일}</small></div>
            <div style="color:var(--sky); font-weight:bold;">대여 중</div>
        </div>
    `).join('') : "현재 대여 중인 책이 없습니다.";
}

function switchView(id) {
    document.querySelectorAll('.container > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('btn-home').classList.remove('hidden');
}
