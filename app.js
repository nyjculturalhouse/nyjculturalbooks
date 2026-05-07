const API_BASE = "https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec";

let currentUser = null;
let searchTimer = null;

/* =========================
   API CORE
========================= */
async function api(action, data = {}) {

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {

    const form = new FormData();
    form.append("action", action);

    Object.keys(data).forEach(k => form.append(k, data[k]));

    const res = await fetch(API_BASE, {
      method: "POST",
      body: form,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const text = await res.text();

    console.log("API:", text);

    if (!text) throw new Error("empty response");

    return JSON.parse(text);

  } catch (err) {

    console.error("API ERROR:", err);

    return {
      success: false,
      message: err.name === "AbortError"
        ? "응답 시간 초과"
        : "서버 연결 실패"
    };
  }
}

/* =========================
   LOGIN
========================= */
async function login() {

  const id = document.getElementById("loginId").value.trim();
  const pw = document.getElementById("loginPw").value.trim();

  if (!id || !pw) return alert("아이디/비밀번호 입력");

  const res = await api("login", { id, password: pw });

  if (!res.success) return alert(res.message);

  currentUser = res.user;

  document.getElementById("welcomeText").innerText = currentUser.name + "님";

  showSection("userSection");
  loadBooks();
}

/* =========================
   SIGNUP
========================= */
async function signup() {

  const pw = document.getElementById("signupPw").value;
  const pw2 = document.getElementById("signupPw2").value;

  if (pw !== pw2) return alert("비밀번호 불일치");

  const res = await api("signup", {
    id: document.getElementById("signupId").value,
    password: pw,
    name: document.getElementById("signupName").value,
    phone: document.getElementById("signupPhone").value
  });

  if (!res.success) return alert(res.message);

  alert("회원가입 완료");
  showSection("loginSection");
}

/* =========================
   BOOKS
========================= */
async function loadBooks() {

  const keyword = document.getElementById("searchInput").value;

  const res = await api("getBooks", { keyword });

  const wrap = document.getElementById("bookList");
  wrap.innerHTML = "";

  if (!res.books?.length) {
    wrap.innerHTML = "<div class='alert alert-secondary'>없음</div>";
    return;
  }

  res.books.forEach(b => {

    wrap.innerHTML += `
      <div class="col-md-3 mb-3">
        <div class="card">
          <img src="${b.cover}" class="img-fluid">
          <div class="card-body">
            <h5>${b.title}</h5>
            <button onclick="rentBook('${b.isbn}')" class="btn btn-primary">
              대여
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

/* =========================
   RENT
========================= */
async function rentBook(isbn) {

  const res = await api("rentBook", {
    isbn,
    userId: currentUser.id
  });

  if (!res.success) return alert(res.message);

  alert("대여 완료");
  loadBooks();
}

/* =========================
   RETURN
========================= */
async function returnBook(rentalId) {

  const res = await api("returnBook", { rentalId });

  if (!res.success) return alert(res.message);

  loadBooks();
}

/* =========================
   RENTALS
========================= */
async function loadMyRentals() {

  const res = await api("getMyRentals", {
    userId: currentUser.id
  });

  const wrap = document.getElementById("rentalList");
  wrap.innerHTML = "";

  const list = res.rentals || [];

  document.getElementById("rentalCountBadge").innerText =
    `대여 ${list.length}권`;

  list.forEach(r => {

    wrap.innerHTML += `
      <div class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body">
            <h5>${r.title}</h5>
            <button onclick="returnBook('${r.rentalId}')" class="btn btn-danger">
              반납
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

/* =========================
   UI
========================= */
function showSection(id) {

  document.querySelectorAll("section")
    .forEach(s => s.classList.remove("active"));

  document.getElementById(id).classList.add("active");
}

function showUserTab(id) {

  ["booksTab", "rentalsTab", "profileTab"]
    .forEach(t => document.getElementById(t).classList.add("d-none"));

  document.getElementById(id).classList.remove("d-none");
}

function logout() {
  currentUser = null;
  showSection("loginSection");
}

/* =========================
   SEARCH
========================= */
function debouncedSearch() {

  clearTimeout(searchTimer);

  searchTimer = setTimeout(loadBooks, 300);
}
