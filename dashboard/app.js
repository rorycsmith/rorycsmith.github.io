/****************************************************
 * EDIT LINKS HERE
 * Add or remove links ONLY in this section.
 * Each group = one collapsible section.
 ****************************************************/

const groups = [
{ name: "Common", open: true, links: [
  { name: "Github Page", url: "https://rorycsmith.github.io/", desc: "blog/social" },
  { name: "Github Blog", url: "https://rorycsmith.github.io/rorys_blog/", desc: "blog/social" },
  { name: "Pmail", url: "https://mail.proton.me/u/0/inbox", desc: "planning" },
  { name: "GitDashboard", url: "https://rorycsmith.github.io/dashboard/", desc: "links" },
  { name: "ChatGPT", url: "https://chatgpt.com/", desc: "ai" },
  { name: "Gemini", url: "  https://gemini.google.com/app", desc: "ai" },
] },

{ name: "Income", open: false, links: [
  { name: "Multimango", url: "https://www.multimango.com", desc: "Tasks" },
  { name: "Outlier", url: "https://outlier.ai/", desc: "Tasks" },
  { name: "Aether", url: "https://aether.ai/", desc: "Annotation" },
  { name: "DoorDash", url: "https://doordash.com/", desc: "Deliveries" }
] },

{ name: "Crypto", open: false, links: [
{ name: "Townsquare", url: "https://app.townsq.xyz/", desc: "Crypto" },
{ name: "CMC Portfolio", url: "https://coinmarketcap.com/portfolio-tracker", desc: "crypto" }
] },

{ name: "Github", open: false, links: [
  { name: "Github", url: "https://github.com/rorycsmith/rorycsmith.github.io", desc: "Tasks" },
  { name: "Github Page", url: "https://rorycsmith.github.io/", desc: "blog/social" },
  { name: "Github Blog", url: "https://rorycsmith.github.io/rorys_blog/", desc: "blog/social" },

] },



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

{ name: "Archived", open: false, links: [

  { name: "FB Marketplace", url: "https://www.facebook.com/marketplace/you/dashboard", desc: "Sales" }

] },
];


const groupsEl = document.getElementById("groups");
const qEl = document.getElementById("q");
const resultsEl = document.getElementById("results");
const resultsGrid = document.getElementById("resultsGrid");

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function makeTile(link){
  const a = document.createElement("a");
  a.className = "tile";
  a.href = link.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.innerHTML = `<div class="name">${escapeHtml(link.name)}</div>
  <div class="desc">${escapeHtml(link.desc || "")}</div>`;
  return a;
}

function renderGroups(){
  groupsEl.innerHTML = "";
  groups.forEach(g => {
    const details = document.createElement("details");
    details.className = "section";
    details.open = !!g.open;

    const summary = document.createElement("summary");
    summary.innerHTML = `
    <div class="summary-left">
    <span class="chev">▶</span>
    <strong>${escapeHtml(g.name)}</strong>
    </div>
    <span class="pill">${g.links.length} links</span>
    `;
    details.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "grid";
    g.links.forEach(link => grid.appendChild(makeTile(link)));
    details.appendChild(grid);

    groupsEl.appendChild(details);
  });
}

function filterTiles(query){
  query = query.trim().toLowerCase();
  if(!query){
    resultsEl.classList.remove("active");
    resultsGrid.innerHTML = "";
    return;
  }
  const matches = [];
  groups.forEach(g => g.links.forEach(l => {
    const hay = (l.name + " " + (l.desc||"") + " " + l.url).toLowerCase();
    if(hay.includes(query)) matches.push(l);
  }));
    resultsGrid.innerHTML = "";
    matches.slice(0, 12).forEach(l => resultsGrid.appendChild(makeTile(l)));
    resultsEl.classList.add("active");
}

function openFirstMatch(){
  const first = resultsGrid.querySelector(".tile");
  if(first) window.open(first.href, "_blank", "noopener,noreferrer");
}

/* Notes */
const notesEl = document.getElementById("notes");
const saveState = document.getElementById("saveState");
const NOTES_KEY = "local_dashboard_notes_v1";
notesEl.value = localStorage.getItem(NOTES_KEY) || "";
let saveTimer = null;
notesEl.addEventListener("input", () => {
  saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(NOTES_KEY, notesEl.value);
    saveState.textContent = "Saved";
  }, 250);
});

/* Theme */
const themeBtn = document.getElementById("themeBtn");
const THEME_KEY = "local_dashboard_theme_v1";
function setTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(THEME_KEY, t);
}
function toggleTheme(){
  const cur = localStorage.getItem(THEME_KEY) || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
}
themeBtn.addEventListener("click", toggleTheme);
setTheme(localStorage.getItem(THEME_KEY) || "dark");

/* Expand/Collapse */
const expandBtn = document.getElementById("expandBtn");
let expanded = true;
function setAllSections(open){
  document.querySelectorAll("details.section").forEach(d => d.open = open);
}
expandBtn.addEventListener("click", () => {
  expanded = !expanded;
  setAllSections(expanded);
});

/* Export */
const backupBtn = document.getElementById("backupBtn");
backupBtn.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
                           theme: localStorage.getItem(THEME_KEY) || "dark",
                           notes: localStorage.getItem(NOTES_KEY) || "",
                           groups
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dashboard-export.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});

/* Clock */
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
function tick(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  clockEl.textContent = `${hh}:${mm}`;
  dateEl.textContent = d.toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"short", day:"numeric" });
}
tick(); setInterval(tick, 1000*15);

/* Search + shortcuts */
qEl.addEventListener("input", () => filterTiles(qEl.value));
qEl.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){ e.preventDefault(); openFirstMatch(); }
  if(e.key === "Escape"){ qEl.value=""; filterTiles(""); qEl.blur(); }
});
document.addEventListener("keydown", (e) => {
  if(e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
  if(e.key === "/"){ e.preventDefault(); qEl.focus(); }
  if(e.key.toLowerCase() === "t"){ e.preventDefault(); toggleTheme(); }
  if(e.key.toLowerCase() === "e"){ e.preventDefault(); expanded = !expanded; setAllSections(expanded); }
});

/* Init */
renderGroups();
filterTiles("");
