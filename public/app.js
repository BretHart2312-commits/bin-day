const API_BASE = "/api";

const STORAGE_KEYS = {
  uprn: "binapp:uprn",
  address: "binapp:address",
};

const BIN_COLORS = {
  "BLACK BIN": "#2b2b2b",
  "BLUE BIN": "#1a5fb4",
  "GREEN BIN": "#2e7d32",
  "FOOD CADDY": "#8a5a2b",
};

const el = (id) => document.getElementById(id);
const setupPostcode = el("setup-postcode");
const setupAddress = el("setup-address");
const mainView = el("main-view");
const spinner = el("spinner");
const postcodeInput = el("postcode");
const postcodeError = el("postcode-error");
const addrList = el("addr-list");
const addrCurrent = el("addr-current");
const weekLabel = el("week-label");
const binList = el("bin-list");

function showOnly(view) {
  [setupPostcode, setupAddress, mainView].forEach((v) => v.classList.add("hidden"));
  view.classList.remove("hidden");
}

function showSpinner(show) {
  spinner.classList.toggle("hidden", !show);
}

function parseAddresses(html) {
  const re = /data-address\s*=\s*"([^"]+)"[\s\S]*?data-id\s*=\s*"([^"]+)"/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ address: m[1].trim(), uprn: m[2].trim() });
  }
  return out;
}

function parseCollections(html) {
  const re = /aria-label="([^"]+)"/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const label = m[1];
    const parts = label.split(" collection on ");
    if (parts.length !== 2) continue;
    const [type, dateStr] = parts;
    const date = parseLongDate(dateStr.trim());
    if (date) out.push({ type: type.trim(), date });
  }
  return out;
}

function parseLongDate(str) {
  const months = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  const m = str.match(/\w+\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = months[m[2].toLowerCase()];
  const year = parseInt(m[3], 10);
  if (month === undefined) return null;
  return new Date(year, month, day);
}

function getCurrentWeekRange(now = new Date()) {
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function fmtRange(start, end) {
  const opts = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

function fmtDay(date) {
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

async function fetchAddresses(postcode) {
  const url = `${API_BASE}/addresses?postcode=${encodeURIComponent(postcode)}`;
  const res = await fetch(url);
  if (res.status === 400) throw new Error("Postcode not found. Check it and try again.");
  if (!res.ok) throw new Error("Could not reach the council's server. Try again shortly.");
  const data = await res.json();
  return parseAddresses(data.addresses || "");
}

async function fetchCollections(uprn) {
  const url = `${API_BASE}/collections?uprn=${encodeURIComponent(uprn)}&numberOfCollections=16`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load your bin schedule. Try again shortly.");
  const data = await res.json();
  return parseCollections(data.tableRows || "");
}

function renderThisWeek(collections) {
  const { start, end } = getCurrentWeekRange();
  weekLabel.textContent = `This week: ${fmtRange(start, end)}`;

  // Normalise today to the start of the calendar day.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all collections from today onwards.
  const futureCollections = collections
    .filter((c) => c.date >= today)
    .sort((a, b) => a.date - b.date);

  binList.innerHTML = "";

  if (futureCollections.length === 0) {
    binList.innerHTML = '<div class="empty">No collections scheduled.</div>';
    return;
  }

  // If there are collections remaining this week, show them all.
  const thisWeek = futureCollections.filter(
    (c) => c.date <= end
  );

  const collectionsToShow = thisWeek.length > 0
    ? thisWeek
    : [futureCollections[0]];

  for (const item of collectionsToShow) {
    const row = document.createElement("div");
    row.className = "bin-item";
    const color = BIN_COLORS[item.type.toUpperCase()] || "#999";
    row.innerHTML = `
      <div class="swatch" style="background:${color}"></div>
      <div class="bin-info">
        <div class="bin-type">${item.type}</div>
        <div class="bin-date">${fmtDay(item.date)}</div>
      </div>
    `;
    binList.appendChild(row);
  }
}

async function loadMainView() {
  const uprn = localStorage.getItem(STORAGE_KEYS.uprn);
  const address = localStorage.getItem(STORAGE_KEYS.address);
  if (!uprn) {
    showOnly(setupPostcode);
    return;
  }
  addrCurrent.textContent = address || "";
  showOnly(mainView);
  showSpinner(true);
  try {
    const collections = await fetchCollections(uprn);
    renderThisWeek(collections);
  } catch (err) {
    binList.innerHTML = `<div class="empty">${err.message}</div>`;
  } finally {
    showSpinner(false);
  }
}

el("btn-find-address").addEventListener("click", async () => {
  const postcode = postcodeInput.value.trim();
  postcodeError.classList.add("hidden");
  if (!postcode) {
    postcodeError.textContent = "Enter a postcode.";
    postcodeError.classList.remove("hidden");
    return;
  }
  showSpinner(true);
  try {
    const addresses = await fetchAddresses(postcode);
    if (addresses.length === 0) {
      throw new Error("No addresses found for that postcode.");
    }
    addrList.innerHTML = "";
    for (const a of addresses) {
      const li = document.createElement("li");
      li.textContent = a.address;
      li.addEventListener("click", () => {
        localStorage.setItem(STORAGE_KEYS.uprn, a.uprn);
        localStorage.setItem(STORAGE_KEYS.address, a.address);
        loadMainView();
      });
      addrList.appendChild(li);
    }
    showOnly(setupAddress);
  } catch (err) {
    postcodeError.textContent = err.message;
    postcodeError.classList.remove("hidden");
  } finally {
    showSpinner(false);
  }
});

el("btn-back-postcode").addEventListener("click", () => showOnly(setupPostcode));

el("btn-change-address").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.uprn);
  localStorage.removeItem(STORAGE_KEYS.address);
  postcodeInput.value = "";
  showOnly(setupPostcode);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

loadMainView();
