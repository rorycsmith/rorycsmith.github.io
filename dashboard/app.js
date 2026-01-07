/****************************************************
 * DASHBOARD DATA
 *
 * - First run seeds links from DEFAULT_GROUPS.
 * - After that, groups/links are stored in your browser (localStorage).
 * - Use the "Manage" button to add/edit/delete without touching code.
 *
 * Reset links:
 *   DevTools → Application → Local Storage → delete key:
 *   local_dashboard_groups_v1
 ****************************************************/

const DEFAULT_GROUPS = [
  {
    name: "Common",
    open: true,
    links: [
      { name: "Github Page", url: "https://rorycsmith.github.io/", desc: "bio/cv" },
      { name: "Github Blog", url: "https://rorycsmith.github.io/rorys_blog/", desc: "blog" },
      { name: "Github IO", url: "https://github.com/rorycsmith/rorycsmith.github.io", desc: "repos" },
      { name: "Pmail", url: "https://mail.proton.me/u/0/inbox", desc: "planning" },
      { name: "Zoho email", url: "https://mail.zoho.com/zm/#mail/folder/inbox", desc: "zoho" },
      { name: "Zoho calender", url: "https://calendar.zoho.com/zc/dy/20251221-20251221", desc: "zoho" },
      { name: "GitDashboard", url: "https://rorycsmith.github.io/dashboard/", desc: "links" },
      { name: "ChatGPT", url: "https://chatgpt.com/", desc: "ai" },
      { name: "Gemini", url: "https://gemini.google.com/app", desc: "ai" },
    ],
  },

  {
    name: "Income",
    open: false,
    links: [
      { name: "Multimango", url: "https://www.multimango.com", desc: "tasks" },
      { name: "Outlier", url: "https://outlier.ai/", desc: "tasks" },
      { name: "Aether", url: "https://aether.ai/", desc: "annotation" },
      { name: "DoorDash", url: "https://doordash.com/", desc: "deliveries" },
    ],
  },

  {
    name: "Crypto",
    open: false,
    links: [
      { name: "Monadvision", url: "https://monadvision.com/", desc: "crypto" },
      { name: "r/Monad", url: "https://www.reddit.com/r/Monad/", desc: "reddit" },
      { name: "Townsquare", url: "https://app.townsq.xyz/", desc: "crypto" },
      { name: "DeFiLlama (Monad)", url: "https://defillama.com/chain/monad", desc: "defi" },
      { name: "TheQRL", url: "https://www.theqrl.org/", desc: "crypto" },
      { name: "CMC Portfolio", url: "https://coinmarketcap.com/portfolio-tracker", desc: "crypto" },
    ],
  },

  {
    name: "Github",
    open: false,
    links: [
      { name: "Github", url: "https://github.com/rorycsmith/rorycsmith.github.io", desc: "repos" },
      { name: "Github Page", url: "https://rorycsmith.github.io/", desc: "blog/social" },
      { name: "Github Blog", url: "https://rorycsmith.github.io/rorys_blog/", desc: "blog/social" },
    ],
  },

  { name: "Utilities", open: false, links: [] },
  { name: "Comms", open: false, links: [] },
  { name: "Google", open: false, links: [] },
  { name: "Microsoft", open: false, links: [] },
  { name: "Zoho", open: false, links: [] },
  { name: "Proton", open: false, links: [] },
  { name: "Writing", open: false, links: [] },
  { name: "Financial", open: false, links: [] },
  { name: "Legal", open: false, links: [] },
  { name: "Buddhism", open: false, links: [] },
  { name: "My Links", open: false, links: [] },
  { name: "Copyediting & Proofreading", open: false, links: [] },
  { name: "Recipes", open: false, links: [] },
  { name: "Music", open: false, links: [] },
  { name: "AI", open: false, links: [] },
  { name: "Misc", open: false, links: [] },

  {
    name: "Archived",
    open: false,
    links: [
      { name: "FB Marketplace", url: "https://www.facebook.com/marketplace/you/dashboard", desc: "sales" },
    ],
  },
];

// DOM (assigned in init() so this works even if the script loads before the body)
let groupsEl;
let qEl;
let resultsEl;
let resultsGrid;
let manageBtn;
let importBtn;
let importFile;
let addGroupBtn;


// Storage keys
const GROUPS_KEY = "local_dashboard_groups_personal_v1";

let manage = false;
let groups = loadGroups();

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

function deepCopy(x) {
  return JSON.parse(JSON.stringify(x));
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return deepCopy(DEFAULT_GROUPS);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return deepCopy(DEFAULT_GROUPS);
    // basic validation
    return parsed
      .filter((g) => g && typeof g.name === "string" && Array.isArray(g.links))
      .map((g) => ({
        name: String(g.name || "Untitled").trim() || "Untitled",
        open: !!g.open,
        links: g.links
          .filter((l) => l && typeof l.name === "string" && typeof l.url === "string")
          .map((l) => ({
            name: String(l.name || "").trim() || "(no name)",
            url: normalizeUrl(String(l.url || "").trim()),
            desc: String(l.desc || "").trim(),
          })),
      }));
  } catch {
    return deepCopy(DEFAULT_GROUPS);
  }
}

function saveGroups() {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

function normalizeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  // allow things like mailto:, file:, etc.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
  return "https://" + s;
}

function makeTile(link, gi, li) {
  const a = document.createElement("a");
  a.className = "tile";
  a.href = link.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.innerHTML = `
    <div class="name">${escapeHtml(link.name)}</div>
    <div class="desc">${escapeHtml(link.desc || "")}</div>
  `;

  // Manage mode actions
  const actions = document.createElement("div");
  actions.className = "tile-actions";

  const edit = document.createElement("button");
  edit.className = "iconbtn";
  edit.type = "button";
  edit.title = "Edit link";
  edit.textContent = "✎";
  edit.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    editLink(gi, li);
  });

  const del = document.createElement("button");
  del.className = "iconbtn danger";
  del.type = "button";
  del.title = "Delete link";
  del.textContent = "✕";
  del.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteLink(gi, li);
  });

  actions.appendChild(edit);
  actions.appendChild(del);
  a.appendChild(actions);

  return a;
}

function renderGroups() {
  groupsEl.innerHTML = "";

  groups.forEach((g, gi) => {
    const details = document.createElement("details");
    details.className = "section";
    details.open = !!g.open;

    details.addEventListener("toggle", () => {
      g.open = details.open;
      saveGroups();
    });

    const summary = document.createElement("summary");

    const left = document.createElement("div");
    left.className = "summary-left";
    left.innerHTML = `<span class="chev">▶</span><strong>${escapeHtml(g.name)}</strong>`;

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "10px";
    right.style.alignItems = "center";

    const count = document.createElement("span");
    count.className = "pill";
    count.textContent = `${g.links.length} links`;

    const groupActions = document.createElement("div");
    groupActions.className = "group-actions";

    const addL = document.createElement("button");
    addL.className = "btn mini";
    addL.type = "button";
    addL.textContent = "+ Link";
    addL.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addLink(gi);
    });

    const renameG = document.createElement("button");
    renameG.className = "btn mini";
    renameG.type = "button";
    renameG.textContent = "Rename";
    renameG.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      renameGroup(gi);
    });

    const delG = document.createElement("button");
    delG.className = "btn mini danger";
    delG.type = "button";
    delG.textContent = "Delete";
    delG.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteGroup(gi);
    });

    groupActions.appendChild(addL);
    groupActions.appendChild(renameG);
    groupActions.appendChild(delG);

    right.appendChild(count);
    right.appendChild(groupActions);

    summary.appendChild(left);
    summary.appendChild(right);
    details.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "grid";
    g.links.forEach((link, li) => grid.appendChild(makeTile(link, gi, li)));
    details.appendChild(grid);

    groupsEl.appendChild(details);
  });

  // reflect manage state in DOM
  document.body.classList.toggle("manage-on", manage);
  manageBtn.classList.toggle("active", manage);
}

function filterTiles(query) {
  query = query.trim().toLowerCase();
  if (!query) {
    resultsEl.classList.remove("active");
    resultsGrid.innerHTML = "";
    return;
  }
  const matches = [];
  groups.forEach((g) =>
    g.links.forEach((l) => {
      const hay = (l.name + " " + (l.desc || "") + " " + l.url).toLowerCase();
      if (hay.includes(query)) matches.push(l);
    })
  );
  resultsGrid.innerHTML = "";
  matches.slice(0, 12).forEach((l) => resultsGrid.appendChild(makeTile(l, -1, -1)));
  resultsEl.classList.add("active");
}

function openFirstMatch() {
  const first = resultsGrid.querySelector(".tile");
  if (first) window.open(first.href, "_blank", "noopener,noreferrer");
}

// === Manage actions =================================================

function addGroup() {
  const name = prompt("New group name:", "New Group");
  if (!name) return;
  groups.push({ name: name.trim() || "Untitled", open: true, links: [] });
  saveGroups();
  renderGroups();
}

function renameGroup(gi) {
  const g = groups[gi];
  if (!g) return;
  const name = prompt("Rename group:", g.name);
  if (!name) return;
  g.name = name.trim() || "Untitled";
  saveGroups();
  renderGroups();
}

function deleteGroup(gi) {
  const g = groups[gi];
  if (!g) return;
  const ok = confirm(`Delete group "${g.name}"?\n\nThis will remove ${g.links.length} links.`);
  if (!ok) return;
  groups.splice(gi, 1);
  saveGroups();
  renderGroups();
}

function addLink(gi) {
  const g = groups[gi];
  if (!g) return;
  const name = prompt(`Link name (group: ${g.name}):`, "");
  if (!name) return;
  const url = prompt("URL:", "https://");
  if (!url) return;
  const desc = prompt("Description (optional):", "");
  g.links.push({ name: name.trim() || "(no name)", url: normalizeUrl(url), desc: (desc || "").trim() });
  saveGroups();
  renderGroups();
}

function editLink(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];
  const name = prompt("Link name:", link.name);
  if (!name) return;
  const url = prompt("URL:", link.url);
  if (!url) return;
  const desc = prompt("Description (optional):", link.desc || "");

  link.name = name.trim() || "(no name)";
  link.url = normalizeUrl(url);
  link.desc = (desc || "").trim();

  saveGroups();
  renderGroups();
}

function deleteLink(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];
  const ok = confirm(`Delete link "${link.name}" from group "${g.name}"?`);
  if (!ok) return;
  g.links.splice(li, 1);
  saveGroups();
  renderGroups();
}

// === App state & keys ==============================================

let notesEl;
let saveState;
let themeBtn;
let expandBtn;
let backupBtn;
let clockEl;
let dateEl;
let expanded = true;
let saveTimer = null;

const NOTES_KEY = "local_dashboard_notes_v1";
const THEME_KEY = "local_dashboard_theme_v1";
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(THEME_KEY, t);
}
function toggleTheme() {
  const cur = localStorage.getItem(THEME_KEY) || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
}
// === Expand/Collapse ===============================================

function setAllSections(open) {
  document.querySelectorAll("details.section").forEach((d) => (d.open = open));
}
// === Clock ==========================================================

function tick() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  clockEl.textContent = `${hh}:${mm}`;
  dateEl.textContent = d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// === Init ===========================================================

function init() {
  // DOM
  groupsEl = document.getElementById("groups");
  qEl = document.getElementById("q");
  resultsEl = document.getElementById("results");
  resultsGrid = document.getElementById("resultsGrid");
  manageBtn = document.getElementById("manageBtn");
  importBtn = document.getElementById("importBtn");
  importFile = document.getElementById("importFile");
  addGroupBtn = document.getElementById("addGroupBtn");


  notesEl = document.getElementById("notes");
  saveState = document.getElementById("saveState");
  themeBtn = document.getElementById("themeBtn");
  expandBtn = document.getElementById("expandBtn");
  backupBtn = document.getElementById("backupBtn");
  clockEl = document.getElementById("clock");
  dateEl = document.getElementById("date");

  // If any required element is missing, fail loudly (helps debugging “button does nothing”).
  const required = {
    groupsEl, qEl, resultsEl, resultsGrid,
    manageBtn, addGroupBtn,
    importBtn, importFile,
    notesEl, saveState,
    themeBtn, expandBtn, backupBtn,
    clockEl, dateEl
  };

  // --- Add Group button (UI) ---
  addGroupBtn.addEventListener("click", () => {
    // If user isn't in Manage mode, turn it on automatically
    if (!manage) {
      manage = true;
      document.body.classList.toggle("manage-on", manage);
      manageBtn.classList.toggle("active", manage);
      manageBtn.querySelector("span:nth-child(2)").textContent = "Done";
      renderGroups();
    }
    addGroup();
  });

  for (const [k, v] of Object.entries(required)) {
    if (!v) {
      console.error("Dashboard init failed. Missing element:", k);
      alert("Dashboard init failed (missing element: " + k + ").\n\nMake sure index.html, style.css, and app.js are all from the same folder and you opened index.html from that folder (not from inside the .zip).");
      return;
    }
  }

  // Notes
  notesEl.value = localStorage.getItem(NOTES_KEY) || "";
  notesEl.addEventListener("input", () => {
    saveState.textContent = "Saving…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(NOTES_KEY, notesEl.value);
      saveState.textContent = "Saved";
    }, 250);
  });

  // Theme
  themeBtn.addEventListener("click", toggleTheme);
  setTheme(localStorage.getItem(THEME_KEY) || "dark");

  // Expand/Collapse
  expandBtn.addEventListener("click", () => {
    expanded = !expanded;
    setAllSections(expanded);
  });

  // Export
  backupBtn.addEventListener("click", () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      theme: localStorage.getItem(THEME_KEY) || "dark",
      notes: localStorage.getItem(NOTES_KEY) || "",
      groups,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dashboard-export.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  // Import
  importBtn.addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    try {
      const txt = await file.text();
      const payload = JSON.parse(txt);
      if (!payload || !Array.isArray(payload.groups)) throw new Error("No groups in import.");

      groups = payload.groups;
      saveGroups();

      if (typeof payload.theme === "string") setTheme(payload.theme);
      if (typeof payload.notes === "string") {
        notesEl.value = payload.notes;
        localStorage.setItem(NOTES_KEY, payload.notes);
        saveState.textContent = "Saved";
      }

      renderGroups();
      filterTiles(qEl.value);
    } catch (err) {
      alert("Import failed: " + (err && err.message ? err.message : String(err)));
    } finally {
      importFile.value = "";
    }
  });

  // Clock
  tick();
  setInterval(tick, 1000 * 15);

  // Search
  qEl.addEventListener("input", () => filterTiles(qEl.value));
  qEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openFirstMatch();
    }
    if (e.key === "Escape") {
      qEl.value = "";
      filterTiles("");
      qEl.blur();
    }
  });

  // Global shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.key === "/") {
      e.preventDefault();
      qEl.focus();
    }
    if (e.key.toLowerCase() === "t") {
      e.preventDefault();
      toggleTheme();
    }
    if (e.key.toLowerCase() === "e") {
      e.preventDefault();
      expanded = !expanded;
      setAllSections(expanded);
    }
    // Manage mode: Shift+G = new group
    if (manage && e.key.toLowerCase() === "g" && e.shiftKey) {
      e.preventDefault();
      addGroup();
    }
  });

  // Manage button
  manageBtn.addEventListener("click", () => {
    manage = !manage;
    document.body.classList.toggle("manage-on", manage);
    manageBtn.classList.toggle("active", manage);
    manageBtn.querySelector("span:nth-child(2)").textContent = manage ? "Done" : "Manage";
    renderGroups();
  });

  // Double-click Manage to add group (low friction)
  manageBtn.addEventListener("dblclick", (e) => {
    e.preventDefault();
    addGroup();
  });

  // Initial render
  renderGroups();
  filterTiles("");
}

window.addEventListener("DOMContentLoaded", init);





// Esc clears the search field (keeps focus + triggers existing filtering logic)
(() => {
  const q = document.getElementById("q");
  if (!q) return;

  q.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!q.value) return;

    e.preventDefault();
    q.value = "";
    q.dispatchEvent(new Event("input", { bubbles: true }));
  });
})();




























