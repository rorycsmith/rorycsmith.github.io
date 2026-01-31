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


// Preset color palette for link color coding
const PRESET_COLORS = {
  none: "",
  red: "#f0997d",
  orange: "#ffa94d",
  yellow: "#ffd43b",
  green: "#8ce99a",
  blue: "#74c0fc",
  purple: "#b197fc",
  gray: "#b0b4aa"
};

// Storage keys
// Use versioned keys so we can migrate old data safely
const GROUPS_KEY = "local_dashboard_groups_personal_v2";
const GROUPS_KEY_V1 = "local_dashboard_groups_personal_v1";

// App state
let manage = false;
let groups = loadGroups();

// Basic HTML escaping for user-provided text
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

// Simple deep copy (used for defaults)
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
  // Delay focus so the modal is painted first
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
    const colorVal = link.color || "";
    const tagsVal = (link.tags && link.tags.length > 0) ? link.tags.join(", ") : "";

    // Build color options HTML
    let colorOptions = "";
    for (const [key, value] of Object.entries(PRESET_COLORS)) {
      const selected = key === colorVal ? "selected" : "";
      const colorLabel = key.charAt(0).toUpperCase() + key.slice(1);
      colorOptions += `<option value="${key}" ${selected}>${colorLabel}</option>`;
    }

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
      <div class="modal-field">
        <label class="modal-label">Color (optional)</label>
        <select class="modal-select" id="modalLinkColor">
          ${colorOptions}
        </select>
        <div class="color-preview" id="colorPreview"></div>
      </div>
      <div class="modal-field">
        <label class="modal-label">Tags (optional)</label>
        <input type="text" class="modal-input" id="modalLinkTags" value="${escapeHtml(tagsVal)}" placeholder="work, important, dev (comma-separated)" />
      </div>
      <div class="link-preview">
        <div class="link-preview-label">Preview</div>
        <div class="link-preview-tile" id="previewTile">
          <div class="link-preview-name" id="previewName">${escapeHtml(nameVal || "Link Name")}</div>
          <div class="link-preview-desc" id="previewDesc">${escapeHtml(descVal || "Description will appear here")}</div>
          <div class="link-preview-url" id="previewUrl">${escapeHtml(urlVal)}</div>
          <div class="link-preview-color-accent" id="previewColorAccent"></div>
        </div>
      </div>
    `;

    modalConfirm.textContent = confirmText;
    modalConfirm.className = "modal-btn modal-btn-primary";

    const nameInput = document.getElementById("modalLinkName");
    const urlInput = document.getElementById("modalLinkUrl");
    const descInput = document.getElementById("modalLinkDesc");
    const colorInput = document.getElementById("modalLinkColor");
    const tagsInput = document.getElementById("modalLinkTags");
    const previewName = document.getElementById("previewName");
    const previewDesc = document.getElementById("previewDesc");
    const previewUrl = document.getElementById("previewUrl");
    const previewTile = document.getElementById("previewTile");
    const previewColorAccent = document.getElementById("previewColorAccent");
    const colorPreview = document.getElementById("colorPreview");

    // Live preview update
    const updatePreview = () => {
      previewName.textContent = nameInput.value.trim() || "Link Name";
      previewDesc.textContent = descInput.value.trim() || "Description will appear here";
      previewUrl.textContent = urlInput.value.trim() || "https://";

      // Update color preview
      const selectedColor = colorInput.value;
      if (selectedColor && selectedColor !== "none" && PRESET_COLORS[selectedColor]) {
        previewTile.style.borderBottom = `3px solid ${PRESET_COLORS[selectedColor]}`;
        colorPreview.style.background = PRESET_COLORS[selectedColor];
        colorPreview.style.display = "block";
      } else {
        previewTile.style.borderBottom = "";
        colorPreview.style.display = "none";
      }
    };

    nameInput.addEventListener("input", updatePreview);
    urlInput.addEventListener("input", updatePreview);
    descInput.addEventListener("input", updatePreview);
    colorInput.addEventListener("change", updatePreview);

    // Initial preview update
    updatePreview();

    const handleConfirm = () => {
      const name = nameInput.value.trim();
      const url = urlInput.value.trim();
      const desc = descInput.value.trim();
      const color = colorInput.value;
      const tags = tagsInput.value.trim()
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      if (!name || !url) {
        if (!name) nameInput.focus();
        else if (!url) urlInput.focus();
        return;
      }

      cleanup();
      closeModal();
      resolve({ name, url, desc, color, tags });
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
      colorInput.removeEventListener("change", updatePreview);
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
    let raw = localStorage.getItem(GROUPS_KEY);

    // Migration: Check for v1 data if v2 doesn't exist
    if (!raw) {
      const v1Data = localStorage.getItem(GROUPS_KEY_V1);
      if (v1Data) {
        // Migrate from v1 to v2
        raw = v1Data;
        // Note: We'll save migrated data when first modification happens
      }
    }

    if (!raw) return deepCopy(DEFAULT_GROUPS);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return deepCopy(DEFAULT_GROUPS);

    // Basic validation and add new fields
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
            // NEW FIELDS (with defaults for backward compatibility)
            color: String(l.color || "").trim(),
            tags: Array.isArray(l.tags) ? l.tags.filter(t => typeof t === "string") : [],
            favicon: String(l.favicon || "").trim(),
            stats: {
              visitCount: (l.stats && typeof l.stats.visitCount === "number") ? l.stats.visitCount : 0,
              lastVisited: (l.stats && typeof l.stats.lastVisited === "number") ? l.stats.lastVisited : 0,
              createdAt: (l.stats && typeof l.stats.createdAt === "number") ? l.stats.createdAt : Date.now()
            }
          })),
      }));
  } catch {
    return deepCopy(DEFAULT_GROUPS);
  }
}

function saveGroups() {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

// Normalize URLs so links always work
function normalizeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  // allow things like mailto:, file:, etc.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return s;
  return "https://" + s;
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "never";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

// Build a clickable tile DOM element from a link object
function makeTile(link, gi, li) {
  const a = document.createElement("a");
  a.className = "tile";
  a.href = link.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  // Add color data attribute if set
  if (link.color) {
    a.dataset.color = link.color;
  }

  // Build favicon or placeholder
  let faviconHtml = "";
  if (link.favicon) {
    faviconHtml = `<img class="tile-favicon" src="${escapeHtml(link.favicon)}" alt="" />`;
  } else {
    // Placeholder: first letter of domain or link emoji
    const firstLetter = link.name.charAt(0).toUpperCase();
    faviconHtml = `<span class="tile-favicon-placeholder">${escapeHtml(firstLetter)}</span>`;
  }

  // Build stats badge if visit count > 0
  let statsHtml = "";
  if (link.stats && link.stats.visitCount > 0) {
    const count = link.stats.visitCount;
    const lastVisited = link.stats.lastVisited;
    const timeAgo = formatTimeAgo(lastVisited);
    const badgeClass = count >= 51 ? "stat-badge-high" : count >= 11 ? "stat-badge-med" : "stat-badge-low";
    statsHtml = `<span class="stat-badge ${badgeClass}" title="Visited ${count} times, last: ${timeAgo}">${count}</span>`;
  }

  // Build tags HTML (show up to 3 tags)
  let tagsHtml = "";
  if (link.tags && link.tags.length > 0) {
    const visibleTags = link.tags.slice(0, 3);
    const moreTags = link.tags.length > 3 ? link.tags.length - 3 : 0;
    tagsHtml = `<div class="tile-tags">`;
    visibleTags.forEach(tag => {
      tagsHtml += `<span class="tag" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
    });
    if (moreTags > 0) {
      const allTagsStr = link.tags.map(t => escapeHtml(t)).join(", ");
      tagsHtml += `<span class="tag-more" title="${allTagsStr}">+${moreTags} more</span>`;
    }
    tagsHtml += `</div>`;
  }

  // Build color accent bar
  let colorAccentHtml = "";
  if (link.color && PRESET_COLORS[link.color]) {
    colorAccentHtml = `<div class="tile-color-accent"></div>`;
  }

  // Build main tile HTML
  a.innerHTML = `
    ${faviconHtml}
    <div class="tile-content">
      <div class="tile-header">
        <div class="name">${escapeHtml(link.name)}</div>
        ${statsHtml}
      </div>
      ${link.desc ? `<div class="desc">${escapeHtml(link.desc)}</div>` : ""}
      ${tagsHtml}
    </div>
    <button class="tile-quick-actions-btn" type="button" title="Quick actions">⋯</button>
    ${colorAccentHtml}
  `;

  // Prevent navigation when in manage mode (so dragging doesn't open links)
  a.addEventListener("click", (e) => {
    if (manage) {
      e.preventDefault();
    } else {
      // Track visit statistics
      if (gi !== -1 && li !== -1) {
        link.stats.visitCount++;
        link.stats.lastVisited = Date.now();
        saveGroups();
      }
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
      // Don't drag if clicking on quick actions button or menu
      if (e.target.closest(".tile-quick-actions-btn, .quick-actions-menu")) {
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

  // Quick actions button
  const quickActionsBtn = a.querySelector(".tile-quick-actions-btn");
  if (quickActionsBtn) {
    quickActionsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showQuickActionsMenu(a, link, gi, li);
    });
  }

  // Tag click handlers (for filtering)
  const tagElements = a.querySelectorAll(".tag");
  tagElements.forEach(tagEl => {
    tagEl.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tagName = tagEl.dataset.tag;
      if (tagName) {
        // Set search to filter by tag
        qEl.value = `#${tagName}`;
        filterTiles();
      }
    });
  });

  return a;
}

// Floating menu attached to a tile for quick actions
function showQuickActionsMenu(tileEl, link, gi, li) {
  // Close any existing menus
  document.querySelectorAll(".quick-actions-menu").forEach(m => m.remove());

  // Create menu
  const menu = document.createElement("div");
  menu.className = "quick-actions-menu";

  // Build menu items
  const actions = [
    { icon: "✎", label: "Edit Link", action: () => editLink(gi, li) },
    { icon: "📋", label: "Copy URL", action: () => {
      navigator.clipboard.writeText(link.url).then(() => {
        // Could show a toast notification here
      });
    }},
    { icon: "🎨", label: "Change Color", action: () => showColorPicker(gi, li) },
    { icon: "🏷️", label: "Manage Tags", action: () => showTagEditor(gi, li) },
    { icon: "🔄", label: "Refresh Favicon", action: () => refreshFavicon(gi, li) },
    { separator: true },
    { icon: "✕", label: "Delete Link", action: () => deleteLink(gi, li), danger: true }
  ];

  actions.forEach(item => {
    if (item.separator) {
      const sep = document.createElement("div");
      sep.className = "quick-actions-separator";
      menu.appendChild(sep);
    } else {
      const btn = document.createElement("button");
      btn.className = `quick-action${item.danger ? " danger" : ""}`;
      btn.type = "button";
      btn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.remove();
        item.action();
      });
      menu.appendChild(btn);
    }
  });

  // Position and show menu
  tileEl.appendChild(menu);

  // Position menu (adjust if near viewport edge)
  const tileRect = tileEl.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();

  // Check if menu would go off right edge
  if (tileRect.right + menuRect.width > window.innerWidth) {
    menu.style.right = "0";
    menu.style.left = "auto";
  } else {
    menu.style.left = "0";
  }

  // Check if menu would go off bottom edge
  if (tileRect.bottom + menuRect.height > window.innerHeight) {
    menu.style.bottom = "100%";
    menu.style.top = "auto";
  }

  // Close on outside click
  const closeHandler = (e) => {
    if (!menu.contains(e.target) && !tileEl.contains(e.target)) {
      menu.remove();
      document.removeEventListener("click", closeHandler);
    }
  };
  setTimeout(() => document.addEventListener("click", closeHandler), 0);

  // Close on Esc key
  const keyHandler = (e) => {
    if (e.key === "Escape") {
      menu.remove();
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("click", closeHandler);
    }
  };
  document.addEventListener("keydown", keyHandler);
}

// Quick action helper functions
// (these mutate the data model and re-render)
async function showColorPicker(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];

  // Create a quick color picker modal
  return new Promise((resolve) => {
    modalTitle.textContent = "Change Color";

    let colorOptions = "";
    for (const [key, value] of Object.entries(PRESET_COLORS)) {
      const selected = key === (link.color || "none") ? "selected" : "";
      const colorLabel = key.charAt(0).toUpperCase() + key.slice(1);
      const colorStyle = value ? `style="background: ${value};"` : "";
      colorOptions += `<div class="color-option ${selected}" data-color="${key}">
        <div class="color-swatch" ${colorStyle}></div>
        <span>${colorLabel}</span>
      </div>`;
    }

    modalBody.innerHTML = `
      <div class="color-picker-grid">
        ${colorOptions}
      </div>
    `;

    modalConfirm.textContent = "Cancel";
    modalConfirm.className = "modal-btn";

    const colorOptionEls = modalBody.querySelectorAll(".color-option");
    colorOptionEls.forEach(option => {
      option.addEventListener("click", () => {
        const color = option.dataset.color;
        link.color = color;
        saveGroups();
        renderGroups();
        closeModal();
        resolve();
      });
    });

    const handleCancel = () => {
      modalConfirm.removeEventListener("click", handleCancel);
      closeModal();
      resolve();
    };

    modalConfirm.addEventListener("click", handleCancel);
    showModal();
  });
}

async function showTagEditor(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];

  const tagsVal = (link.tags && link.tags.length > 0) ? link.tags.join(", ") : "";

  return new Promise((resolve) => {
    modalTitle.textContent = "Manage Tags";

    modalBody.innerHTML = `
      <div class="modal-field">
        <label class="modal-label">Tags (comma-separated)</label>
        <input type="text" class="modal-input" id="modalTagsInput" value="${escapeHtml(tagsVal)}" placeholder="work, important, dev" />
        <div class="modal-hint">Separate tags with commas. Tags help you filter and organize links.</div>
      </div>
      <div class="modal-field" id="tagSuggestions"></div>
    `;

    modalConfirm.textContent = "Save Tags";
    modalConfirm.className = "modal-btn modal-btn-primary";

    const tagsInput = document.getElementById("modalTagsInput");
    const tagSuggestions = document.getElementById("tagSuggestions");

    // Show existing tags from other links as suggestions
    const allTags = getAllTags();
    if (allTags.length > 0) {
      tagSuggestions.innerHTML = `<label class="modal-label">Suggestions (click to add)</label><div class="tag-suggestions">${allTags.map(tag => `<span class="tag-suggestion" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`).join("")}</div>`;

      const suggestionEls = tagSuggestions.querySelectorAll(".tag-suggestion");
      suggestionEls.forEach(suggestionEl => {
        suggestionEl.addEventListener("click", () => {
          const tag = suggestionEl.dataset.tag;
          const currentTags = tagsInput.value.trim();
          if (currentTags) {
            tagsInput.value = currentTags + ", " + tag;
          } else {
            tagsInput.value = tag;
          }
          tagsInput.focus();
        });
      });
    }

    const handleConfirm = () => {
      const tags = tagsInput.value.trim()
        .split(",")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      link.tags = tags;
      saveGroups();
      renderGroups();

      cleanup();
      closeModal();
      resolve();
    };

    const handleCancel = () => {
      cleanup();
      closeModal();
      resolve();
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
      tagsInput.removeEventListener("keydown", handleKeydown);
    };

    modalConfirm.addEventListener("click", handleConfirm);
    modalCancel.addEventListener("click", handleCancel);
    tagsInput.addEventListener("keydown", handleKeydown);

    showModal();
    tagsInput.focus();
  });
}

function getAllTags() {
  const tagSet = new Set();
  groups.forEach(g => {
    g.links.forEach(l => {
      if (l.tags) {
        l.tags.forEach(tag => tagSet.add(tag));
      }
    });
  });
  return Array.from(tagSet).sort();
}

async function refreshFavicon(gi, li) {
  const g = groups[gi];
  if (!g || !g.links[li]) return;
  const link = g.links[li];

  try {
    const favicon = await fetchFavicon(link.url);
    if (favicon) {
      link.favicon = favicon;
      saveGroups();
      renderGroups();
    }
  } catch (error) {
    console.error("Failed to fetch favicon:", error);
  }
}

// Favicon fetching functions
// Note: some sites block favicon fetches due to CORS
async function fetchFavicon(url) {
  try {
    const domain = new URL(url).origin;

    // Try 1: /favicon.ico
    let faviconData = await tryFetchFavicon(`${domain}/favicon.ico`);
    if (faviconData) return faviconData;

    // Try 2: Parse HTML for <link rel="icon">
    try {
      const html = await fetch(domain, { mode: 'no-cors' }).then(r => r.text());
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const iconLink = doc.querySelector('link[rel*="icon"]');
      if (iconLink) {
        const iconUrl = new URL(iconLink.getAttribute('href'), domain).href;
        faviconData = await tryFetchFavicon(iconUrl);
        if (faviconData) return faviconData;
      }
    } catch {
      // Parsing failed, continue to fallback
    }

    // Try 3: Return empty (will use placeholder)
    return "";
  } catch (error) {
    console.error("Favicon fetch error:", error);
    return "";
  }
}

async function tryFetchFavicon(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      img.src = "";
      resolve(null);
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);

      // Resize to 20x20 (matches our display size)
      canvas.width = 20;
      canvas.height = 20;

      try {
        ctx.drawImage(img, 0, 0, 20, 20);

        // Convert to data URL
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        }, "image/png", 0.7);
      } catch {
        // CORS error or other canvas issue
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };

    // Set crossOrigin to try to fetch with CORS
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

// Batch fetch favicons for a group or all groups
async function fetchFaviconsForGroup(gi) {
  const g = groups[gi];
  if (!g) return;

  const linksToFetch = g.links.filter(l => !l.favicon);
  if (linksToFetch.length === 0) {
    alert("All links in this group already have favicons!");
    return;
  }

  const confirmed = confirm(`Fetch favicons for ${linksToFetch.length} links in "${g.name}"?\n\nThis will make network requests to each link's domain.`);
  if (!confirmed) return;

  let fetched = 0;
  let failed = 0;

  for (let i = 0; i < linksToFetch.length; i++) {
    const link = linksToFetch[i];
    try {
      const favicon = await fetchFavicon(link.url);
      if (favicon) {
        link.favicon = favicon;
        fetched++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    // Save and update after each fetch (so we don't lose progress)
    saveGroups();
    renderGroups();
  }

  alert(`Fetch complete!\n✓ Fetched: ${fetched}\n✗ Failed: ${failed}`);
}

async function fetchAllFavicons() {
  const allLinks = groups.flatMap(g => g.links);
  const linksToFetch = allLinks.filter(l => !l.favicon);

  if (linksToFetch.length === 0) {
    alert("All links already have favicons!");
    return;
  }

  const confirmed = confirm(`Fetch favicons for ${linksToFetch.length} links across all groups?\n\nThis will make network requests to each link's domain.`);
  if (!confirmed) return;

  let fetched = 0;
  let failed = 0;

  for (let i = 0; i < linksToFetch.length; i++) {
    const link = linksToFetch[i];
    try {
      const favicon = await fetchFavicon(link.url);
      if (favicon) {
        link.favicon = favicon;
        fetched++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }

    // Save and update periodically (every 5 fetches)
    if (i % 5 === 0) {
      saveGroups();
      renderGroups();
    }
  }

  // Final save
  saveGroups();
  renderGroups();

  alert(`Fetch complete!\n✓ Fetched: ${fetched}\n✗ Failed: ${failed}`);
}

// Render all groups + tiles into the page
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

// Small simplified tile used in the search results panel
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

// Render search results panel (show top 12, or all)
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

// Search across links (name/desc/url or tags)
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

  // Check if this is a tag search (starts with #)
  if (query.startsWith("#")) {
    const tagQuery = query.slice(1).toLowerCase(); // Remove the # prefix
    groups.forEach((g) =>
      g.links.forEach((l) => {
        if (l.tags && l.tags.length > 0) {
          const tagMatch = l.tags.some(tag => tag.toLowerCase().includes(tagQuery));
          if (tagMatch) matches.push(l);
        }
      })
    );
  } else {
    // Regular search (name, desc, url)
    groups.forEach((g) =>
      g.links.forEach((l) => {
        const hay = (l.name + " " + (l.desc || "") + " " + l.url).toLowerCase();
        if (hay.includes(query)) matches.push(l);
      })
    );
  }

  searchMatches = matches;
  selectedResultIndex = 0;

  resultsEl.classList.add("active");
  renderSearchResults(false);
}

// Keyboard selection highlight in search results
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
// Create/rename/delete groups and links (all updates are saved)

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
    // Initialize new fields
    color: result.color || "",
    tags: result.tags || [],
    favicon: "",
    stats: {
      visitCount: 0,
      lastVisited: 0,
      createdAt: Date.now()
    }
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

  // Update new fields if provided
  if (result.color !== undefined) link.color = result.color;
  if (result.tags !== undefined) link.tags = result.tags;
  // Keep existing favicon and stats

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
let notesPreviewEl;
let togglePreviewBtn;
let expanded = true;
let saveTimer = null;

const NOTES_KEY = "local_dashboard_notes_v1";
const THEME_KEY = "local_dashboard_theme_v1";
const TILE_GAP_KEY = "local_dashboard_tile_gap_v1";
const TILE_PAD_KEY = "local_dashboard_tile_pad_v1";

let previewMode = false;
// Apply theme to document root and store it
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
// Update the live clock/date in the header

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

// === Tile size sliders ==============================================
// Apply separate gap/padding controls and keep related sizes in sync.
function applyTileSizing(gapValue, padValue) {
  const gap = Math.max(6, Math.min(20, Number(gapValue)));
  const padding = Math.max(6, Math.min(16, Number(padValue)));

  // Keep min-height tied to padding so tiles stay balanced
  const minHeight = Math.max(52, padding * 5 + 10);
  const managePad = padding + 18;

  const root = document.documentElement;
  root.style.setProperty("--tile-gap", `${gap}px`);
  root.style.setProperty("--tile-padding", `${padding}px`);
  root.style.setProperty("--tile-min-height", `${minHeight}px`);
  root.style.setProperty("--tile-padding-manage", `${managePad}px`);

  return { gap, padding, minHeight };
}

// === Minimal Markdown Renderer ======================================
// Standard Markdown only (headings, lists, emphasis, links, code, quotes).
function renderMarkdown(text) {
  let html = escapeHtml(text || "");

  // Extract fenced code blocks first
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const index = codeBlocks.length;
    codeBlocks.push(`<pre><code>${code}</code></pre>`);
    return `@@CODEBLOCK${index}@@`;
  });

  // Extract inline code so we don't parse inside it
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (_m, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<code>${code}</code>`);
    return `@@INLINECODE${index}@@`;
  });

  // Headings
  html = html.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
  html = html.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
  html = html.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
    const safeUrl = escapeHtml(url);
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // Bold then italics
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Ordered lists (use a marker to avoid conflicts with unordered lists)
  html = html.replace(/^\d+\.\s+(.*)$/gm, "<li data-ol>$1</li>");
  html = html.replace(/(<li data-ol>.*<\/li>\n?)+/g, (m) => `<ol>${m.replace(/\n/g, "")}</ol>`);
  html = html.replace(/ data-ol/g, "");

  // Unordered lists
  html = html.replace(/^(?:-|\*) (.*)$/gm, "<li data-ul>$1</li>");
  html = html.replace(/(<li data-ul>.*<\/li>\n?)+/g, (m) => `<ul>${m.replace(/\n/g, "")}</ul>`);
  html = html.replace(/ data-ul/g, "");

  // Line breaks (after block transforms)
  html = html.replace(/\n/g, "<br>");

  // Restore inline code
  html = html.replace(/@@INLINECODE(\d+)@@/g, (_m, i) => inlineCodes[Number(i)]);

  // Restore fenced code blocks
  html = html.replace(/@@CODEBLOCK(\d+)@@/g, (_m, i) => codeBlocks[Number(i)]);

  return html;
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
  importFile = document.getElementById("importFile");
  addGroupBtn = document.getElementById("addGroupBtn");


  notesEl = document.getElementById("notes");
  saveState = document.getElementById("saveState");
  clockEl = document.getElementById("clock");
  dateEl = document.getElementById("date");
  notesPreviewEl = document.getElementById("notesPreview");
  togglePreviewBtn = document.getElementById("togglePreviewBtn");
  const tileGapEl = document.getElementById("tileGap");
  const tilePadEl = document.getElementById("tilePad");
  const tileGapValueEl = document.getElementById("tileGapValue");
  const tilePadValueEl = document.getElementById("tilePadValue");

  // If any required element is missing, fail loudly (helps debugging "button does nothing").
  const required = {
    groupsEl, qEl, resultsEl, resultsGrid,
    manageBtn, addGroupBtn,
    importFile,
    notesEl, saveState,
    clockEl, dateEl,
    notesPreviewEl, togglePreviewBtn,
    tileGapEl, tilePadEl, tileGapValueEl, tilePadValueEl
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

  // --- Header Dropdowns ---
  const viewDropdownBtn = document.getElementById("viewDropdownBtn");
  const dataDropdownBtn = document.getElementById("dataDropdownBtn");

  function setupDropdown(triggerBtn) {
    const dropdown = triggerBtn.nextElementSibling;
    if (!dropdown) return;

    triggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      // Close other dropdowns
      document.querySelectorAll(".header-dropdown.active").forEach(d => {
        if (d !== dropdown) d.classList.remove("active");
      });

      // Toggle this dropdown
      dropdown.classList.toggle("active");
    });

    // Handle dropdown item clicks
    dropdown.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = item.dataset.action;

        // Close dropdown
        dropdown.classList.remove("active");

        // Execute action
        if (action === "theme") {
          toggleTheme();
        } else if (action === "expand") {
          expanded = !expanded;
          setAllSections(expanded);
        } else if (action === "export") {
          // Export action (same as backupBtn)
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
        } else if (action === "import") {
          importFile.click();
        }
      });
    });
  }

  if (viewDropdownBtn) setupDropdown(viewDropdownBtn);
  if (dataDropdownBtn) setupDropdown(dataDropdownBtn);

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".header-dropdown.active").forEach(d => {
      d.classList.remove("active");
    });
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
    if (previewMode) {
      notesPreviewEl.innerHTML = renderMarkdown(notesEl.value);
    }
  });

  // Markdown view toggle (one pane at a time)
  if (previewMode) {
    notesPreviewEl.innerHTML = renderMarkdown(notesEl.value);
    notesEl.style.display = "none";
    notesPreviewEl.style.display = "block";
    togglePreviewBtn.textContent = "Text View";
  }
  togglePreviewBtn.addEventListener("click", () => {
    previewMode = !previewMode;
    if (previewMode) {
      notesPreviewEl.innerHTML = renderMarkdown(notesEl.value);
      notesEl.style.display = "none";
      notesPreviewEl.style.display = "block";
      togglePreviewBtn.textContent = "Text View";
    } else {
      notesEl.style.display = "block";
      notesPreviewEl.style.display = "none";
      togglePreviewBtn.textContent = "Markdown View";
      notesEl.focus();
    }
  });

  // Keep preview scroll in sync with textarea when switching
  notesEl.addEventListener("scroll", () => {
    if (!previewMode) return;
    notesPreviewEl.scrollTop = notesEl.scrollTop;
    notesPreviewEl.scrollLeft = notesEl.scrollLeft;
  });

  // Theme
  setTheme(localStorage.getItem(THEME_KEY) || "dark");

  // Tile size sliders (gap + padding)
  const savedGap = localStorage.getItem(TILE_GAP_KEY);
  const savedPad = localStorage.getItem(TILE_PAD_KEY);
  const initialGap = savedGap !== null ? Number(savedGap) : 12;
  const initialPad = savedPad !== null ? Number(savedPad) : 10;
  tileGapEl.value = String(initialGap);
  tilePadEl.value = String(initialPad);
  const sizes = applyTileSizing(initialGap, initialPad);
  tileGapValueEl.textContent = `${sizes.gap}px`;
  tilePadValueEl.textContent = `${sizes.padding}px`;
  tileGapEl.title = `min-height ${sizes.minHeight}px`;
  tilePadEl.title = `min-height ${sizes.minHeight}px`;

  const syncTileSizing = () => {
    const gap = Number(tileGapEl.value);
    const pad = Number(tilePadEl.value);
    const next = applyTileSizing(gap, pad);
    tileGapValueEl.textContent = `${next.gap}px`;
    tilePadValueEl.textContent = `${next.padding}px`;
    tileGapEl.title = `min-height ${next.minHeight}px`;
    tilePadEl.title = `min-height ${next.minHeight}px`;
    localStorage.setItem(TILE_GAP_KEY, String(next.gap));
    localStorage.setItem(TILE_PAD_KEY, String(next.padding));
  };

  tileGapEl.addEventListener("input", syncTileSizing);
  tilePadEl.addEventListener("input", syncTileSizing);

  // (Theme, Expand, Export, Import actions are now handled by dropdowns)
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













