// js/api.js 맨 위
// 배포된 구글 앱스 스크립트의 웹 앱 URL을 전역으로 선언합니다.
window.GAS_URL = 'https://script.google.com/macros/s/AKfycby8hvXjgaLn8SqlKtM2-PrROvd3q2D5rKqYfPVZTngCfIV2Ep6hGsVidyw6MReGMU_b/exec';

const API = {
    /**
     * GAS 서버로 데이터를 전송하는 공통 함수
     * @param {string} action - 서버에서 실행할 액션 이름 (예: 'login', 'signup', 'getBooks')
     * @param {object} data - 서버로 보낼 데이터 객체
     */
    async post(action, data = {}) {
        // UI 로딩 바 표시 (UI 객체가 정의되어 있어야 합니다)
        if (typeof UI !== 'undefined' && UI.showLoading) {
            UI.showLoading();
        }

        // 주소 확인 (전역 변수 확인 후 없으면 기본값 사용)
        const targetUrl = window.GAS_URL;
        
        if (!targetUrl || targetUrl.includes('여기에')) {
            console.error("GAS URL이 설정되지 않았습니다. api.js 상단을 확인하세요.");
            if (typeof UI !== 'undefined' && UI.hideLoading) UI.hideLoading();
            return { success: false, message: "서버 주소 설정 오류" };
        }

        try {
            // 중요: GAS 통신 시 'text/plain'을 사용하여 CORS Preflight(OPTIONS 요청)를 방지합니다.
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                // 서버 코드가 'data' 키로 받도록 구조를 맞춤
                body: JSON.stringify({ action, data })
            });

            if (!response.ok) {
                throw new Error(`네트워크 응답 에러: ${response.status}`);
            }

            const result = await response.json();
            
            if (typeof UI !== 'undefined' && UI.hideLoading) {
                UI.hideLoading();
            }
            
            console.log(`[API ${action}] 응답:`, result);
            return result;

        } catch (error) {
            if (typeof UI !== 'undefined' && UI.hideLoading) {
                UI.hideLoading();
            }
            
            console.error(`[API ${action}] 상세 에러:`, error);
            return { 
                success: false, 
                message: "서버 연결 실패: " + error.message 
            };
        }
    }
};
