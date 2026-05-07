let state = {
  books: [],
  user: null
};

// =======================
// 화면 전환
// =======================
function view(page) {
  const content = document.getElementById("content");

  if (page === "books") {
    loadBooks();
  }

  if (page === "users") {
    content.innerHTML = `<div class="card">회원 관리 (추가 개발 영역)</div>`;
  }

  if (page === "rentals") {
    content.innerHTML = `<div class="card">대여 현황 (추가 개발 영역)</div>`;
  }
}

// =======================
// 도서 로드 (카드 UI)
// =======================
function loadBooks() {
  google.script.run.withSuccessHandler(list => {

    let html = "";

    list.forEach(b => {
      html += `
        <div class="card">
          <div style="display:flex;justify-content:space-between;">
            <div>
              <b>${b.title}</b><br>
              <small>${b.author}</small>
            </div>

            <span class="badge">${b.status}</span>
          </div>

          <div style="margin-top:10px;">
            <button class="btn" onclick="rent('${b.isbn}','${b.title}')">
              대여
            </button>
          </div>
        </div>
      `;
    });

    document.getElementById("content").innerHTML = html;
    document.getElementById("title").innerText = "📖 도서 관리";

  }).getBooks();
}

// =======================
// 대여
// =======================
function rent(isbn, title) {
  google.script.run.withSuccessHandler(() => {
    loadBooks();
  }).rentBook(isbn, "사용자", title);
}

// =======================
// 로그아웃
// =======================
function logout() {
  location.reload();
}
