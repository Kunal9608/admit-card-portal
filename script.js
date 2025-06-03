// User Data (example)
const users = {
  "KUNAL": { password: "123", attendance: 82.54, feeDue: 0 },
  "OM": { password: "123", attendance: 75.20, feeDue: 1000 },
  "AKSHAT": { password: "123", attendance: 88.90, feeDue: 500 },
  "ADMIN": { password: "456" },
  "ROHAN": { password: "789" }
};

let loggedInUser = "";
let isAdmin = false;

function handleLogin(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('username').value.trim().toUpperCase();
  const passwordInput = document.getElementById('password').value.trim();

  if (users[usernameInput] && users[usernameInput].password === passwordInput) {
    loggedInUser = usernameInput;
    isAdmin = (usernameInput === "ADMIN" || usernameInput === "ROHAN");

    document.getElementById('login').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    if (isAdmin) {
      // Show admin panel (if implemented)
      document.getElementById('studentMain').style.display = 'none';
    } else {
      // Show student panel
      showStudentPanel(loggedInUser);
    }
  } else {
    alert("❌ Invalid username or password.");
  }
}

function showStudentPanel(name) {
  document.getElementById('studentWarning').style.display = 'block';
  document.getElementById('studentMain').style.display = 'grid';

  const attendanceValue = document.getElementById('attendanceValue');
  const feeValue = document.getElementById('feeValue');
  const downloadLink = document.getElementById('downloadLink');

  attendanceValue.textContent = users[name].attendance.toFixed(2) + "%";
  feeValue.textContent = "Rs. " + users[name].feeDue.toFixed(2);

  downloadLink.href = `AdmitCard_${name}.pdf`;
  downloadLink.download = `AdmitCard_${name}.pdf`;
}

function forgotPassword() {
  alert("📩 Please contact admin or visit helpdesk to reset your password.");
}

function handleLogout() {
  loggedInUser = "";
  isAdmin = false;
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('login').style.display = 'flex';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}
