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

// Drag and drop state
let draggedTile = null;
let draggedGroup = null;
let dragSourceGroupIndex = -1;
let dragSourceLinkIndex = -1;
let autoScrollInterval = null;
let expandGroupTimeout = null;


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

// === Auto-scroll during drag ==========================================

function handleDragAutoScroll(clientY) {
  const scrollZone = 100; // pixels from edge to trigger scroll
  const maxScrollSpeed = 20; // pixels per frame
  const viewportHeight = window.innerHeight;

  // Clear any existing interval
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  // Check if near top
  if (clientY < scrollZone) {
    const distance = scrollZone - clientY;
    const speed = Math.min(maxScrollSpeed, (distance / scrollZone) * maxScrollSpeed);
    autoScrollInterval = setInterval(() => {
      window.scrollBy(0, -speed);
    }, 16); // ~60fps
  }
  // Check if near bottom
  else if (clientY > viewportHeight - scrollZone) {
    const distance = clientY - (viewportHeight - scrollZone);
    const speed = Math.min(maxScrollSpeed, (distance / scrollZone) * maxScrollSpeed);
    autoScrollInterval = setInterval(() => {
      window.scrollBy(0, speed);
    }, 16);
  }
}

function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

// === Modal Dialog System =============================================

let modalOverlay, modalBox, modalTitle, modalBody, modalFooter, modalClose, modalCancel, modalConfirm;

function initModal() {
  modalOverlay = document.getElementById("modalOverlay");
  modalBox = document.getElementById("modalBox");
  modalTitle = document.getElementById("modalTitle");
  modalBody = document.getElementById("modalBody");
  modalFooter = document.getElementById("modalFooter");
  modalClose = document.getElementById("modalClose");
  modalCancel = document.getElementById("modalCancel");
  modalConfirm = document.getElementById("modalConfirm");

  // Close modal on overlay click
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Close button
  modalClose.addEventListener("click", closeModal);
  modalCancel.addEventListener("click", closeModal);

  // ESC key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      closeModal();
    }
  });
}

function showModal() {
  modalOverlay.classList.add("active");
  // Focus first input if present
  setTimeout(() => {
    const firstInput = modalBody.querySelector("input, textarea");
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeModal() {
  modalOverlay.classList.remove("active");
}

// Simple input modal (for group names)
function showInputModal(title, label, defaultValue = "", confirmText = "Save") {
  return new Promise((resolve) => {
    modalTitle.textContent = title;

    modalBody.innerHTML = `
      <div class="modal-field">
        <label class="modal-label">${escapeHtml(label)}</label>
        <input type="text" class="modal-input" id="modalInput" value="${escapeHtml(defaultValue)}" />
      </div>
    `;

    modalConfirm.textContent = confirmText;
    modalConfirm.className = "modal-btn modal-btn-primary";

    const input = document.getElementById("modalInput");

    const handleConfirm = () => {
      const value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }
      cleanup();
      closeModal();
      resolve(value);
    };

    const handleCancel = () => {
      cleanup();
      closeModal();
      resolve(null);
    };

    const handleKeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirm();
      }
    };

    const cleanup = () => {
      modalConfirm.removeEventListener("click", handleConfirm);
      modalCancel.removeEventListener("click", handleCancel);
      input.removeEventListener("keydown", handleKeydown);
    };

    modalConfirm.addEventListener("click", handleConfirm);
    modalCancel.addEventListener("click", handleCancel);
    input.addEventListener("keydown", handleKeydown);

    showModal();
  });
}

// Link editor modal (with live preview)
function showLinkModal(title, link = {}, confirmText = "Save Link") {
  return new Promise((resolve) => {
    modalTitle.textContent = title;

    const nameVal = link.name || "";
    const urlVal = link.url || "https://";
    const descVal = link.desc || "";

    modalBody.innerHTML = `
      <div class="modal-field">
        <label class="modal-label">Link Name</label>
        <input type="text" class="modal-input" id="modalLinkName" value="${escapeHtml(nameVal)}" placeholder="e.g., Github" />
      </div>
      <div class="modal-field">
        <label class="modal-label">URL</label>
        <input type="text" class="modal-input" id="modalLinkUrl" value="${escapeHtml(urlVal)}" placeholder="https://example.com" />
      </div>
      <div class="modal-field">
        <label class="modal-label">Description (optional)</label>
        <textarea class="modal-textarea" id="modalLinkDesc" placeholder="Brief description...">${escapeHtml(descVal)}</textarea>
      </div>
      <div class="link-preview">
        <div class="link-preview-label">Preview</div>
        <div class="link-preview-tile">
          <div class="link-preview-name" id="previewName">${escapeHtml(nameVal || "Link Name")}</div>
          <div class="link-preview-desc" id="previewDesc">${escapeHtml(descVal || "Description will appear here")}</div>
          <div class="link-preview-url" id="previewUrl">${escapeHtml(urlVal)}</div>
        </div>
      </div>
    `;

    modalConfirm.textContent = confirmText;
    modalConfirm.className = "modal-btn modal-btn-primary";

    const nameInput = document.getElementById("modalLinkName");
    const urlInput = document.getElementById("modalLinkUrl");
    const descInput = document.getElementById("modalLinkDesc");
    const previewName = document.getElementById("previewName");
    const previewDesc = document.getElementById("previewDesc");
    const previewUrl = document.getElementById("previewUrl");

    // Live preview update
    const updatePreview = () => {
      previewName.textContent = nameInput.value.trim() || "Link Name";
      previewDesc.textContent = descInput.value.trim() || "Description will appear here";
      previewUrl.textContent = urlInput.value.trim() || "https://";
    };

    nameInput.addEventListener("input", updatePreview);
    urlInput.addEventListener("input", updatePreview);
    descInput.addEventListener("input", updatePreview);

    const handleConfirm = () => {
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      const desc = descInput.value.trim();

      if (!name || !url) {
        if (!name) nameInput.focus();
        else if (!url) urlInput.focus();
        return;
      }

      cleanup();
      closeModal();
      resolve({ name, url, desc });
    };

    const handleCancel = () => {
      cleanup();
      closeModal();
      resolve(null);
    };

    const handleKeydown = (e) => {
      if (e.key === "Enter" && (e.target === nameInput || e.target === urlInput)) {
        e.preventDefault();
        handleConfirm();
      }
    };

    const cleanup = () => {
      modalConfirm.removeEventListener("click", handleConfirm);
      modalCancel.removeEventListener("click", handleCancel);
      nameInput.removeEventListener("input", updatePreview);
      urlInput.removeEventListener("input", updatePreview);
      descInput.removeEventListener("input", updatePreview);
      nameInput.removeEventListener("keydown", handleKeydown);
      urlInput.removeEventListener("keydown", handleKeydown);
    };

    modalConfirm.addEventListener("click", handleConfirm);
    modalCancel.addEventListener("click", handleCancel);
    nameInput.addEventListener("keydown", handleKeydown);
    urlInput.addEventListener("keydown", handleKeydown);

    showModal();
  });
}

// Confirmation modal (for deletes)
function showConfirmModal(title, message, confirmText = "Confirm", danger = false) {
  return new Promise((resolve) => {
    modalTitle.textContent = title;

    modalBody.innerHTML = `
      <div style="line-height: 1.5; color: var(--text);">
        ${escapeHtml(message).replace(/\n/g, '<br>')}
      </div>
    `;

    modalConfirm.textContent = confirmText;
    modalConfirm.className = danger
      ? "modal-btn modal-btn-danger"
      : "modal-btn modal-btn-primary";

    const handleConfirm = () => {
      cleanup();
      closeModal();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      closeModal();
      resolve(false);
    };

    const cleanup = () => {
      modalConfirm.removeEventListener("click", handleConfirm);
      modalCancel.removeEventListener("click", handleCancel);
    };

    modalConfirm.addEventListener("click", handleConfirm);
    modalCancel.addEventListener("click", handleCancel);

    showModal();
  });
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

  // Prevent navigation when in manage mode (so dragging doesn't open links)
  a.addEventListener("click", (e) => {
    if (manage) {
      e.preventDefault();
    }
  });

  // Make draggable in manage mode (only for real tiles, not search results)
  if (gi !== -1 && li !== -1) {
    a.draggable = true;
    a.dataset.groupIndex = gi;
    a.dataset.linkIndex = li;

    // Drag start
    a.addEventListener("dragstart", (e) => {
      if (!manage) {
        e.preventDefault();
        return;
      }
      // Don't drag if clicking on action buttons
      if (e.target.closest(".tile-actions")) {
        e.preventDefault();
        return;
      }
      draggedTile = a;
      dragSourceGroupIndex = gi;
      dragSourceLinkIndex = li;
      a.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", a.innerHTML);
    });

    // Drag end
    a.addEventListener("dragend", (e) => {
      a.classList.remove("dragging");
      draggedTile = null;
      dragSourceGroupIndex = -1;
      dragSourceLinkIndex = -1;
      stopAutoScroll();
      // Clear any pending expand timeout
      if (expandGroupTimeout) {
        clearTimeout(expandGroupTimeout);
        expandGroupTimeout = null;
      }
      // Remove all drag-over classes
      document.querySelectorAll(".drag-over, .drag-over-zone, .drag-over-tile").forEach((el) => {
        el.classList.remove("drag-over", "drag-over-zone", "drag-over-tile");
      });
    });

    // Drag over (to allow dropping on other tiles)
    a.addEventListener("dragover", (e) => {
      if (!manage || !draggedTile) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      a.classList.add("drag-over");
    });

    // Drag leave
    a.addEventListener("dragleave", (e) => {
      a.classList.remove("drag-over");
    });

    // Drop
    a.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      a.classList.remove("drag-over");

      if (!draggedTile || draggedTile === a) return;

      const targetGroupIndex = parseInt(a.dataset.groupIndex);
      const targetLinkIndex = parseInt(a.dataset.linkIndex);

      // Move the link
      const sourceGroup = groups[dragSourceGroupIndex];
      const targetGroup = groups[targetGroupIndex];
      const [movedLink] = sourceGroup.links.splice(dragSourceLinkIndex, 1);

      // Insert before target
      targetGroup.links.splice(targetLinkIndex, 0, movedLink);

      saveGroups();
      renderGroups();
    });
  }

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
    grid.dataset.groupIndex = gi;

    // Add drag over/drop handlers to grid (for dropping into empty space)
    grid.addEventListener("dragover", (e) => {
      if (!manage || !draggedTile) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      grid.classList.add("drag-over-zone");
    });

    grid.addEventListener("dragleave", (e) => {
      // Only remove if we're actually leaving the grid (not entering a child)
      const rect = grid.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      // Check if we've really left the grid
      if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
        grid.classList.remove("drag-over-zone");
      }
    });

    grid.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      grid.classList.remove("drag-over-zone");

      if (!draggedTile) return;

      const targetGroupIndex = parseInt(grid.dataset.groupIndex);

      // Move the link to the end of the target group
      const sourceGroup = groups[dragSourceGroupIndex];
      const targetGroup = groups[targetGroupIndex];
      const [movedLink] = sourceGroup.links.splice(dragSourceLinkIndex, 1);

      // Add to end of target group
      targetGroup.links.push(movedLink);

      saveGroups();
      renderGroups();
    });

    // Add tiles to grid
    if (g.links.length === 0) {
      grid.classList.add("empty-grid");
    } else {
      g.links.forEach((link, li) => grid.appendChild(makeTile(link, gi, li)));
    }
    details.appendChild(grid);

    // Make summary draggable (for reordering groups)
    summary.draggable = true;
    summary.dataset.groupIndex = gi;

    // Group drag start (on summary)
    summary.addEventListener("dragstart", (e) => {
      if (!manage) {
        e.preventDefault();
        return;
      }
      // Don't drag if clicking on action buttons
      if (e.target.closest(".group-actions")) {
        e.preventDefault();
        return;
      }
      draggedGroup = details;
      details.dataset.groupIndex = gi;
      details.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", gi);
    });

    // Group drag end
    summary.addEventListener("dragend", (e) => {
      details.classList.remove("dragging");
      draggedGroup = null;
      stopAutoScroll();
      // Clear any pending expand timeout
      if (expandGroupTimeout) {
        clearTimeout(expandGroupTimeout);
        expandGroupTimeout = null;
      }
      // Remove all drag-over classes
      document.querySelectorAll(".drag-over, .drag-over-tile").forEach((el) => {
        el.classList.remove("drag-over", "drag-over-tile");
      });
    });

    // Group drag over
    details.addEventListener("dragover", (e) => {
      if (!manage) return;

      // If dragging a group
      if (draggedGroup && draggedGroup !== details) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        details.classList.add("drag-over");
      }

      // If dragging a tile over a collapsed group, auto-expand after delay
      if (draggedTile && !details.open) {
        e.preventDefault();
        details.classList.add("drag-over-tile");

        if (!expandGroupTimeout) {
          expandGroupTimeout = setTimeout(() => {
            details.open = true;
            // Update the group state and save
            groups[gi].open = true;
            saveGroups();
            expandGroupTimeout = null;
            details.classList.remove("drag-over-tile");
          }, 600); // 600ms delay before expanding
        }
      }
    });

    // Group drag leave
    details.addEventListener("dragleave", (e) => {
      if (e.target === details) {
        details.classList.remove("drag-over");
        details.classList.remove("drag-over-tile");

        // Cancel auto-expand timeout if we leave the group
        if (expandGroupTimeout) {
          clearTimeout(expandGroupTimeout);
          expandGroupTimeout = null;
        }
      }
    });

    // Group drop
    details.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      details.classList.remove("drag-over");

      if (!draggedGroup || draggedGroup === details) return;

      const sourceIndex = parseInt(draggedGroup.dataset.groupIndex);
      let targetIndex = parseInt(details.dataset.groupIndex);

      // Reorder groups
      const [movedGroup] = groups.splice(sourceIndex, 1);

      // Adjust target index if we removed an item before it
      if (sourceIndex < targetIndex) {
        targetIndex--;
      }

      groups.splice(targetIndex, 0, movedGroup);

      saveGroups();
      renderGroups();
    });

    groupsEl.appendChild(details);
  });

  // reflect manage state in DOM
  document.body.classList.toggle("manage-on", manage);
  manageBtn.classList.toggle("active", manage);
}

let selectedResultIndex = 0;
let searchMatches = [];
let currentSearchQuery = "";
let showingAllResults = false;

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeHtml(query)})`, "gi");
  return escaped.replace(regex, '<mark>$1</mark>');
}

function makeSearchTile(link, query) {
  const a = document.createElement("a");
  a.className = "tile";
  a.href = link.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  const nameHighlighted = highlightText(link.name, query);
  const descHighlighted = highlightText(link.desc || "", query);

  a.innerHTML = `
    <div class="name">${nameHighlighted}</div>
    <div class="desc">${descHighlighted}</div>
  `;

  return a;
}

function renderSearchResults(showAll = false) {
  const resultCount = document.getElementById("resultCount");
  const emptyState = document.getElementById("emptyState");
  const showAllBtn = document.getElementById("showAllBtn");
  const showAllButton = document.getElementById("showAllButton");

  resultsGrid.innerHTML = "";

  if (searchMatches.length === 0) {
    // Show empty state
    resultsGrid.style.display = "none";
    emptyState.style.display = "block";
    showAllBtn.style.display = "none";
    resultCount.textContent = "";
  } else {
    // Show results
    resultsGrid.style.display = "grid";
    emptyState.style.display = "none";
    resultCount.textContent = `${searchMatches.length} ${searchMatches.length === 1 ? "result" : "results"}`;

    const resultsToShow = showAll ? searchMatches : searchMatches.slice(0, 12);
    resultsToShow.forEach((l) => resultsGrid.appendChild(makeSearchTile(l, currentSearchQuery)));

    // Show "Show All" button if there are more than 12 results and we're not showing all
    if (searchMatches.length > 12 && !showAll) {
      showAllBtn.style.display = "block";
      showAllButton.textContent = `Show All ${searchMatches.length} Results`;
    } else {
      showAllBtn.style.display = "none";
    }

    // Highlight first result
    updateResultSelection();
  }
}

function filterTiles(query) {
  query = query.trim().toLowerCase();
  currentSearchQuery = query;
  showingAllResults = false;

  if (!query) {
    resultsEl.classList.remove("active");
    resultsGrid.innerHTML = "";
    searchMatches = [];
    selectedResultIndex = 0;
    document.getElementById("showAllBtn").style.display = "none";
    return;
  }

  const matches = [];
  groups.forEach((g) =>
    g.links.forEach((l) => {
      const hay = (l.name + " " + (l.desc || "") + " " + l.url).toLowerCase();
      if (hay.includes(query)) matches.push(l);
    })
  );

  searchMatches = matches;
  selectedResultIndex = 0;

  resultsEl.classList.add("active");
  renderSearchResults(false);
}

function updateResultSelection() {
  const tiles = resultsGrid.querySelectorAll(".tile");
  tiles.forEach((tile, index) => {
    tile.classList.toggle("selected", index === selectedResultIndex);
  });

  // Scroll selected tile into view
  if (tiles[selectedResultIndex]) {
    tiles[selectedResultIndex].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}

function navigateResults(direction) {
  const tiles = resultsGrid.querySelectorAll(".tile");
  if (tiles.length === 0) return;

  if (direction === "down") {
    selectedResultIndex = (selectedResultIndex + 1) % tiles.length;
  } else if (direction === "up") {
    selectedResultIndex = (selectedResultIndex - 1 + tiles.length) % tiles.length;
  }

  updateResultSelection();
}

function openSelectedMatch() {
  const tiles = resultsGrid.querySelectorAll(".tile");
  const selected = tiles[selectedResultIndex];
  if (selected) {
    window.open(selected.href, "_blank", "noopener,noreferrer");
  }
}

// === Manage actions =================================================

async function addGroup() {
  const name = await showInputModal("Add New Group", "Group name:", "New Group", "Create Group");
  if (!name) return;
  groups.push({ name: name.trim() || "Untitled", open: true, links: [] });
  saveGroups();
  renderGroups();
}

async function renameGroup(gi) {
  const g = groups[gi];
  if (!g) return;
  const name = await showInputModal("Rename Group", "Group name:", g.name, "Save");
  if (!name) return;
  g.name = name.trim() || "Untitled";
  saveGroups();
  renderGroups();
}

async function deleteGroup(gi) {
  const g = groups[gi];
  if (!g) return;
  const message = `Delete group "${g.name}"?\n\nThis will remove ${g.links.length} links.`;
  const ok = await showConfirmModal("Delete Group", message, "Delete Group", true);
  if (!ok) return;
  groups.splice(gi, 1);
  saveGroups();
  renderGroups();
}

async function addLink(gi) {
  const g = groups[gi];
  if (!g) return;
  const result = await showLinkModal(`Add Link to "${g.name}"`, {}, "Add Link");
  if (!result) return;
  g.links.push({
    name: result.name.trim() || "(no name)",
    url: normalizeUrl(result.url),
    desc: result.desc.trim(),
  });
  saveGroups();
  renderGroups();
}

async function editLink(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];
  const result = await showLinkModal("Edit Link", link, "Save Changes");
  if (!result) return;

  link.name = result.name.trim() || "(no name)";
  link.url = normalizeUrl(result.url);
  link.desc = result.desc.trim();

  saveGroups();
  renderGroups();
}

async function deleteLink(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];
  const message = `Delete link "${link.name}" from group "${g.name}"?`;
  const ok = await showConfirmModal("Delete Link", message, "Delete Link", true);
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
  // Initialize modal system
  initModal();

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
      openSelectedMatch();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateResults("down");
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateResults("up");
    }
    if (e.key === "Escape") {
      qEl.value = "";
      filterTiles("");
      qEl.blur();
    }
  });

  // Show All Results button
  const showAllButton = document.getElementById("showAllButton");
  if (showAllButton) {
    showAllButton.addEventListener("click", () => {
      showingAllResults = true;
      renderSearchResults(true);
    });
  }

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

  // Auto-scroll during drag
  document.addEventListener("dragover", (e) => {
    if (draggedTile || draggedGroup) {
      handleDragAutoScroll(e.clientY);
    }
  });

  // Stop auto-scroll when drag leaves the window
  document.addEventListener("dragleave", (e) => {
    if (e.target === document.documentElement || e.target === document.body) {
      stopAutoScroll();
    }
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




























