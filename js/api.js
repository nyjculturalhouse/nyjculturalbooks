// js/api.js 맨 위
window.GAS_URL = 'https://script.google.com/macros/s/AKfycby8hvXjgaLn8SqlKtM2-PrROvd3q2D5rKqYfPVZTngCfIV2Ep6hGsVidyw6MReGMU_b/exec';

const API = {
    async post(action, data = {}) {
        if (typeof UI !== 'undefined' && UI.showLoading) {
            UI.showLoading();
        }

        const targetUrl = window.GAS_URL;
        
        if (!targetUrl || targetUrl.includes('여기에')) {
            console.error("GAS URL이 설정되지 않았습니다. api.js 상단을 확인하세요.");
            if (typeof UI !== 'undefined' && UI.hideLoading) UI.hideLoading();
            return { success: false, message: "서버 주소 설정 오류" };
        }

        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
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
