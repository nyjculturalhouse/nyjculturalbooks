/********************************************************
 * 문화의집 소소책방 - app.js 안정화 버전
 ********************************************************/

console.log("app.js loaded");

/********************************************************
 * 설정
 ********************************************************/

const API_BASE =
"https://script.google.com/macros/s/AKfycbye4QSVyKDjgB3bIcTNglhWcLsyve7v4AGSkzkb3jHJaNbMfuwsV1o85Fd5ymi_VJTZ/exec";

let currentUser = null;
let searchTimer = null;

/********************************************************
 * API
 ********************************************************/

async function api(action, data = {}) {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {

    showLoading(true);

    /******************************************************
     * URLSearchParams 사용
     ******************************************************/

    const params = new URLSearchParams();

    params.append("action", action);

    for (const key in data) {
      params.append(key, data[key]);
    }

    const response = await fetch(API_BASE, {

      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },

      body: params.toString(),

      signal: controller.signal

    });

    clearTimeout(timeout);

    /******************************************************
     * 응답 확인
     ******************************************************/

    if (!response.ok) {

      throw new Error(
        `HTTP ERROR : ${response.status}`
      );
    }

    const text = await response.text();

    console.log("API RESPONSE:", text);

    if (!text) {

      throw new Error("빈 응답");
    }

    /******************************************************
     * JSON 파싱
     ******************************************************/

    let json;

    try {

      json = JSON.parse(text);

    } catch (e) {

      console.error("JSON PARSE ERROR", e);

      throw new Error("JSON 파싱 실패");
    }

    return json;

  } catch (err) {

    console.error("FETCH ERROR:", err);

    if (err.name === "AbortError") {

      showAlert(
        "서버 응답 시간이 초과되었습니다."
      );

    } else {

      showAlert(
        "서버 연결 실패 또는 배포 오류"
      );
    }

    return {
      success: false,
      message: err.message
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
    document.getElementById("loginId")
    .value
    .trim();

  const password =
    document.getElementById("loginPw")
    .value
    .trim();

  if (!id || !password) {

    showAlert(
      "아이디와 비밀번호를 입력하세요."
    );

    return;
  }

  const result = await api("login", {
    id,
    password
  });

  console.log(result);

  if (!result || !result.success) {

    showAlert(
      result?.message || "로그인 실패"
    );

    return;
  }

  currentUser = result.user;

  showSection("userSection");

  document.getElementById("welcomeText")
    .innerText =
    `${currentUser.name}님`;

  document.getElementById("profileName")
    .value =
    currentUser.name;

  setTimeout(() => {

    loadBooks();

  }, 100);

  showToast("로그인 성공");
}

/********************************************************
 * 회원가입
 ********************************************************/

async function signup() {

  const pw =
    document.getElementById("signupPw")
    .value;

  const pw2 =
    document.getElementById("signupPw2")
    .value;

  if (pw !== pw2) {

    showAlert(
      "비밀번호가 일치하지 않습니다."
    );

    return;
  }

  const result = await api("signup", {

    id:
      document.getElementById("signupId")
      .value,

    password:
      document.getElementById("signupPw")
      .value,

    name:
      document.getElementById("signupName")
      .value,

    phone:
      document.getElementById("signupPhone")
      .value
  });

  if (!result || !result.success) {

    showAlert(
      result?.message || "회원가입 실패"
    );

    return;
  }

  showToast("회원가입 완료");

  showSection("loginSection");
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

  if (!result || !result.success) return;

  const wrap =
    document.getElementById("bookList");

  wrap.innerHTML = "";

  if (
    !result.books ||
    result.books.length === 0
  ) {

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
            src="${
              book.cover ||
              "https://placehold.co/300x450?text=No+Image"
            }"
            class="book-cover"
            loading="lazy"
          >

          <div class="card-body d-flex flex-column">

            <h5 class="mb-2">
              ${book.title || "-"}
            </h5>

            <p class="text-muted mb-2">
              ${book.author || "-"}
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

/********************************************************
 * 대여
 ********************************************************/

async function rentBook(isbn) {

  const result = await api("rentBook", {
    isbn,
    userId: currentUser.id
  });

  if (!result || !result.success) {

    showAlert(
      result?.message || "대여 실패"
    );

    return;
  }

  showToast("대여 완료");

  await loadBooks();
}

/********************************************************
 * 내 대여 목록
 ********************************************************/

async function loadMyRentals() {

  const result = await api("getMyRentals", {
    userId: currentUser.id
  });

  if (!result || !result.success) return;

  console.log(result);
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

  document
    .querySelectorAll("section")
    .forEach(section => {

      section.classList.add("d-none");
    });

  document
    .getElementById(id)
    .classList.remove("d-none");
}

/********************************************************
 * 로딩
 ********************************************************/

function showLoading(show) {

  const el =
    document.getElementById(
      "loadingOverlay"
    );

  if (!el) return;

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

  const toastBody =
    document.getElementById("toastBody");

  if (toastBody) {

    toastBody.innerText = message;
  }

  const toastEl =
    document.getElementById("mainToast");

  if (toastEl) {

    const toast =
      new bootstrap.Toast(toastEl);

    toast.show();
  }
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
