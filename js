// ទិន្នន័យថ្នាក់ និងលេខ (កែតាមសាលារបស់អ្នកបាន)
const CLASSES = {
  "ថ្នាក់ទី ១០": ["១០១", "១០២", "១០៣"],
  "ថ្នាក់ទី ១១": ["១១១", "១១២", "១១៣"],
  "ថ្នាក់ទី ១២": ["១២១", "១២២", "១២៣"]
};

const STORAGE_KEY = "students";

const form = document.getElementById("regForm");
const classSelect = document.getElementById("classSelect");
const roomSelect = document.getElementById("roomSelect");
const formMsg = document.getElementById("formMsg");
const searchInput = document.getElementById("searchId");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");

// ---------- Storage ----------
function loadStudents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveStudents(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ---------- បំពេញជម្រើសថ្នាក់ ----------
Object.keys(CLASSES).forEach(name => {
  classSelect.add(new Option(name, name));
});

classSelect.addEventListener("change", () => {
  roomSelect.length = 1;
  const rooms = CLASSES[classSelect.value] || [];
  rooms.forEach(r => roomSelect.add(new Option(r, r)));
  roomSelect.disabled = rooms.length === 0;
  roomSelect.options[0].text = rooms.length ? "-- ជ្រើសរើស --" : "-- ជ្រើសរើសថ្នាក់ --";
});

// ---------- សារ ----------
function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = "msg " + type;
}

function escapeHTML(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ---------- ចុះឈ្មោះ ----------
form.addEventListener("submit", e => {
  e.preventDefault();

  const student = {
    id: document.getElementById("studentId").value.trim().toUpperCase(),
    name: document.getElementById("fullName").value.trim(),
    dob: document.getElementById("dob").value,
    gender: document.getElementById("gender").value,
    className: classSelect.value,
    room: roomSelect.value,
    phone: document.getElementById("phone").value.trim()
  };

  if (Object.values(student).some(v => !v)) {
    return showMsg("សូមបំពេញព័ត៌មានឲ្យគ្រប់ប្រអប់។", "error");
  }
  if (!/^0\d{8,9}$/.test(student.phone)) {
    return showMsg("លេខទូរស័ព្ទមិនត្រឹមត្រូវ (ឧ. 012345678)។", "error");
  }

  const students = loadStudents();
  if (students.some(s => s.id === student.id)) {
    return showMsg("Student ID នេះមានរួចហើយ។", "error");
  }

  students.push(student);
  saveStudents(students);

  form.reset();
  roomSelect.length = 1;
  roomSelect.disabled = true;
  showMsg("ចុះឈ្មោះបានជោគជ័យ!", "ok");
});

// ---------- ស្វែងរក ----------
function search() {
  const id = searchInput.value.trim().toUpperCase();
  if (!id) {
    result.innerHTML = '<span class="not-found">សូមបញ្ចូល Student ID។</span>';
    return;
  }

  const s = loadStudents().find(x => x.id === id);
  if (!s) {
    result.innerHTML = '<span class="not-found">រកមិនឃើញសិស្សដែលមាន ID នេះទេ។</span>';
    return;
  }

  const rows = [
    ["Student ID", s.id],
    ["ឈ្មោះសិស្ស", s.name],
    ["ថ្ងៃខែឆ្នាំកំណើត", formatDate(s.dob)],
    ["ភេទ", s.gender],
    ["ថ្នាក់", s.className],
    ["លេខខូសព្វ", s.room],
    ["Tel", s.phone]
  ];
  result.innerHTML = rows
    .map(([k, v]) => `<div class="row"><span class="key">${k}៖</span><span>${escapeHTML(v)}</span></div>`)
    .join("");
}

searchBtn.addEventListener("click", search);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});
