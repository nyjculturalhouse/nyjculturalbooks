const API_URL = "https://script.google.com/macros/s/AKfycbw5vspw7XRViRduRAEPJaY7uHpRGCaLwB8xRylGmkcBfZGGGgrXtpIqNHJ4zI4xiJfp/exec";

/* =========================
   BOOKS
========================= */
async function loadBooks() {

  const res = await fetch(API_URL + "?action=books");
  const data = await res.json();

  let html = "";

  data.forEach(b => {
    html += `
      <div class="card">
        <b>${b.title}</b><br>
        <small>${b.author}</small>
        <div>${b.status}</div>
      </div>
    `;
  });

  document.getElementById("app").innerHTML = html;
}

/* =========================
   LOGIN
========================= */
async function login() {

  const id = prompt("ID");
  const pw = prompt("PW");

  const res = await fetch(`${API_URL}?action=login&id=${id}&pw=${pw}`);
  const data = await res.json();

  alert(data.success ? "로그인 성공" : "실패");
}

/* =========================
   RENT
========================= */
async function rent(isbn, user) {

  await fetch(`${API_URL}?action=rent&isbn=${isbn}&user=${user}`);

  alert("대여 완료");
}
