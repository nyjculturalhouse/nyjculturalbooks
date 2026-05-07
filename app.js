const API_BASE = "YOUR_DEPLOYED_SCRIPT_URL";

let currentUser = null;

/********************************************************
 * API CORE (핵심 수정 버전)
 ********************************************************/
async function api(action, data = {}) {

  try {

    const formData = new FormData();
    formData.append("action", action);

    for (const key in data) {
      formData.append(key, data[key]);
    }

    const res = await fetch(API_BASE, {
      method: "POST",
      body: formData
    });

    const text = await res.text();

    console.log("RAW:", text);

    if (!text) {
      return { success: false };
    }

    return JSON.parse(text);

  } catch (err) {

    console.error("FETCH ERROR:", err);

    return {
      success: false,
      message: "서버 연결 실패"
    };
  }
}

/********************************************************
 * 로그인
 ********************************************************/
async function login() {

  const id = document.getElementById("loginId").value;
  const password = document.getElementById("loginPw").value;

  const res = await api("login", { id, password });

  if (!res.success) {
    alert(res.message);
    return;
  }

  currentUser = res.user;

  document.getElementById("welcomeText").innerText =
    currentUser.name + "님";

  showSection("userSection");

  loadBooks();
}

/********************************************************
 * 도서 조회
 ********************************************************/
async function loadBooks() {

  const res = await api("getBooks", { keyword: "" });

  const wrap = document.getElementById("bookList");
  wrap.innerHTML = "";

  if (!res.success) return;

  res.books.forEach(b => {

    wrap.innerHTML += `
      <div class="card">
        <h3>${b.title}</h3>
        <p>${b.author}</p>
      </div>
    `;
  });
}

/********************************************************
 * 대여
 ********************************************************/
async function rentBook(isbn) {

  const res = await api("rentBook", {
    isbn,
    userId: currentUser.id
  });

  if (res.success) {
    alert("대여 완료");
    loadBooks();
  }
}
