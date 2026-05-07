const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec';

const api = {
    async request(action, data = {}) {
        const payload = { action, ...data };
        try {
            const response = await fetch(GAS_API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: '네트워크 오류가 발생했습니다.' };
        }
    }
};
