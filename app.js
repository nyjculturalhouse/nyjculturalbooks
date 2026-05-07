const API_BASE = "https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec";

async function api(action, data = {}) {

  try {

    const form = new FormData();
    form.append("action", action);

    Object.keys(data).forEach(k => {
      form.append(k, data[k]);
    });

    const res = await fetch(API_BASE, {
      method: "POST",
      body: form
    });

    const text = await res.text();

    return JSON.parse(text);

  } catch (err) {

    console.error(err);

    return {
      success: false,
      message: "서버 연결 실패"
    };
  }
}
