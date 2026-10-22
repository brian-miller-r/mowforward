/* ============================================================
   MowForward v1 — prototype data layer + page logic.
   Everything is stored in the browser (localStorage), so the
   demo runs with zero backend. Data model mirrors PRD.md:
   families, businesses, requests (open -> claimed -> done).
   ============================================================ */

const DB_KEY = "mowforward_v1";
const SES_KEY = "mowforward_session";

/* ---------- tiny helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
const today = () => new Date().toISOString().slice(0, 10);
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

/* ---------- seed demo data (only used on first load) ---------- */
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
  const done = db.requests.filter((r) => r.status === "done");
  const families = new Set(done.map((r) => r.familyId)).size;
  const businesses = new Set(done.map((r) => r.businessId).filter(Boolean)).size;
  $("#stat-mows").textContent = done.length;
  $("#stat-families").textContent = families;
  $("#stat-businesses").textContent = businesses;
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
    ${showPrivateDetails ? `<div class="private-details"><strong>Private job details unlocked</strong><br>Last mowed: ${esc(fmtDate(r.lastMowed))}${r.notes ? `<br>Notes for the crew: ${esc(r.notes)}` : ""}<br>For this prototype, families and businesses coordinate the service time after a claim.</div>` : ""}
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
        renderBizDash(db2, biz, "Mow marked complete. The Demo Impact Board has been updated.");
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
  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "family") initFamily();
  if (page === "business") initBusiness();

  document.querySelectorAll(".reset-demo").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (confirm("Reset all demo data?")) {
        localStorage.removeItem(DB_KEY);
        localStorage.removeItem(SES_KEY);
        location.reload();
      }
    }));
});
