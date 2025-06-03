const users = {
  KUNAL: { password: "123", attendance: 82.54, feeDue: 0 },
  OM: { password: "123", attendance: 75.2, feeDue: 1000 },
  ADMIN: { password: "456" }
};

let loggedInUser = "";
let isAdmin = false;

function handleLogin(e) {
  e.preventDefault();
  const uname = document.getElementById("username").value.trim().toUpperCase();
  const pass = document.getElementById("password").value.trim();

  if (users[uname] && users[uname].password === pass) {
    loggedInUser = uname;
    isAdmin = uname === "ADMIN";

    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("welcomeText").textContent = `Welcome, ${uname}!`;

    if (isAdmin) {
      showAdminPanel();
    } else {
      showStudentPanel(uname);
    }
  } else {
    alert("Invalid credentials.");
  }
}

function showStudentPanel(name) {
  const data = users[name];
  document.getElementById("studentMain").style.display = "grid";
  document.getElementById("adminMain").style.display = "none";
  document.getElementById("attendanceValue").textContent = data.attendance + "%";
  document.getElementById("feeValue").textContent = "₹" + data.feeDue;
}

function showAdminPanel() {
  document.getElementById("adminMain").style.display = "block";
  document.getElementById("studentMain").style.display = "none";

  const select = document.getElementById("studentSelect");
  select.innerHTML = "";
  for (let user in users) {
    if (user !== "ADMIN") {
      const opt = document.createElement("option");
      opt.value = user;
      opt.textContent = user;
      select.appendChild(opt);
    }
  }

  select.addEventListener("change", loadSelectedData);
  loadSelectedData();
}

function loadSelectedData() {
  const selected = document.getElementById("studentSelect").value;
  document.getElementById("attendanceInput").value = users[selected].attendance || 0;
  document.getElementById("feeInput").value = users[selected].feeDue || 0;
}

function saveStudentData() {
  const student = document.getElementById("studentSelect").value;
  users[student].attendance = parseFloat(document.getElementById("attendanceInput").value);
  users[student].feeDue = parseFloat(document.getElementById("feeInput").value);
  alert("Saved successfully.");
}

function handleLogout() {
  loggedInUser = "";
  isAdmin = false;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login").style.display = "flex";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
}

function goToPayment() {
  alert("Redirecting to payment page (not implemented here).");
}

function viewReceipt() {
  alert("Showing payment receipt (not implemented here).");
}

// Three-dot menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menuBtn");
  const menu = document.getElementById("menuOptions");
  btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });
});
