// js/api.js 맨 위

// 다른 파일에서 window.GAS_URL을 못 가져오는 문제를 방지하기 위해 직접 선언
window.GAS_URL = 'https://script.google.com/macros/s/AKfycby8hvXjgaLn8SqlKtM2-PrROvd3q2D5rKqYfPVZTngCfIV2Ep6hGsVidyw6MReGMU_b/exec';

const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        // 주소가 undefined인지 여기서 최종 확인
        const targetUrl = window.GAS_URL || 'https://script.google.com/macros/s/AKfycby8hvXjgaLn8SqlKtM2-PrROvd3q2D5rKqYfPVZTngCfIV2Ep6hGsVidyw6MReGMU_b/exec';
        
        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                body: JSON.stringify({ action, payload })
            });
            
            // 응답이 오면 JSON으로 파싱
            const result = await response.json();
            UI.hideLoading();
            return result;
        } catch (error) {
            UI.hideLoading();
            console.error('상세 에러:', error);
            return { success: false, message: "서버 응답 오류" };
        }
    }
};
