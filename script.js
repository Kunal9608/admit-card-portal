// --- Data & Variables ---

    const users = {
      student: [
        { username: "KUNAL", password: "123" },
        { username: "AKSHAT", password: "123" },
        { username: "OM", password: "123" },
        { username: "AKRITI", password: "321" }
      ],
      admin: [
        { username: "ADMIN", password: "admin123" },
        { username: "ROHAN", password: "456" }
      ]
    };

    const studentData = {
      KUNAL: { attendance: 82.54, fees: 0 },
      AKSHAT: { attendance: 78.12, fees: 500 },
      OM: { attendance: 88.90, fees: 200 },
      AKRITI: { attendance: 70.90, fees: 20000 }
    };

    let notices = [];

    // Store payment QR Code as data URL or empty string initially
    let paymentQrCodeDataUrl = "https://github.com/Kunal9608/admit-card-portal/raw/main/kunal.png";

    // Pending payments list
    // Each pending payment: { student: string, receiptDataUrl: string, utr: string }
    let pendingPayments = [];
let confirmedPayments = [];

    let currentUser = null;
    let currentRole = null;

    // --- Login ---

    function login() {
      const usernameInput = document.getElementById("username");
      const passwordInput = document.getElementById("password");
      const username = usernameInput.value.trim().toUpperCase();
      const password = passwordInput.value;

      const errorMessage = document.getElementById("errorMessage");

      // Check student login
      if (users.student.find(u => u.username === username && u.password === password)) {
        currentUser = username;
        currentRole = "student";
      }
      // Check admin login
      else if (users.admin.find(u => u.username === username && u.password === password)) {
        currentUser = username;
        currentRole = "admin";
      }
      else {
        errorMessage.classList.remove("hidden");
        return;
      }

      // Clear error message
      errorMessage.classList.add("hidden");

      // Hide login page and show dashboard
      document.getElementById("loginPage").classList.add("hidden");
      document.getElementById("dashboard").classList.remove("hidden");
      document.getElementById("paymentPage").classList.add("hidden");

      // Show admin or student dashboard accordingly
      document.getElementById("adminControls").classList.toggle("hidden", currentRole !== "admin");
      document.getElementById("studentDashboard").classList.toggle("hidden", currentRole !== "student");

      if (currentRole === "student") {
        loadStudentDashboard();
      } else if (currentRole === "admin") {
        loadAdminPanel();
        renderPendingPayments();
      }

      // Clear login inputs
      usernameInput.value = "";
      passwordInput.value = "";
    }

    function logout() {
      currentUser = null;
      currentRole = null;
      document.getElementById("loginPage").classList.remove("hidden");
      document.getElementById("dashboard").classList.add("hidden");
      document.getElementById("paymentPage").classList.add("hidden");
    }

    // --- Student Dashboard Load ---
    function loadStudentDashboard() {
      if (!currentUser || currentRole !== "student") return;

      const attendance = studentData[currentUser].attendance;
      const fees = studentData[currentUser].fees;

      document.getElementById("attendanceDisplay").textContent = attendance.toFixed(2) + "%";
      document.getElementById("feesDisplay").textContent = "Rs. " + fees.toFixed(2);

      // Show Clear Dues button only if dues > 0
      document.getElementById("clearDuesBtn").classList.toggle("hidden", fees <= 0);

      setAdmitCardLink(currentUser);
      renderNotices();
    }

    // --- Admin Panel Load ---
    function loadAdminPanel() {
      if (!currentUser || currentRole !== "admin") return;

      // Populate student selector
      const selector = document.getElementById("studentSelector");
      selector.innerHTML = "";
      Object.keys(studentData).forEach(student => {
        const option = document.createElement("option");
        option.value = student;
        option.textContent = student;
        selector.appendChild(option);
      });

      // Show uploaded QR code if any
      const adminQrPreview = document.getElementById("adminQrPreview");
      adminQrPreview.src = paymentQrCodeDataUrl || "";

      // Load pending payments
      renderPendingPayments();

      renderNotices();
    }

    // --- Update student data (admin) ---
    function updateStudentData() {
      const selector = document.getElementById("studentSelector");
      const attendanceInput = document.getElementById("updateAttendance");
      const feesInput = document.getElementById("updateFees");

      const student = selector.value;
      const attendanceVal = attendanceInput.value.trim();
      const feesVal = feesInput.value.trim();

      if (attendanceVal !== "") {
        const attNum = parseFloat(attendanceVal);
        if (isNaN(attNum) || attNum < 0 || attNum > 100) {
          alert("Please enter valid attendance % (0-100).");
          return;
        }
        studentData[student].attendance = attNum;
      }
      if (feesVal !== "") {
        const feesNum = parseFloat(feesVal);
        if (isNaN(feesNum) || feesNum < 0) {
          alert("Please enter valid fees dues (>=0).");
          return;
        }
        studentData[student].fees = feesNum;
      }

      alert("Student data updated.");

      // Refresh dashboard if current user is updated student
      if (currentRole === "student" && currentUser === student) {
        loadStudentDashboard();
      }

      // Clear input fields
      attendanceInput.value = "";
      feesInput.value = "";
    }

    // --- Post new notice (admin) ---
    function postNotice() {
  const noticeInput = document.getElementById("newNotice");
  const title = noticeInput.value.trim();
  if (!title) {
    alert("Please enter a notice.");
    return;
  }

  const newNotice = {
    title: title,
    department: "ADMIN", // or pull from a dropdown if needed
    date: new Date().toLocaleDateString("en-GB") // e.g., 03/06/2025
  };

  notices.push(newNotice);
  noticeInput.value = "";
  renderNotices();
}

    // --- Render notices for both admin & student ---
    function renderNotices() {
      const ul = document.getElementById("notices");
      ul.innerHTML = "";
      if (notices.length === 0) {
        ul.innerHTML = "<li class='text-gray-500 text-gray-400 italic'>No notices posted yet.</li>";
        return;
      }
      notices.forEach(({ title, department, date }) => {
  const li = document.createElement("li");
  li.className = "flex items-start gap-4 bg-gray-50 hover:bg-gray-100 rounded-lg p-4 shadow-sm";

  li.innerHTML = `
    <div class="text-xs font-semibold text-indigo-600 uppercase w-32">
      ${department}<br/>
      <span class="text-gray-500 text-gray-400">${date}</span>
    </div>
    <div class="text-blue-900 font-bold text-lg">
      ${title}
    </div>
  `;
  ul.appendChild(li);
});
    }

    // --- Payment QR Code Upload (admin) ---
    function uploadQrCode() {
      const fileInput = document.getElementById("qrUploader");
      const file = fileInput.files[0];
      if (!file) {
        alert("Please select an image file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        paymentQrCodeDataUrl = e.target.result;
        document.getElementById("adminQrPreview").src = paymentQrCodeDataUrl;
        alert("QR Code uploaded successfully.");
      };
      reader.readAsDataURL(file);
    }

    // --- Open payment page from student dashboard ---
    function openPaymentPage() {
      document.getElementById("dashboard").classList.add("hidden");
      document.getElementById("paymentPage").classList.remove("hidden");

      // Set QR code image src for payment
  renderPaymentHistory();
  document.getElementById("qrDueAmount").textContent = "Your Dues: Rs. " + studentData[currentUser].fees.toFixed(2);
      const qrImg = document.getElementById("paymentQrCode");
      if (paymentQrCodeDataUrl) {
        qrImg.src = paymentQrCodeDataUrl;
      } else {
        qrImg.src = "";
        document.getElementById("qrMessage").textContent = "Kindly wait a few seconds for UTR confirmation...";
      }

      // Clear receipt and UTR inputs
      document.getElementById("paymentReceipt").value = "";
      document.getElementById("utrInput").value = "";
    }

    // --- Go back to dashboard from payment page ---
    function goBackToDashboard() {
      document.getElementById("paymentPage").classList.add("hidden");
      document.getElementById("dashboard").classList.remove("hidden");
    }

    // --- Submit payment receipt and UTR (student) ---
    




function submitPayment() {
  const receiptInput = document.getElementById("paymentReceipt");
  const utrInput = document.getElementById("utrInput");

  if (receiptInput.files.length === 0) {
    alert("Please upload your payment receipt (image only).");
    return;
  }

  const utr = utrInput.value.trim();
  if (!/^[0-9]{8,}$/.test(utr)) {
    alert("Please enter a valid UTR number (minimum 8 digits, numbers only).");
    return;
  }

  const file = receiptInput.files[0];
  if (!file.type.startsWith("image/")) {
    alert("Only image files are allowed for receipt.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    pendingPayments.push({
      student: currentUser,
      receiptDataUrl: e.target.result,
      utr: utr,
      amount: studentData[currentUser].fees.toFixed(2)
    });

    alert("KINDLY WAIT FOR CONFIRMATION BY ADMIN");
    goBackToDashboard();
  };

  reader.readAsDataURL(file);
}



            

    
    // reject payment 
    function rejectPayment(index) {
  const payment = pendingPayments[index];
  if (!payment) return;

  // Remove the rejected payment
  pendingPayments.splice(index, 1);
  const now = getISTDateTime();
  confirmedPayments.push({ student: payment.student, amount: payment.amount || '--', utr: payment.utr, status: 'REJECTED', date: now });
  alert(`Payment request from ${payment.student} has been rejected.`);
  renderPaymentHistory();

  // Refresh admin panel
  renderPendingPayments();
}

    // --- Admit Card download validation --

    function setAdmitCardLink(username) {
  const link = document.getElementById("admitCardLink");

  const attendance = parseFloat(studentData[username].attendance);
  const fees = parseFloat(studentData[username].fees);

  // Condition: Attendance must be >= 75 and Fees must be 0
  if (attendance < 75) {
    link.href = "#";
    link.removeAttribute("download");
    link.onclick = (e) => {
      e.preventDefault();
      alert("YOUR ATTENDANCE IS BELOW 75% YOU CAN'T SIT IN EXAM, CONTACT EXAMINATION DEPARTMENT.");
    };
  } else if (fees > 0) {
    link.href = "#";
    link.removeAttribute("download");
    link.onclick = (e) => {
      e.preventDefault();
      alert("FEE DUES PENDING. PLEASE CLEAR YOUR DUES TO DOWNLOAD ADMIT CARD.");
    };
  } else {
    const baseURL = "https://github.com/Kunal9608/admit-card-portal/raw/main/";  
const fileName = `AdmitCard_${username}.pdf`;  
link.href = baseURL + fileName;  
link.setAttribute("download", fileName);  
link.onclick = null;
  }
    }

let subjectWiseData = {
  KUNAL: { "C PROGRAM": 80, PYTHON: 70, OOPS: 80, DBMS: 77, MATHS: 86 },
  AKSHAT: { "C PROGRAM": 65, PYTHON: 75, OOPS: 60, DBMS: 72, MATHS: 68 },
  OM: { "C PROGRAM": 90, PYTHON: 85, OOPS: 88, DBMS: 92, MATHS: 91 },
  AKRITI: { "C PROGRAM": 90, PYTHON: 85, OOPS: 88, DBMS: 92, MATHS: 91 }
};

function updateSubjectAttendance() {
  const student = document.getElementById("studentSelector").value;
  const fields = ["C PROGRAM", "PYTHON", "OOPS", "DBMS", "MATHS"];
  subjectWiseData[student] = {};
  for (let subject of fields) {
    const id = subject.replace(/ /g, '_') + '_input';
    const val = parseFloat(document.getElementById(id).value);
    subjectWiseData[student][subject] = !isNaN(val) ? val : 0;
  }
  alert("Subject attendance updated for " + student);
  if (currentUser === student && currentRole === "student") {
    loadStudentDashboard();
  }
}

function toggleAttendanceDetails() {
  if (!currentUser || currentRole !== "student") return;
  const details = document.getElementById("subjectAttendanceDetails");
  const studentSubjects = subjectWiseData[currentUser];
  if (!studentSubjects) return;
  const avg = Object.values(studentSubjects).reduce((a, b) => a + b, 0) / Object.values(studentSubjects).length;
  document.getElementById("attendanceDisplay").textContent = avg.toFixed(2) + "%";
  let html = "";
  for (const [subject, value] of Object.entries(studentSubjects)) {
    html += `<p>${subject}: <strong>${value}%</strong></p>`;
  }
  details.innerHTML = html;
  details.classList.toggle("hidden");
}

function loadStudentDashboard() {
  if (!currentUser || currentRole !== "student") return;
  const subjects = subjectWiseData[currentUser];
  const avg = Object.values(subjects).reduce((a, b) => a + b, 0) / Object.values(subjects).length;
  document.getElementById("attendanceDisplay").textContent = avg.toFixed(2) + "%";
  const fees = studentData[currentUser].fees;
  document.getElementById("feesDisplay").textContent = "Rs. " + fees.toFixed(2);
  document.getElementById("clearDuesBtn").classList.toggle("hidden", fees <= 0);
  setAdmitCardLink(currentUser);
  renderNotices();
}
function togglePassword() {
  const pwd = document.getElementById("password");
  const btn = document.querySelector('button[onclick="togglePassword()"]');
  if (pwd.type === "password") {
    pwd.type = "text";
    btn.textContent = "👁‍🗨";
  } else {
    pwd.type = "password";
    btn.textContent = "👁";
  }
}


function updateHoliday() {
  const date = document.getElementById("holidayDateInput").value;
  const occasion = document.getElementById("holidayOccasionInput").value.trim();
  if (!date || !occasion) {
    alert("Please fill both date and occasion.");
    return;
  }
  const formatted = new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const holidayDisplay = document.getElementById("holidayDisplay");
  holidayDisplay.textContent = `${formatted} - ${occasion}`;
  alert("Holiday updated successfully.");
}

function renderPendingPayments() {
  const container = document.getElementById("pendingPaymentsContainer");
  container.innerHTML = "";

  if (pendingPayments.length === 0) {
    container.innerHTML = "<p class='text-gray-400 italic'>No pending payments.</p>";
    return;
  }

  pendingPayments.forEach((payment, index) => {
    const div = document.createElement("div");
    div.className = "border border-gray-600 rounded-lg p-3 bg-gradient-to-r from-pink-500 to-red-400 text-white bg-gray-900 shadow";

    div.innerHTML = `
      <p class="font-semibold mb-2">Student: ${payment.student}</p>
      <p class="mb-2">UTR: <span class="font-mono">${payment.utr}</span></p>
      <img src="${payment.receiptDataUrl}" alt="Payment Receipt" class="w-32 h-auto rounded-lg border border-gray-600 mb-2 hover:shadow-xl hover:shadow-purple-500/40 transition-shadow duration-300"/>
      <button onclick="confirmPayment(${index})" class="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded font-semibold">Confirm</button>
      <button onclick="rejectPayment(${index})" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded font-semibold ml-2">Reject</button>
    `;

    container.appendChild(div);
  });
}

function confirmPayment(index) {
  const payment = pendingPayments[index];
  if (!payment) return;

  // Clear dues for student
  if (studentData[payment.student]) {
    studentData[payment.student].fees = 0;
  }

  // Remove from pending
  pendingPayments.splice(index, 1);

  const now = getISTDateTime();
  confirmedPayments.push({ student: payment.student, amount: studentData[payment.student]?.fees || '--', utr: payment.utr, status: 'APPROVED', date: now });
  alert(`Payment confirmed for ${payment.student}. Dues cleared.`);
  renderPaymentHistory();

  // Refresh admin panel
  renderPendingPayments();
  if (currentRole === "student" && currentUser === payment.student) {
    loadStudentDashboard();
  }
}

function rejectPayment(index) {
  const payment = pendingPayments[index];
  if (!payment) return;

  pendingPayments.splice(index, 1);
  const now = getISTDateTime();
  confirmedPayments.push({ student: payment.student, amount: payment.amount || '--', utr: payment.utr, status: 'REJECTED', date: now });
  alert(`Payment request from ${payment.student} has been rejected.`);
  renderPaymentHistory();
  renderPendingPayments();
}

function getISTDateTime() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}


function renderPaymentHistory() {
  const table = document.getElementById("paymentHistoryTable");
  if (!table) return;

  table.innerHTML = "";
  const history = [...pendingPayments.map(p => ({...p, status: 'PENDING'})), ...confirmedPayments];
  history.forEach((p, index) => {
    const row = document.createElement("tr");
    const statusColor = p.status === 'APPROVED' ? 'green' : p.status === 'REJECTED' ? 'red' : 'orange';
    row.innerHTML = `
      <td class="py-2 px-4 border-b">${index + 1}</td>
      <td class="py-2 px-4 border-b">${p.utr || "--"}</td>
      <td class="py-2 px-4 border-b">${p.amount || "--"}</td>
      <td class="py-2 px-4 border-b text-${statusColor}-600 font-semibold">${p.status}</td>
      <td class="py-2 px-4 border-b">${p.date || "--"}</td>
    `;
    table.appendChild(row);
  });
}


function scrollPendingToBottom() {
  const container = document.getElementById("pendingPaymentsContainer");
  if (container) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }
}