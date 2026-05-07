/********************************************************
 * 설정
 ********************************************************/

const API_BASE =
"https://script.google.com/macros/s/AKfycbxa-cTQvrUdl3AJG7O4Y8fd7rsTnMA7GDeulT0heglX6yO7UJ5PxvFNdCVQ6hJlFnNU/exec";

let currentUser = null;

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
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error("네트워크 오류");
    }

    return await response.json();

  } catch (err) {

    showAlert(err.message);

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

  const id = document.getElementById("loginId").value;
  const password = document.getElementById("loginPw").value;

  const result = await api("login", {
    id,
    password
  });

  if (!result.success) {
    showAlert(result.message);
    return;
  }

  currentUser = result.user;

  showToast("로그인 성공");

  showSection("userSection");

  document.getElementById("welcomeText").innerText =
    currentUser.name + "님";

  document.getElementById("profileName").value =
    currentUser.name;

  loadBooks();
  loadMyRentals();
}

/********************************************************
 * 회원가입
 ********************************************************/

async function signup() {

  const pw = document.getElementById("signupPw").value;
  const pw2 = document.getElementById("signupPw2").value;

  if (pw !== pw2) {
    showAlert("비밀번호가 일치하지 않습니다.");
    return;
  }

  const result = await api("signup", {
    id: signupId.value,
    password: signupPw.value,
    name: signupName.value,
    phone: signupPhone.value
  });

  if (result.success) {

    showToast("회원가입 완료");

    showSection("loginSection");
  }
}

/********************************************************
 * 비밀번호 체크
 ********************************************************/

function checkPasswordMatch() {

  const pw = signupPw.value;
  const pw2 = signupPw2.value;

  const text = document.getElementById("pwCheckText");

  if (pw === pw2) {

    text.innerHTML = "비밀번호가 일치합니다.";
    text.style.color = "green";

  } else {

    text.innerHTML = "비밀번호가 일치하지 않습니다.";
    text.style.color = "red";
  }
}

/********************************************************
 * 도서 조회
 ********************************************************/

async function loadBooks() {

  const keyword = searchInput.value;

  const result = await api("getBooks", {
    keyword
  });

  if (!result.success) return;

  const wrap = document.getElementById("bookList");

  wrap.innerHTML = "";

  result.books.forEach(book => {

    wrap.innerHTML += `
      <div class="col-lg-3 col-md-4 col-12 mb-4">
        <div class="card book-card h-100">

          <img src="${book.cover}" class="book-cover">

          <div class="card-body">

            <h5>${book.title}</h5>

            <p>${book.author}</p>

            <span class="badge ${
              book.status === "대여 가능"
              ? "bg-success"
              : "bg-danger"
            }">
              ${book.status}
            </span>

            <button
              class="btn btn-main w-100 mt-3"
              onclick="rentBook('${book.isbn}')"
              ${book.status !== "대여 가능" ? "disabled" : ""}
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

  if (result.success) {

    showToast("대여 완료");

    loadBooks();
    loadMyRentals();
  }
}

/********************************************************
 * 내 대여 목록
 ********************************************************/

async function loadMyRentals() {

  showUserTab("rentalsTab");

  const result = await api("getMyRentals", {
    userId: currentUser.id
  });

  if (!result.success) return;

  const wrap = document.getElementById("rentalList");

  wrap.innerHTML = "";

  document.getElementById("rentalCountBadge").innerText =
    `대여 ${result.rentals.length}권`;

  result.rentals.forEach(item => {

    wrap.innerHTML += `
      <div class="col-md-4 mb-4">

        <div class="card book-card">

          <img src="${item.cover}" class="book-cover">

          <div class="card-body">

            <h5>${item.title}</h5>

            <p>반납기한: ${formatDate(item.dueDate)}</p>

            <button
              class="btn btn-outline-danger w-100"
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

  if (result.success) {

    showToast("반납 완료");

    loadMyRentals();
    loadBooks();
  }
}

/********************************************************
 * 프로필 수정
 ********************************************************/

async function updateProfile() {

  const result = await api("updateProfile", {
    id: currentUser.id,
    name: profileName.value,
    password: profilePw.value
  });

  if (result.success) {

    showToast("수정 완료");
  }
}

/********************************************************
 * 회원 탈퇴
 ********************************************************/

async function deleteUser() {

  if (!confirm("정말 탈퇴하시겠습니까?")) return;

  const result = await api("deleteUser", {
    id: currentUser.id
  });

  if (result.success) {

    showToast("회원 탈퇴 완료");

    logout();
  }
}

/********************************************************
 * 로그아웃
 ********************************************************/

function logout() {

  currentUser = null;

  showSection("loginSection");
}

/********************************************************
 * UI
 ********************************************************/

function showSection(id) {

  document.querySelectorAll("section").forEach(section => {
    section.classList.add("d-none");
  });

  document.getElementById(id).classList.remove("d-none");
}

function showUserTab(id) {

  ["booksTab", "rentalsTab", "profileTab"]
  .forEach(tab => {
    document.getElementById(tab).classList.add("d-none");
  });

  document.getElementById(id).classList.remove("d-none");
}

function showLoading(show) {

  const el = document.getElementById("loadingOverlay");

  if (show) {
    el.classList.remove("d-none");
  } else {
    el.classList.add("d-none");
  }
}

function showToast(message) {

  document.getElementById("toastBody").innerText = message;

  const toast =
    new bootstrap.Toast(document.getElementById("mainToast"));

  toast.show();
}

function showAlert(message) {

  const div = document.createElement("div");

  div.className =
    "alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3";

  div.style.zIndex = 9999;

  div.innerText = message;

  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

function formatDate(date) {

  return new Date(date).toLocaleDateString("ko-KR");
}
