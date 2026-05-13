const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        try {
            // 주소 뒤에 빈 공백이 없는지 window.GAS_URL을 사용합니다.
            const response = await fetch(window.GAS_URL, {
                method: 'POST',
                // 헤더를 너무 복잡하게 설정하지 않는 것이 GAS에서는 더 잘 작동합니다.
                body: JSON.stringify({ action, payload })
            });

            // GAS 응답은 보통 자동으로 리다이렉트되므로 response.json()으로 바로 읽습니다.
            const result = await response.json();
            
            UI.hideLoading();
            return result; 
        } catch (error) {
            UI.hideLoading();
            console.error('API 통신 에러:', error);
            
            // 만약 여기서 다시 405나 JSON 에러가 난다면 
            // 100% GAS 배포 설정(모든 사용자 권한) 문제입니다.
            return { success: false, message: '서버 연결에 실패했습니다.' };
        }
    }
};
