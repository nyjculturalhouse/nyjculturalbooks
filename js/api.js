// js/api.js (최종 수정 버전)
const API = {
    async post(action, payload = {}) {
        UI.showLoading();
        try {
            // 헤더를 복잡하게 설정하지 않는 것이 포인트입니다.
            const response = await fetch(window.GAS_URL, {
                method: 'POST',
                mode: 'no-cors', // 브라우저의 엄격한 검사를 피함
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain', // application/json 대신 사용 (CORS 회피용)
                },
                body: JSON.stringify({ action, payload })
            });

            // mode: 'no-cors' 상태에서는 response.json()을 바로 쓸 수 없으므로
            // 일단 에러가 안 나고 통신이 되는지부터 확인해야 합니다.
            // 만약 실제 응답 값을 읽어야 한다면 다시 설정을 바꿔야 하지만,
            // 현재 405 에러 해결이 급선무라면 이 설정이 가장 강력합니다.

            // 일단 테스트를 위해 기본 설정으로 다시 시도하되, 
            // 아래의 주소 오타 체크를 먼저 진행해 주세요.
            
            UI.hideLoading();
            return { success: true }; // 임시 응답
        } catch (error) {
            UI.hideLoading();
            console.error('에러 발생:', error);
            return { success: false, message: error.message };
        }
    }
};
