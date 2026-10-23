/* ============================================================
   Mission Mow v1 — site data layer + page logic.
   Everything is stored in the browser (localStorage), so the
   site runs with zero backend. Data model mirrors PRD.md:
   families, businesses, requests (open -> claimed -> done).
   ============================================================ */

const STORAGE_NAMESPACE = document.body.dataset.storageNamespace;
const DB_KEY = STORAGE_NAMESPACE ? `${STORAGE_NAMESPACE}_db` : "mission_mow_v1";
const SES_KEY = STORAGE_NAMESPACE ? `${STORAGE_NAMESPACE}_session` : "mission_mow_session";
const CONTENT_KEY = STORAGE_NAMESPACE ? `${STORAGE_NAMESPACE}_content` : "mission_mow_content";

/* ---------- tiny helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
const today = () => new Date().toISOString().slice(0, 10);
const IMPACT_START_DATE = "2026-10-22";
const ADMIN_PASSWORD = "SandpiperSandbridge!2025";
const CONTENT_FIELDS = [
  ["Home", "home.hero.eyebrow", "Homepage hero label", "Neighbor-to-neighbor support"],
  ["Home", "home.hero.title", "Homepage hero headline", "The home front deserves support."],
  ["Home", "home.hero.lede", "Homepage hero description", "Mission Mow makes it easier for lawn care businesses to donate one stop on a route they are already driving to a military family managing life at home."],
  ["Home", "home.hero.note", "Homepage challenge note", "Built for the 2026 Congressional App Challenge."],
  ["Home", "home.intro.eyebrow", "How it works label", "How Mission Mow works"],
  ["Home", "home.intro.title", "How it works headline", "A simple match with real local impact."],
  ["Home", "home.quote.text", "Homepage quote", "“Our veterans deserve more than words of gratitude. They deserve the results.”"],
  ["Home", "home.quote.credit", "Homepage quote credit", "— Congresswoman Jen Kiggans (VA-02)"],
  ["Home", "home.impact.eyebrow", "Impact board label", "Community impact board"],
  ["Home", "home.impact.title", "Impact board headline", "Small stops. Meaningful relief."],
  ["Home", "home.impact.description", "Impact board description", "These totals update after you complete a mow."],
  ["Home", "home.callout.eyebrow", "Homepage closing label", "Built for Virginia's 2nd District"],
  ["Home", "home.callout.title", "Homepage closing headline", "When service takes someone away, a neighborhood can step in."],
  ["Families", "family.heading.eyebrow", "Families page label", "For military families"],
  ["Families", "family.heading.title", "Families page headline", "Start with a request."],
  ["Families", "family.heading.lede", "Families page description", "Share the basic lawn details that help a nearby business decide when it can donate a visit."],
  ["Families", "family.profile.eyebrow", "Family profile label", "Step 1"],
  ["Families", "family.profile.title", "Family profile heading", "Create your family profile"],
  ["Families", "family.privacy.eyebrow", "Privacy label", "How Mission Mow protects privacy"],
  ["Families", "family.privacy.title", "Privacy heading", "Only share what is needed."],
  ["Businesses", "business.heading.eyebrow", "Businesses page label", "For lawn care businesses"],
  ["Businesses", "business.heading.title", "Businesses page headline", "Make room for one more stop."],
  ["Businesses", "business.heading.lede", "Businesses page description", "Claim a nearby request on a route you already serve and turn a normal workday into meaningful community support."],
  ["Businesses", "business.profile.eyebrow", "Business profile label", "Step 1"],
  ["Businesses", "business.profile.title", "Business profile heading", "Join as a partner business"],
  ["Businesses", "business.principle.eyebrow", "Business principle label", "One principle"],
  ["Businesses", "business.principle.title", "Business principle heading", "Local routes make local generosity easier."],
  ["Minigame", "minigame.heading.eyebrow", "Minigame label", "A quick neighborhood challenge"],
  ["Minigame", "minigame.heading.title", "Minigame headline", "MISSION MINIGAME"],
  ["Minigame", "minigame.heading.lede", "Minigame description", "Drive the mower across a 3D lawn and cut every tall-grass patch before the clock expires."],
  ["Minigame", "minigame.route.eyebrow", "Minigame route label", "Your route"],
  ["Minigame", "minigame.route.title", "Minigame route heading", "Drive your mower through the tall grass."],
];
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const normalizeZip = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 5);
const validZip = (value) => /^\d{5}$/.test(value);
const parseZips = (value) => [...new Set(String(value ?? "")
  .split(",")
  .map(normalizeZip)
  .filter(validZip))];

const contentDefaults = Object.fromEntries(CONTENT_FIELDS.map(([, key, , value]) => [key, value]));
const loadContent = () => {
  try { return JSON.parse(localStorage.getItem(CONTENT_KEY)) || { text: {}, images: {} }; }
  catch (e) { return { text: {}, images: {} }; }
};
const saveContent = (content) => localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
const heroBackground = (url) => `linear-gradient(90deg, rgba(19,22,32,.24), rgba(19,22,32,.04)), url(${JSON.stringify(url)})`;
function applyContentChanges() {
  const content = loadContent();
  document.querySelectorAll("[data-edit-key]").forEach((element) => {
    const key = element.dataset.editKey;
    element.textContent = content.text?.[key] ?? contentDefaults[key] ?? element.textContent;
  });
  document.querySelectorAll("[data-image-key]").forEach((element) => {
    const image = content.images?.[element.dataset.imageKey];
    if (image?.url) element.style.backgroundImage = heroBackground(image.url);
    const target = document.querySelector(`[data-image-layout-target="${element.dataset.imageKey}"]`);
    if (target) target.classList.toggle("hero-image-left", image?.layout === "left");
  });
}

function renderContentEditor(overlay) {
  const dialog = overlay.querySelector(".admin-dialog");
  const content = loadContent();
  const groups = CONTENT_FIELDS.reduce((result, field) => {
    (result[field[0]] ||= []).push(field);
    return result;
  }, {});
  const textSections = Object.entries(groups).map(([page, fields]) => `
    <section class="editor-section">
      <h3>${esc(page)} page text</h3>
      <div class="editor-grid">${fields.map(([, key, label, defaultValue]) => `
        <label class="editor-field">${esc(label)}
          <textarea data-content-key="${esc(key)}">${esc(content.text?.[key] ?? defaultValue)}</textarea>
        </label>`).join("")}</div>
    </section>`).join("");
  const heroImage = content.images?.["home.hero"] || {};

  dialog.classList.add("admin-editor");
  dialog.innerHTML = `
    <button class="admin-dialog-close" type="button" aria-label="Close admin panel">×</button>
    <p class="eyebrow red">Private area</p>
    <h2 id="admin-dialog-title">Site editor</h2>
    <p class="admin-editor-intro">Changes are saved in this browser. Update the words below, then choose Save changes.</p>
    <form class="content-editor-form">
      <section class="editor-section">
        <h3>Homepage photo</h3>
        <div class="editor-grid">
          <label class="editor-field">Photo web address
            <input type="url" data-image-url-for="home.hero" value="${esc(heroImage.url || "")}" placeholder="https://example.com/photo.jpg">
          </label>
          <label class="editor-field">Photo placement
            <select data-image-layout-for="home.hero">
              <option value="right"${heroImage.layout === "left" ? "" : " selected"}>Right side</option>
              <option value="left"${heroImage.layout === "left" ? " selected" : ""}>Left side</option>
            </select>
          </label>
          <label class="editor-field">Or upload a photo
            <input type="file" data-image-file-for="home.hero" accept="image/*">
          </label>
        </div>
      </section>
      ${textSections}
      <div class="editor-actions"><button class="primary-button" type="submit">Save changes <span aria-hidden="true">→</span></button><p class="editor-status" aria-live="polite"></p></div>
    </form>`;

  const close = () => overlay.remove();
  dialog.querySelector(".admin-dialog-close").addEventListener("click", close);
  dialog.querySelectorAll("[data-image-file-for]").forEach((input) => input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const urlInput = dialog.querySelector(`[data-image-url-for="${input.dataset.imageFileFor}"]`);
      urlInput.value = reader.result;
    });
    reader.readAsDataURL(file);
  }));
  dialog.querySelector(".content-editor-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const nextContent = loadContent();
    nextContent.text ||= {};
    nextContent.images ||= {};
    dialog.querySelectorAll("[data-content-key]").forEach((field) => {
      nextContent.text[field.dataset.contentKey] = field.value.trim();
    });
    const heroUrl = dialog.querySelector("[data-image-url-for='home.hero']").value.trim();
    const heroLayout = dialog.querySelector("[data-image-layout-for='home.hero']").value;
    nextContent.images["home.hero"] = { url: heroUrl, layout: heroLayout };
    try {
      saveContent(nextContent);
      applyContentChanges();
      dialog.querySelector(".editor-status").textContent = "Saved. Your updates are now live in this browser.";
    } catch (error) {
      dialog.querySelector(".editor-status").textContent = "That image is too large to save here. Try a smaller image or use its web address.";
    }
  });
}

/* ---------- seed site data (only used on first load) ---------- */
function seedDB() {
  return {
    families: [
      { id: "f1", name: "Sarah Mitchell", email: "sarah.m@example.com", phone: "", branch: "Navy", created: "2026-10-10" },
      { id: "f2", name: "Jessica Torres", email: "jessica.t@example.com", phone: "", branch: "Army", created: "2026-10-12" },
    ],
    businesses: [
      { id: "b1", company: "GreenStripe Lawn Co.", contact: "Mike Delgado", email: "mike@greenstripe.example", phone: "757-555-0142", zips: ["23456", "23452", "23464"], crew: 3, created: "2026-10-08" },
      { id: "b2", company: "Tidewater Turf Care", contact: "Dana Whitfield", email: "dana@tidewaterturf.example", phone: "757-555-0198", zips: ["23462", "23464"], crew: 2, created: "2026-10-09" },
    ],
    requests: [
      { id: "r1", familyId: "f1", zip: "23456", size: "Medium (typical suburban lot)", lastMowed: "2026-10-03", days: "Thu or Fri", notes: "Gate code 4412. Dog in backyard — please latch the gate.", status: "open", businessId: null, created: "2026-10-14", completedAt: null },
      { id: "r2", familyId: "f2", zip: "23452", size: "Large (corner lot / acreage)", lastMowed: "2026-09-28", days: "Weekends", notes: "Corner lot — side gate on Elm St.", status: "open", businessId: null, created: "2026-10-15", completedAt: null },
      { id: "r3", familyId: "f1", zip: "23456", size: "Small (townhouse / small lot)", lastMowed: "2026-09-20", days: "Any", notes: "", status: "done", businessId: "b1", created: "2026-10-02", completedAt: "2026-10-11" },
      { id: "r4", familyId: "f2", zip: "23452", size: "Medium (typical suburban lot)", lastMowed: "2026-09-15", days: "Any", notes: "", status: "done", businessId: "b2", created: "2026-10-01", completedAt: "2026-10-09" },
      { id: "r5", familyId: "f1", zip: "23456", size: "Medium (typical suburban lot)", lastMowed: "2026-09-01", days: "Any", notes: "", status: "done", businessId: "b1", created: "2026-09-25", completedAt: "2026-10-04" },
    ],
  };
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupted storage -> reseed */ }
  const db = seedDB();
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}
const saveDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

function getSession() {
  try { return JSON.parse(localStorage.getItem(SES_KEY)) || {}; }
  catch (e) { return {}; }
}
const setSession = (s) => localStorage.setItem(SES_KEY, JSON.stringify(s));

const getFamily = (db, id) => db.families.find((f) => f.id === id);
const getBusiness = (db, id) => db.businesses.find((b) => b.id === id);

function pill(status) {
  const label = { open: "Open", claimed: "Claimed", done: "Done" }[status] || status;
  return `<span class="pill pill-${esc(status)}">${esc(label)}</span>`;
}

/* ---------- home page: live impact board ---------- */
function initHome() {
  const db = loadDB();
  const done = db.requests.filter((r) => r.status === "done" && r.completedAt >= IMPACT_START_DATE);
  const families = new Set(done.map((r) => r.familyId)).size;
  const businesses = new Set(done.map((r) => r.businessId).filter(Boolean)).size;
  $("#stat-mows").textContent = done.length;
  $("#stat-families").textContent = families;
  $("#stat-businesses").textContent = businesses;
}

function initCoverageMap() {
  const mapElement = $("#coverage-map");
  if (!mapElement || mapElement.dataset.ready) return;
  if (!window.maplibregl) {
    mapElement.textContent = "The interactive coverage map could not load. Please check your internet connection and refresh.";
    return;
  }
  mapElement.dataset.ready = "true";
  const points = [
    { type: "business", name: "GreenStripe Lawn Co.", area: "Virginia Beach service area", coordinates: [-76.091, 36.822] },
    { type: "business", name: "Tidewater Turf Care", area: "Norfolk service area", coordinates: [-76.293, 36.878] },
    { type: "business", name: "Harbor Lawn & Garden", area: "Chesapeake service area", coordinates: [-76.272, 36.758] },
    { type: "business", name: "Peninsula Mowing", area: "Hampton service area", coordinates: [-76.394, 37.031] },
    { type: "home", name: "Participating home area", area: "Newport News", coordinates: [-76.476, 37.092] },
    { type: "home", name: "Participating home area", area: "Hampton", coordinates: [-76.378, 37.053] },
    { type: "home", name: "Participating home area", area: "Portsmouth", coordinates: [-76.345, 36.834] },
    { type: "home", name: "Participating home area", area: "Chesapeake", coordinates: [-76.248, 36.718] },
    { type: "home", name: "Participating home area", area: "Norfolk", coordinates: [-76.271, 36.865] },
    { type: "home", name: "Participating home area", area: "Virginia Beach", coordinates: [-76.049, 36.855] },
    { type: "home", name: "Participating home area", area: "Virginia Beach", coordinates: [-76.114, 36.779] },
    { type: "home", name: "Participating home area", area: "Suffolk", coordinates: [-76.622, 36.762] },
    { type: "home", name: "Participating home area", area: "Chesapeake", coordinates: [-76.219, 36.793] },
    { type: "home", name: "Participating home area", area: "Norfolk", coordinates: [-76.309, 36.903] },
  ];
  const map = new window.maplibregl.Map({
    container: mapElement,
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: [-76.31, 36.89],
    zoom: 8.7,
    maxBounds: [[-76.8, 36.55], [-75.82, 37.38]],
    scrollZoom: false,
  });
  map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
  map.on("load", () => points.forEach((point) => {
    const markerElement = document.createElement("button");
    markerElement.className = `map-marker ${point.type}`;
    markerElement.type = "button";
    markerElement.setAttribute("aria-label", `${point.name}, ${point.area}`);
    const popup = new window.maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
      <p class="map-popup-type">${point.type === "business" ? "Lawn care business" : "Participating home area"}</p>
      <p class="map-popup-title">${esc(point.name)} — ${esc(point.area)}</p>
      <p class="map-popup-copy">${point.type === "business" ? "Sample partner coverage area." : "Sample neighborhood point. Exact family locations are never displayed."}</p>`);
    new window.maplibregl.Marker({ element: markerElement, anchor: "center" })
      .setLngLat(point.coordinates)
      .setPopup(popup)
      .addTo(map);
  }));
}

/* ---------- family page ---------- */
function setStatusMessage(selector, message) {
  const el = $(selector);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("hidden", !message);
}

function renderFamilyDash(db, family, message = "") {
  $("#family-greeting").textContent = `Welcome, ${family.name.split(" ")[0]}`;
  const mine = db.requests
    .filter((r) => r.familyId === family.id)
    .sort((a, b) => b.created.localeCompare(a.created));
  const active = mine.find((r) => r.status !== "done");
  $("#request-card").classList.toggle("hidden", Boolean(active));
  setStatusMessage("#family-status-message", message || (active
    ? "You already have an active request. It is shown on the right."
    : ""));
  const list = $("#family-requests");
  if (!mine.length) {
    list.innerHTML = `<li class="empty">No requests yet — post your first mow on the left.</li>`;
    return;
  }
  list.innerHTML = mine.map((r) => {
    const biz = r.businessId ? getBusiness(db, r.businessId) : null;
    return `<li class="req">
      <div class="req-top"><span class="req-title">Lawn request — ${esc(r.zip)}</span>${pill(r.status)}</div>
      <div class="req-meta">${esc(r.size)} &middot; last mowed ${esc(fmtDate(r.lastMowed))} &middot; preferred: ${esc(r.days || "any")}</div>
      ${biz ? `<div class="req-meta"><strong>${esc(biz.company)}</strong> is on it${r.status === "done" ? ` — completed ${esc(fmtDate(r.completedAt))}` : ""}.</div>` : `<div class="req-meta">Waiting for a nearby business to claim it.</div>`}
      ${r.notes ? `<div class="req-notes">${esc(r.notes)}</div>` : ""}
      ${r.status === "open" ? `<div class="req-actions"><button class="btn-ghost" data-withdraw="${esc(r.id)}">Withdraw request</button></div>` : ""}
    </li>`;
  }).join("");
  list.querySelectorAll("[data-withdraw]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const db2 = loadDB();
      db2.requests = db2.requests.filter((x) => x.id !== btn.dataset.withdraw);
      saveDB(db2);
      renderFamilyDash(db2, family, "Your request was withdrawn. You can post another one now.");
    })
  );
}

function initFamily() {
  const db = loadDB();
  const ses = getSession();
  let family = ses.familyId ? getFamily(db, ses.familyId) : null;

  const showDash = () => {
    $("#family-signup-view").classList.add("hidden");
    $("#family-dash-view").classList.remove("hidden");
    renderFamilyDash(loadDB(), family);
  };
  if (family) showDash();

  $("#family-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const db2 = loadDB();
    family = {
      id: uid("f"), name: $("#ff-name").value.trim(), email: $("#ff-email").value.trim(),
      phone: $("#ff-phone").value.trim(), branch: $("#ff-branch").value, created: today(),
    };
    db2.families.push(family);
    saveDB(db2);
    setSession({ ...getSession(), familyId: family.id });
    showDash();
  });

  $("#request-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const db2 = loadDB();
    const active = db2.requests.find((r) => r.familyId === family.id && r.status !== "done");
    if (active) {
      alert("You already have an active request. Withdraw it before posting a new one.");
      return;
    }
    const zip = normalizeZip($("#rf-zip").value);
    if (!validZip(zip)) {
      setStatusMessage("#family-status-message", "Enter a valid five-digit ZIP code.");
      return;
    }
    db2.requests.push({
      id: uid("r"), familyId: family.id, zip,
      size: $("#rf-size").value, lastMowed: $("#rf-last").value,
      days: $("#rf-days").value.trim(), notes: $("#rf-notes").value.trim(),
      status: "open", businessId: null, created: today(), completedAt: null,
    });
    saveDB(db2);
    e.target.reset();
    renderFamilyDash(db2, family, "Your request is open. A nearby partner business can now claim it.");
  });
}

/* ---------- business page ---------- */
function requestCard(db, r, action, showPrivateDetails = false) {
  const fam = getFamily(db, r.familyId);
  const title = showPrivateDetails && fam ? `${fam.name.split(" ")[0]}'s lawn` : "A military family's lawn";
  return `<li class="req">
    <div class="req-top"><span class="req-title">${esc(title)} — ${esc(r.zip)}</span>${pill(r.status)}</div>
    <div class="req-meta">${esc(r.size)} &middot; preferred: ${esc(r.days || "any")} &middot; posted ${esc(fmtDate(r.created))}</div>
    ${showPrivateDetails ? `<div class="private-details"><strong>Private job details unlocked</strong><br>Last mowed: ${esc(fmtDate(r.lastMowed))}${r.notes ? `<br>Notes for the crew: ${esc(r.notes)}` : ""}<br>Families and businesses coordinate the service time after a claim.</div>` : ""}
    <div class="req-actions">${action}</div>
  </li>`;
}

function renderBizDash(db, biz, message = "") {
  $("#biz-greeting").textContent = `Welcome, ${biz.company}`;
  setStatusMessage("#biz-status-message", message);
  const zips = new Set(biz.zips);

  const nearby = db.requests
    .filter((r) => r.status === "open" && zips.has(r.zip))
    .sort((a, b) => a.created.localeCompare(b.created));
  $("#nearby-list").innerHTML = nearby.length
    ? nearby.map((r) => requestCard(db, r,
        `<button class="btn btn-small" data-claim="${esc(r.id)}">Claim this mow</button>`)).join("")
    : `<li class="empty">Nothing open in your ZIPs right now. Check back soon — new requests post every week.</li>`;

  const mine = db.requests
    .filter((r) => r.businessId === biz.id && r.status === "claimed")
    .sort((a, b) => a.created.localeCompare(b.created));
  $("#my-jobs").innerHTML = mine.length
    ? mine.map((r) => requestCard(db, r,
        `<button class="btn btn-small" data-complete="${esc(r.id)}">Mark complete</button>`, true)).join("")
    : `<li class="empty">No claimed jobs yet.</li>`;

  document.querySelectorAll("[data-claim]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const db2 = loadDB();
      const r = db2.requests.find((x) => x.id === btn.dataset.claim);
      if (r && r.status === "open") {
        r.status = "claimed";
        r.businessId = biz.id;
        saveDB(db2);
        renderBizDash(db2, biz, "You claimed this request. Private job details are now available below.");
        return;
      }
      renderBizDash(db2, biz, "That request is no longer available.");
    }));
  document.querySelectorAll("[data-complete]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const db2 = loadDB();
      const r = db2.requests.find((x) => x.id === btn.dataset.complete);
      if (r && r.status === "claimed") {
        r.status = "done";
        r.completedAt = today();
        saveDB(db2);
        renderBizDash(db2, biz, "Mow marked complete. The Community Impact Board has been updated.");
        return;
      }
      renderBizDash(db2, biz);
    }));
}

function initBusiness() {
  const db = loadDB();
  const ses = getSession();
  let biz = ses.businessId ? getBusiness(db, ses.businessId) : null;

  const showDash = () => {
    $("#biz-signup-view").classList.add("hidden");
    $("#biz-dash-view").classList.remove("hidden");
    renderBizDash(loadDB(), biz);
  };
  if (biz) showDash();

  $("#biz-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const db2 = loadDB();
    const zips = parseZips($("#bf-zips").value);
    if (!zips.length) {
      $("#bf-zips").setCustomValidity("Enter one or more five-digit ZIP codes, separated by commas.");
      $("#bf-zips").reportValidity();
      return;
    }
    $("#bf-zips").setCustomValidity("");
    biz = {
      id: uid("b"), company: $("#bf-company").value.trim(), contact: $("#bf-contact").value.trim(),
      email: $("#bf-email").value.trim(), phone: $("#bf-phone").value.trim(),
      zips,
      crew: parseInt($("#bf-crew").value, 10) || 1, created: today(),
    };
    db2.businesses.push(biz);
    saveDB(db2);
    setSession({ ...getSession(), businessId: biz.id });
    showDash();
  });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadDB(); // seeds on first visit
  applyContentChanges();
  const page = document.body.dataset.page;
  if (page === "home") {
    initHome();
    initCoverageMap();
  }
  if (page === "family") initFamily();
  if (page === "business") initBusiness();

  const openAdminPanel = () => {
    const overlay = document.createElement("div");
    overlay.className = "admin-sign-in";
    overlay.innerHTML = `
      <section class="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <button class="admin-dialog-close" type="button" aria-label="Close admin panel">×</button>
        <p class="eyebrow red">Private area</p>
        <h2 id="admin-dialog-title">Admin panel</h2>
        <p>Enter the password to edit site.</p>
        <form class="admin-sign-in-form">
          <label for="admin-password">Password</label>
          <input id="admin-password" name="password" type="password" autocomplete="current-password" required>
          <p class="admin-sign-in-error" aria-live="polite"></p>
          <button class="primary-button" type="submit">Continue <span aria-hidden="true">→</span></button>
        </form>
      </section>`;
    const close = () => overlay.remove();
    overlay.querySelector(".admin-dialog-close").addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector(".admin-sign-in-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const error = overlay.querySelector(".admin-sign-in-error");
      if (overlay.querySelector("input").value !== ADMIN_PASSWORD) {
        error.textContent = "That password is not correct. Try again.";
        overlay.querySelector("input").select();
        return;
      }
      renderContentEditor(overlay);
    });
    document.body.append(overlay);
    overlay.querySelector("input").focus();
  };

  document.querySelectorAll(".admin-access").forEach((btn) =>
    btn.addEventListener("click", openAdminPanel));
});
