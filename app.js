/********************************************************
 * 문화의집 소소책방 - app.js 최적화 버전
 ********************************************************/

console.log("app.js loaded");

/********************************************************
 * 설정
 ********************************************************/

const API_BASE =
"https://script.google.com/macros/s/AKfycbztPxTTM2LCEdIYJT10IamQ4NeCgVQYDL9Ibj7HTxjrqpGOiGDnwMnfCyjtz0m3Xm7W/exec";

let currentUser = null;
let searchTimer = null;

/********************************************************
 * API
 ********************************************************/

async function api(action, data = {}) {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {

    showLoading(true);

    const formData = new URLSearchParams();

    formData.append("action", action);

    for (const key in data) {
      formData.append(key, data[key]);
    }

const response = await fetch(API_BASE, {

  method: "POST",

  headers: {
    "Content-Type":
      "application/x-www-form-urlencoded"
  },

  body: formData.toString(),

  signal: controller.signal
});

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error("서버 연결 실패");
    }

    const text = await response.text();

    console.log("API RESPONSE:", text);

    return JSON.parse(text);

  } catch (err) {

    console.error(err);

    showAlert(
      "네트워크 오류 또는 서버 응답 실패"
    );

    return {
      success: false
    };

  } finally {

    showLoading(false);
  }
}

/********************************************************
 * 로그인
 ********************************************************/

async function login() {

  const id =
    document.getElementById("loginId").value.trim();

  const password =
    document.getElementById("loginPw").value.trim();

  if (!id || !password) {

    showAlert("아이디와 비밀번호를 입력하세요.");
    return;
  }

  const result = await api("login", {
    id,
    password
  });

  if (!result.success) {

    showAlert(result.message || "로그인 실패");
    return;
  }

  currentUser = result.user;

  showSection("userSection");

  document.getElementById("welcomeText").innerText =
    `${currentUser.name}님`;

  document.getElementById("profileName").value =
    currentUser.name;

  await loadBooks();
}

/********************************************************
 * 회원가입
 ********************************************************/

async function signup() {

  const pw =
    document.getElementById("signupPw").value;

  const pw2 =
    document.getElementById("signupPw2").value;

  if (pw !== pw2) {

    showAlert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const result = await api("signup", {

    id:
      document.getElementById("signupId").value,

    password:
      document.getElementById("signupPw").value,

    name:
      document.getElementById("signupName").value,

    phone:
      document.getElementById("signupPhone").value
  });

  if (!result.success) {

    showAlert(result.message);
    return;
  }

  showToast("회원가입 완료");

  showSection("loginSection");
}

/********************************************************
 * 비밀번호 체크
 ********************************************************/

function checkPasswordMatch() {

  const pw =
    document.getElementById("signupPw").value;

  const pw2 =
    document.getElementById("signupPw2").value;

  const text =
    document.getElementById("pwCheckText");

  if (!pw2) {

    text.innerHTML = "";
    return;
  }

  if (pw === pw2) {

    text.innerHTML = "비밀번호가 일치합니다.";
    text.style.color = "green";

  } else {

    text.innerHTML =
      "비밀번호가 일치하지 않습니다.";

    text.style.color = "red";
  }
}

/********************************************************
 * 검색 debounce
 ********************************************************/

function debouncedSearch() {

  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {

    loadBooks();

  }, 400);
}

/********************************************************
 * 도서 조회
 ********************************************************/

async function loadBooks() {

  const keyword =
    document.getElementById("searchInput")
    ?.value || "";

  const result = await api("getBooks", {
    keyword
  });

  if (!result.success) return;

  const wrap =
    document.getElementById("bookList");

  wrap.innerHTML = "";

  if (!result.books || result.books.length === 0) {

    wrap.innerHTML = `
      <div class="col-12">

        <div class="alert alert-secondary">

          검색 결과가 없습니다.

        </div>

      </div>
    `;

    return;
  }

  result.books.forEach(book => {

    wrap.innerHTML += `

      <div class="col-lg-3 col-md-4 col-12 mb-4">

        <div class="card book-card h-100">

          <img
            src="${book.cover || 'https://placehold.co/300x450?text=No+Image'}"
            class="book-cover"
            loading="lazy"
          >

          <div class="card-body d-flex flex-column">

            <h5 class="mb-2">
              ${book.title || '-'}
            </h5>

            <p class="text-muted mb-2">
              ${book.author || '-'}
            </p>

            <div class="mb-3">

              <span class="badge ${
                book.status === "대여 가능"
                ? "bg-success"
                : "bg-danger"
              }">

                ${book.status}

              </span>

            </div>

            <button
              class="btn btn-main mt-auto"
              onclick="rentBook('${book.isbn}')"
              ${
                book.status !== "대여 가능"
                ? "disabled"
                : ""
              }
            >
              대여하기
            </button>

          </div>

        </div>

      </div>
    `;
  });
}

function showBooksTab() {

  showUserTab("booksTab");
}

/********************************************************
 * 대여
 ********************************************************/

async function rentBook(isbn) {

  const result = await api("rentBook", {
    isbn,
    userId: currentUser.id
  });

  if (!result.success) {

    showAlert(result.message);
    return;
  }

  showToast("대여 완료");

  await loadBooks();
}

/********************************************************
 * 내 대여 탭
 ********************************************************/

async function openRentalsTab() {

  showUserTab("rentalsTab");

  await loadMyRentals();
}

/********************************************************
 * 내 대여 목록
 ********************************************************/

async function loadMyRentals() {

  const result = await api("getMyRentals", {
    userId: currentUser.id
  });

  if (!result.success) return;

  const wrap =
    document.getElementById("rentalList");

  wrap.innerHTML = "";

  const rentals = result.rentals || [];

  document.getElementById(
    "rentalCountBadge"
  ).innerText =
    `대여 ${rentals.length}권`;

  if (rentals.length === 0) {

    wrap.innerHTML = `
      <div class="col-12">

        <div class="alert alert-secondary">

          현재 대여중인 도서가 없습니다.

        </div>

      </div>
    `;

    return;
  }

  rentals.forEach(item => {

    wrap.innerHTML += `

      <div class="col-md-4 mb-4">

        <div class="card book-card h-100">

          <img
            src="${item.cover}"
            class="book-cover"
            loading="lazy"
          >

          <div class="card-body d-flex flex-column">

            <h5>
              ${item.title}
            </h5>

            <p class="text-muted">

              반납기한:
              ${formatDate(item.dueDate)}

            </p>

            <button
              class="btn btn-outline-danger mt-auto"
              onclick="returnBook('${item.rentalId}')"
            >
              반납하기
            </button>

          </div>

        </div>

      </div>
    `;
  });
}

/********************************************************
 * 반납
 ********************************************************/

async function returnBook(rentalId) {

  const result = await api("returnBook", {
    rentalId
  });

  if (!result.success) {

    showAlert(result.message);
    return;
  }

  showToast("반납 완료");

  await loadMyRentals();
  await loadBooks();
}

/********************************************************
 * 프로필 수정
 ********************************************************/

async function updateProfile() {

  const result = await api("updateProfile", {

    id: currentUser.id,

    name:
      document.getElementById("profileName")
      .value,

    password:
      document.getElementById("profilePw")
      .value
  });

  if (!result.success) {

    showAlert(result.message);
    return;
  }

  showToast("수정 완료");
}

/********************************************************
 * 회원 탈퇴
 ********************************************************/

async function deleteUser() {

  if (!confirm("정말 탈퇴하시겠습니까?")) {
    return;
  }

  const result = await api("deleteUser", {
    id: currentUser.id
  });

  if (!result.success) {

    showAlert(result.message);
    return;
  }

  showToast("회원 탈퇴 완료");

  logout();
}

/********************************************************
 * 로그아웃
 ********************************************************/

function logout() {

  currentUser = null;

  showSection("loginSection");
}

/********************************************************
 * 섹션 전환
 ********************************************************/

function showSection(id) {

  document.querySelectorAll("section")
    .forEach(section => {

      section.classList.add("d-none");
    });

  document.getElementById(id)
    .classList.remove("d-none");
}

/********************************************************
 * 사용자 탭
 ********************************************************/

function showUserTab(id) {

  [
    "booksTab",
    "rentalsTab",
    "profileTab"
  ].forEach(tab => {

    document.getElementById(tab)
      .classList.add("d-none");
  });

  document.getElementById(id)
    .classList.remove("d-none");
}

/********************************************************
 * 로딩
 ********************************************************/

function showLoading(show) {

  const el =
    document.getElementById("loadingOverlay");

  if (show) {

    el.classList.remove("d-none");

  } else {

    el.classList.add("d-none");
  }
}

/********************************************************
 * Toast
 ********************************************************/

function showToast(message) {

  document.getElementById("toastBody")
    .innerText = message;

  const toast = new bootstrap.Toast(
    document.getElementById("mainToast")
  );

  toast.show();
}

/********************************************************
 * Alert
 ********************************************************/

function showAlert(message) {

  const div =
    document.createElement("div");

  div.className =
    "alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3";

  div.style.zIndex = 9999;

  div.innerText = message;

  document.body.appendChild(div);

  setTimeout(() => {

    div.remove();

  }, 3000);
}

/********************************************************
 * 날짜 포맷
 ********************************************************/

function formatDate(date) {

  if (!date) return "-";

  return new Date(date)
    .toLocaleDateString("ko-KR");
}
