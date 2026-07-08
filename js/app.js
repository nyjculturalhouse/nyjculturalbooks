// app.js

// 1. 중복 제출 방지를 위한 상태 변수
let isSubmitting = false;

// 로그인 상태 체크
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// 탭 전환 공통 로직
function setupTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target') || item.getAttribute('data-tab');
            if (!targetId) return;

            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');

            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle) pageTitle.innerText = item.innerText.trim();
        });
    });
}

/**
 * 출석 제출 함수 (중복 제출 방지 로직 포함)
 */
window.submitAttendance = async () => {
    // 1. 이미 제출 중이면 함수 종료
    if (isSubmitting) {
        console.warn("이미 제출 처리 중입니다.");
        return;
    }

    const btn = document.querySelector('button[onclick="window.submitAttendance()"]');
    if (!btn) return;

    // 2. 버튼 상태를 '제출 중'으로 변경 (UI 잠금)
    isSubmitting = true;
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    btn.innerText = "제출 중...";

    try {
        // [중요] 여기에 실제 API 호출 로직을 연결하세요.
        // 예: const result = await API.post('submitAttendance', { ...데이터... });
        
        console.log("출석 데이터 전송 시도...");
        
        // 시뮬레이션용 대기 (실제 API 연결 시 제거 가능)
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        // 결과에 따른 처리 로직
        // if (result.success) { ... }
        
    } catch (error) {
        console.error("출석 제출 중 오류 발생:", error);
    } finally {
        // 3. 완료 후 상태 초기화
        isSubmitting = false;
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.innerText = originalText;
    }
};
