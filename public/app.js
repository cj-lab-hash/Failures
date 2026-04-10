async function loadRecords() {
  const res = await fetch("/api/records");
  const data = await res.json();
  const list = document.getElementById("list");

  list.innerHTML = data.map(r => `
    <div class="card">
      <b>${escapeHtml(r.name)}</b><br/>
      <div>${escapeHtml(r.description)}</div>
      <small>${new Date(r.created_at).toLocaleString()}</small>
    </div>
  `).join("");
}

document.getElementById("recordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();

  const res = await fetch("/api/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description })
  });

  if (!res.ok) {
    alert("Failed to save record");
    return;
  }

  document.getElementById("name").value = "";
  document.getElementById("description").value = "";
  await loadRecords();
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[m]));
}

loadRecords();