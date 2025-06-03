// Users data (simulate backend)
const users = {
  "KUNAL": { password: "123", attendance: 82.54, feeDue: 1000 },
  "OM": { password: "123", attendance: 75.20, feeDue: 500 },
  "AKSHAT": { password: "123", attendance: 88.90, feeDue: 0 },
  "ADMIN": { password: "456" }
};

let loggedInUser = null;
let lastPaymentAmount = 0;

const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginDiv = document.getElementById('login');
const dashboardDiv = document.getElementById('dashboard');
const userDisplay = document.getElementById('userDisplay');
const attendanceValue = document.getElementById('attendanceValue');
const feeValue = document.getElementById('feeValue');

const menuToggle = document.getElementById('menuToggle');
const menuDropdown = document.getElementById('menuDropdown');

const clearDuesBtn = document.getElementById('clearDuesBtn');
const makePaymentBtn = document.getElementById('makePaymentBtn');
const receiptBtn = document.getElementById('receiptBtn');

const studentMain = document.getElementById('studentMain');
const paymentPage = document.getElementById('paymentPage');
const receiptPage = document.getElementById('receiptPage');

const paymentAmountInput = document.getElementById('paymentAmount');
const payBtn = document.getElementById('payBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const receiptText = document.getElementById('receiptText');
const closeReceiptBtn = document.getElementById('closeReceiptBtn');

loginBtn.addEventListener('click', login);
menuToggle.addEventListener('click', toggleMenu);
clearDuesBtn.addEventListener('click', clearDues);
makePaymentBtn.addEventListener('click', openPaymentPage);
receiptBtn.addEventListener('click', openReceiptPage);

payBtn.addEventListener('click', makePayment);
cancelPaymentBtn.addEventListener('click', cancelPayment);
closeReceiptBtn.addEventListener('click', closeReceipt);

function login() {
  const username = usernameInput.value.trim().toUpperCase();
  const password = passwordInput.value.trim();

  if(users[username] && users[username].password === password) {
    loggedInUser = username;
    loginDiv.style.display = 'none';
    dashboardDiv.style.display = 'block';
    userDisplay.textContent = username;

    if (username === "ADMIN") {
      // Admin functionality can be added later
      studentMain.style.display = 'none';
      alert("Admin login detected. Student panel is hidden.");
    } else {
      studentMain.style.display = 'block';
      updateStudentData();
    }
  } else {
    alert("❌ Invalid username or password.");
  }
}

function updateStudentData() {
  const data = users[loggedInUser];
  attendanceValue.textContent = data.attendance.toFixed(2);
  feeValue.textContent = data.feeDue.toFixed(2);
}

function toggleMenu() {
  if(menuDropdown.classList.contains('dropdown-hidden')) {
    menuDropdown.classList.remove('dropdown-hidden');
  } else {
    menuDropdown.classList.add('dropdown-hidden');
  }
}

function clearDues() {
  if (!loggedInUser || loggedInUser === "ADMIN") {
    alert("Only students can clear dues.");
    return;
  }
  users[loggedInUser].feeDue = 0;
  updateStudentData();
  alert("Your dues have been cleared.");
  menuDropdown.classList.add('dropdown-hidden');
}

function openPaymentPage() {
  if (!loggedInUser || loggedInUser === "ADMIN") {
    alert("Only students can make payments.");
    return;
  }
  paymentPage.style.display = 'block';
  receiptPage.style.display = 'none';
  paymentAmountInput.value = '';
  menuDropdown.classList.add('dropdown-hidden');
}

function makePayment() {
  const amount = parseFloat(paymentAmountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }
  if (amount > users[loggedInUser].feeDue) {
    alert("Payment amount exceeds fee dues.");
    return;
  }

  users[loggedInUser].feeDue -= amount;
  lastPaymentAmount = amount;
  updateStudentData();
  paymentPage.style.display = 'none';
  alert(`Payment of Rs. ${amount.toFixed(2)} successful.`);
}

function cancelPayment() {
  paymentPage.style.display = 'none';
}

function openReceiptPage() {
  if (!loggedInUser || loggedInUser === "ADMIN") {
    alert("Only students can view receipts.");
    return;
  }
  receiptPage.style.display = 'block';
  paymentPage.style.display = 'none';
  if (lastPaymentAmount > 0) {
    receiptText.textContent = `Receipt: You have paid Rs. ${lastPaymentAmount.toFixed(2)} recently.`;
  } else {
    receiptText.textContent = "No recent payments.";
  }
  menuDropdown.classList.add('dropdown-hidden');
}

function closeReceipt() {
  receiptPage.style.display = 'none';
}