window.GAS_URL = 'https://script.google.com/macros/s/AKfycby8hvXjgaLn8SqlKtM2-PrROvd3q2D5rKqYfPVZTngCfIV2Ep6hGsVidyw6MReGMU_b/exec';

const API = {
    async post(action, data = {}) {
        if (typeof UI !== 'undefined' && UI.showLoading) UI.showLoading();

        try {
            const response = await fetch(window.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action, data })
            });

            if (!response.ok) throw new Error(`네트워크 에러: ${response.status}`);
            const result = await response.json();
            
            if (typeof UI !== 'undefined' && UI.hideLoading) UI.hideLoading();
            console.log(`[API ${action}] 응답:`, result);
            return result;
        } catch (error) {
            if (typeof UI !== 'undefined' && UI.hideLoading) UI.hideLoading();
            console.error(`[API ${action}] 에러:`, error);
            return { success: false, message: "서버 연결 실패: " + error.message };
        }
    },

    async getBooks() {
        return await this.post('getBooks', {});
    },

    async rentBook(book) {
        // localStorage의 currentUser에서 정확히 정보를 가져옵니다.
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const userId = user ? (user.아이디 || user.id || 'guest') : 'guest';

        return await this.post('rentBook', { 
            ISBN: book.ISBN, 
            도서명: book.도서명,
            userId: userId
        });
    }
};
