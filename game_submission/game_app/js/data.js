// Data loading and CSV parsing

const dataCache = { loaded: false, items: [], pairs: [] };

// CSV parser
export function parseCSV(text) {
  const rows = [];
  let i = 0,
    val = "",
    row = [],
    inQuotes = false;
  const pushVal = () => {
    row.push(val);
    val = "";
  };
  const pushRow = () => {
    rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          val += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      } else {
        val += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === ",") {
        pushVal();
        i++;
        continue;
      }
      if (ch === "\n") {
        pushVal();
        pushRow();
        i++;
        continue;
      }
      if (ch === "\r") {
        i++;
        continue;
      }
      val += ch;
      i++;
    }
  }
  if (val.length || row.length) {
    pushVal();
    pushRow();
  }
  const headers = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.length && r.some((c) => c.trim() !== ""))
    .map((r) => {
      const o = {};
      headers.forEach((h, idx) => {
        o[h] = (r[idx] ?? "").trim();
      });
      return o;
    });
}

// Load data from CSV files
export async function loadData() {
  if (dataCache.loaded) return dataCache;
  const [itemsRes, pairsRes] = await Promise.all([
    fetch("assets/data/items_rows.csv"),
    fetch("assets/data/item_pairs_rows.csv"),
  ]);
  const [itemsText, pairsText] = await Promise.all([
    itemsRes.text(),
    pairsRes.text(),
  ]);
  const itemsRaw = parseCSV(itemsText);
  const pairsRaw = parseCSV(pairsText);
  const items = itemsRaw
    .map((x) => ({
      id: Number(x.id),
      type: x.type,
      media_type: x.media_type,
      url: x.media_url,
      is_fake: String(x.is_fake).toLowerCase() === "true",
      explanation: x.explanation || "",
      source: x.source || "",
    }))
    .filter(
      (x) => (x.media_type === "image" || x.media_type === "video") && x.url
    );
  const itemsMap = new Map(items.map((it) => [it.id, it]));
  const pairItemIds = new Set();
  const pairs = pairsRaw
    .map((p) => {
      const id = Number(p.id);
      const a = itemsMap.get(Number(p.item_1_id));
      const b = itemsMap.get(Number(p.item_2_id));
      if (a) pairItemIds.add(a.id);
      if (b) pairItemIds.add(b.id);
      if (!a || !b) return null;
      const flip = Math.random() < 0.5;
      const left = flip ? b : a;
      const right = flip ? a : b;
      const numFake = (left.is_fake ? 1 : 0) + (right.is_fake ? 1 : 0);
      let target = "fake";
      if (numFake === 1) target = "fake";
      else {
        const numReal = (left.is_fake ? 0 : 1) + (right.is_fake ? 0 : 1);
        target = numReal === 1 ? "real" : "fake";
      }
      let correctIndex = 0;
      if (target === "fake") correctIndex = left.is_fake ? 0 : 1;
      else correctIndex = left.is_fake ? 1 : 0;
      return { type: "pair", id, left, right, target, correctIndex };
    })
    .filter(Boolean);
  const singles = items
    .filter((x) => !pairItemIds.has(x.id))
    .map((it) => ({ type: "single", item: it }));
  dataCache.loaded = true;
  dataCache.items = singles;
  dataCache.pairs = pairs;
  return dataCache;
}
