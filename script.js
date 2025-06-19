let entries = JSON.parse(localStorage.getItem("entries") || "[]");
let hourlyRate = parseFloat(localStorage.getItem("hourlyRate")) || 0;
document.getElementById("hourlyRate").value = hourlyRate;

function saveRate() {
  hourlyRate = parseFloat(document.getElementById("hourlyRate").value);
  localStorage.setItem("hourlyRate", hourlyRate);
  updateTable();
}

function addEntry() {
  const date = document.getElementById("workDate").value;
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  const breakMin = parseFloat(document.getElementById("breakTime").value || "0");

  if (!date || !start || !end) return alert("Please fill in all time fields.");

  const startTime = new Date(\`\${date}T\${start}\`);
  const endTime = new Date(\`\${date}T\${end}\`);

  let hours = (endTime - startTime) / (1000 * 60 * 60);
  hours = Math.max(0, hours - breakMin / 60);

  if (hours <= 0) return alert("Invalid time range or excessive break time.");

  entries.push({ id: Date.now(), date, hours });
  localStorage.setItem("entries", JSON.stringify(entries));
  clearForm();
  updateTable();
}

function clearForm() {
  document.getElementById("workDate").value = "";
  document.getElementById("startTime").value = "";
  document.getElementById("endTime").value = "";
  document.getElementById("breakTime").value = "";
}

function deleteEntry(id) {
  if (confirm("Delete this entry?")) {
    entries = entries.filter(e => e.id !== id);
    localStorage.setItem("entries", JSON.stringify(entries));
    updateTable();
  }
}

function startOfWeek(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + 1 - offset * 7); // Monday
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(offset = 0) {
  const d = startOfWeek(offset);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function updateTable() {
  const tbody = document.getElementById("entriesTable");
  tbody.innerHTML = "";

  const filter = document.getElementById("filter").value;
  const now = new Date();
  let weekStart, weekEnd;

  if (filter === "thisWeek") {
    weekStart = startOfWeek(0);
    weekEnd = endOfWeek(0);
  } else if (filter === "lastWeek") {
    weekStart = startOfWeek(1);
    weekEnd = endOfWeek(1);
  } else {
    weekStart = new Date(0);
    weekEnd = new Date();
  }

  const filtered = entries.filter(entry => {
    const date = new Date(entry.date);
    return date >= weekStart && date <= weekEnd;
  });

  let totalHours = 0;
  let totalPay = 0;

  if (filtered.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No entries</td></tr>";
  }

  filtered.forEach(entry => {
    totalHours += entry.hours;
    totalPay += entry.hours * hourlyRate;

    const tr = document.createElement("tr");
    tr.innerHTML = \`
      <td>\${entry.date}</td>
      <td>\${entry.hours.toFixed(2)}</td>
      <td>£\${(entry.hours * hourlyRate).toFixed(2)}</td>
      <td><button onclick="deleteEntry(\${entry.id})">Delete</button></td>
    \`;
    tbody.appendChild(tr);
  });

  document.getElementById("weeklyHours").innerText = totalHours.toFixed(2);
  document.getElementById("weeklyPay").innerText = totalPay.toFixed(2);
}

updateTable();
