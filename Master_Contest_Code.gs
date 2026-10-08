/* ================================================================
   Code.gs — InsuranceDekho Health Agent Tool
   Functions:
   1. doGet                   — handles all URL requests
   2. getPartnerData          — contest GID lookup
   3. copyFilteredHealthData  — data pipeline (booking → contest sheet)
   4. trackVisit              — increment global visit counter
   5. getVisitCount           — return current visit count
================================================================ */

/* ── SHEET & CELL for visit counter ─────────────────────────────
   In your Summary sheet (1t7m7V...), cells O1/O2/O3 in Feedback tab store visit counter data.
   You can change VISIT_CELL to any unused cell.
──────────────────────────────────────────────────────────────── */
const VISIT_SHEET_ID = '1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo';
const VISIT_TAB      = 'Feedback';
const VISIT_CELL     = 'O1'; // O1=total, O2=last date, O3=today count

function doGet(e) {
  if (!e || !e.parameter) return ContentService.createTextOutput("OK");

  // ── Visit tracking ──
  const action = (e.parameter.action || '').toString().trim();
  if (action === 'visit') {
    const result = trackVisit();
    return ContentService.createTextOutput(JSON.stringify({ visits: result.total, today: result.todayCount }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Feedback ──
  if (action === 'feedback') {
    saveFeedback(e.parameter);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Analytics event tracker ──
  if (action === 'track') {
    trackEvent(e.parameter);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Init — returns all leaderboards + contests config ──
  if (action === 'init') {
    const contests  = getContestsConfig();
    const augLb     = getMasterLeaderboard('august',   5,  10); // col F — Aug Booked (sort), G=Offer
    const vliLb     = getMasterLeaderboard('vli',      9,  10); // col J — VLI Amount
    const goldLb    = getMasterLeaderboard('gold',     10, 10); // col K — Gold Booked (sort), M=Offer
    const multiyLb  = getMasterLeaderboard('multiyear',15, 10); // col P
    return ContentService.createTextOutput(JSON.stringify({
      contests:             contests,
      augustLeaderboard:    augLb,
      vliLeaderboard:       vliLb,
      goldLeaderboard:      goldLb,
      multiyearLeaderboard: multiyLb,
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // ── Contests config only ──
  if (action === 'contests') {
    return ContentService.createTextOutput(JSON.stringify(getContestsConfig()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Leaderboard ──
  if (action === 'leaderboard') {
    const lb = getLeaderboard();
    return ContentService.createTextOutput(JSON.stringify(lb))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── VLI Leaderboard ──
  if (action === 'vli_leaderboard') {
    const lb = getVliLeaderboard();
    return ContentService.createTextOutput(JSON.stringify(lb))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Contest GID lookup ──
  const gid = (e.parameter.gid || '').toString().toUpperCase().trim();
  if (!gid) return ContentService.createTextOutput("OK");
  const data = getPartnerData(gid);
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── LEADERBOARD: TOP 10 BY NET BOOKED PREMIUM ──────────────── */
function getLeaderboard() {
  const sheet = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo')
                               .getSheetByName('Summary');
  const rows = sheet.getDataRange().getValues().slice(2);
  return {
    leaderboard: rows
      .map(r => ({
        gid:    (r[0] || '').toString().toUpperCase().trim(),
        booked: parseFloat(String(r[2]).replace(/[^\d.]/g, '')) || 0,
      }))
      .filter(r => r.gid && r.booked > 0)
      .sort((a, b) => b.booked - a.booked)
      .slice(0, 10)
  };
}

/* ── VLI LEADERBOARD: TOP 10 BY VLI PREMIUM ─────────────────── */
function getVliLeaderboard() {
  const sheet = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo')
                               .getSheetByName('Summary');
  const rows = sheet.getDataRange().getValues().slice(2);

  Logger.log('Total rows: ' + rows.length);
  if (rows.length > 0) Logger.log('Sample row[0]: ' + JSON.stringify(rows[0].slice(0,8)));

  const entries = rows
    .map(r => ({
      gid:        (r[0] || '').toString().toUpperCase().trim(),
      vliPremium: parseFloat(String(r[12]).replace(/[^\d.]/g, '')) || 0, // col M — Jun VLI Premium
      vliAmount:  parseFloat(String(r[14]).replace(/[^\d.]/g, '')) || 0, // col O — Jun VLI Amount
    }))
    .filter(r => r.gid && r.vliPremium > 0)
    .sort((a, b) => b.vliPremium - a.vliPremium)
    .slice(0, 10);

  Logger.log('VLI entries found: ' + entries.length);
  return { leaderboard: entries };
}

/* ── VISIT COUNTER ───────────────────────────────────────────── */
function trackVisit() {
  try {
    const sheet = SpreadsheetApp.openById(VISIT_SHEET_ID).getSheetByName(VISIT_TAB);
    const tz    = Session.getScriptTimeZone();
    const today = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

    const totalCell = sheet.getRange("O1");
    const dateCell  = sheet.getRange("O2");
    const todayCell = sheet.getRange("O3");

    const total = (parseInt(totalCell.getValue()) || 0) + 1;

    // Force storedDate to string — getValue() can return a Date object
    const raw = dateCell.getValue();
    const storedDate = raw instanceof Date
      ? Utilities.formatDate(raw, tz, "yyyy-MM-dd")
      : String(raw || "").trim();

    const todayCount = storedDate === today
      ? (parseInt(todayCell.getValue()) || 0) + 1
      : 1;

    totalCell.setValue(total);
    dateCell.setValue(today);
    todayCell.setValue(todayCount);

    return { total, todayCount };
  } catch (err) {
    Logger.log('trackVisit error: ' + err);
    return { total: 0, todayCount: 0 };
  }
}

function getVisitCount() {
  try {
    const sheet = SpreadsheetApp.openById(VISIT_SHEET_ID).getSheetByName(VISIT_TAB);
    return parseInt(sheet.getRange("O1").getValue()) || 0;
  } catch (err) {
    return 0;
  }
}

/* ── MASTER LEADERBOARD ──────────────────────────────────────── */
function getMasterLeaderboard(type, colIdx, topN) {
  try {
    const sheet = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo')
                                 .getSheets()[0];
    const rows = sheet.getDataRange().getValues().slice(1);

    const entries = rows
      .map(r => {
        const gid    = (r[0] || '').toString().toUpperCase().trim();
        const booked = Math.round(parseFloat(r[colIdx]) || 0); // sort by this
        let offer = '', extra = 0;
        if (type === 'august') {
          offer = (r[6] || '').toString().trim();  // col G — August Offer text
          extra = Math.round(parseFloat(r[5]) || 0); // col F — Aug Booked
        }
        if (type === 'gold') {
          offer = (r[12] || '').toString().trim(); // col M — Gold Offer text
          extra = Math.round(parseFloat(r[10]) || 0); // col K — Gold Booked
        }
        const value = offer || booked; // show offer if available, else booked
        return { gid, value, extra, booked };
      })
      .filter(r => r.gid && r.booked > 0)
      .sort((a, b) => b.booked - a.booked)
      .slice(0, topN);

    return entries;
  } catch(e) {
    Logger.log('getMasterLeaderboard error (' + type + '): ' + e);
    return [];
  }
}

/* ── CONTEST: GID LOOKUP ──────────────────────────────────────── */
function getPartnerData(gid) {
  gid = gid.toString().toUpperCase().trim();

  const sheet = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo')
                               .getSheets()[0];
  const rows = sheet.getDataRange().getValues().slice(1); // skip header row

  const match = rows.find(row =>
    (row[0] || '').toString().toUpperCase().trim() === gid
  );

  if (!match) return { error: 'GID not found' };

  return {
    'gid':              gid,
    'jeeto sourced':    parseFloat(match[1])  || 0,  // B
    'jeeto booked':     parseFloat(match[2])  || 0,  // C
    'jeeto offer':      match[3]              || 0,  // D
    'august sourced':   parseFloat(match[4])  || 0,  // E
    'august booked':    parseFloat(match[5])  || 0,  // F
    'august offer':     match[6]              || 0,  // G
    'vli premium jul':  parseFloat(match[7])  || 0,  // H
    'vli % jul':        parseFloat(match[8])  || 0,  // I
    'vli amount jul':   parseFloat(match[9])  || 0,  // J
    'gold booked':      parseFloat(match[10]) || 0,  // K
    'gold sourced':     parseFloat(match[11]) || 0,  // L
    'gold offer':       match[12]             || 0,  // M
    'second nop':        parseFloat(match[13]) || 0,  // N
    'online reward':     parseFloat(match[14]) || 0,  // O
    'multiyear reward':  parseFloat(match[15]) || 0,  // P
    // September
    'sept sourced':      parseFloat(match[18]) || 0,  // S
    'sept booked':       parseFloat(match[19]) || 0,  // T
    'sept offer':        match[20]             || 0,  // U
    'vli premium sep':   parseFloat(match[21]) || 0,  // V
    'vli % sep':         parseFloat(match[22]) || 0,  // W
    'vli amount sep':    parseFloat(match[23]) || 0,  // X
    'second nop sep':    parseFloat(match[24]) || 0,  // Y
    // FLP Eligibility
    'flp 6months':       parseFloat(match[25]) || 0,  // Z
    'flp renewal':       parseFloat(match[26]) || 0,  // AA
    'flp cancellation':  parseFloat(match[27]) || 0,  // AB
    'flp eligible':      (match[28] || '').toString().trim(), // AC
    // October
    'oct sourced':       parseFloat(match[29]) || 0,  // AD
    'oct booked':        parseFloat(match[30]) || 0,  // AE
    'oct offer':         match[31]             || 0,  // AF
    'vli premium oct':   parseFloat(match[32]) || 0,  // AG
    'vli % oct':         parseFloat(match[33]) || 0,  // AH
    'vli amount oct':    parseFloat(match[34]) || 0,  // AI
    'second nop oct':    parseFloat(match[35]) || 0,  // AJ
    'online oct':        parseFloat(match[36]) || 0,  // AK
  };
}



/* Run this function ONCE manually from Apps Script editor.
   It creates the "Contests Config" tab with headers + current contests. */
function setupContestsConfig() {
  const ss = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo');

  // Delete existing tab if present
  const existing = ss.getSheetByName('Contests Config');
  if (existing) ss.deleteSheet(existing);

  // Create fresh tab
  const sheet = ss.insertSheet('Contests Config');

  // Headers
  const headers = [
    'name', 'type', 'month', 'start_date', 'end_date',
    'subtitle', 'banner_file', 'banner_start', 'banner_end'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Pre-populate current contests
  const rows = [
    // Past — April
    ['Health Payout Incentive', 'vli',    'April', '01-04-2026', '30-04-2026',
     'Apr 2026 · Max 15%', 'App Banner VLI.png', '01-04-2026', '30-04-2026'],
    ['Second Policy Contest',   'second', 'April', '09-04-2026', '10-05-2026',
     '9 Apr–30 Apr · Rs.800 on 2nd Policy', '', '', ''],
    // Past — May
    ['Health Payout Incentive', 'vli',    'May',   '01-05-2026', '31-05-2026',
     'May 2026 · Max 15%', 'App Banner VLI.png', '01-05-2026', '31-05-2026'],
    ['Second Policy Contest',   'second', 'May',   '01-05-2026', '31-05-2026',
     'May 2026 · Rs.800 on 2nd Policy', '', '', ''],
    // Active — Thailand Chalo
    ['Thailand Chalo',          'thailand', 'Jun', '01-04-2026', '30-06-2026',
     'Payment 1 Apr–30 Jun · Booking till 10 Jul',
     'App banner Thailand Chalo.png', '01-04-2026', '30-06-2026'],
  ];

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);

  Logger.log('Contests Config tab created with ' + rows.length + ' rows.');
  SpreadsheetApp.getUi().alert('Done! Contests Config tab created successfully.');
}

/*
   Reads the "Contests Config" tab in the Summary sheet.
   Expected columns (row 1 = headers, row 2+ = data):
   A: name        — display name (e.g. "Thailand Chalo")
   B: type        — thailand / vli / second
   C: month       — e.g. "May 2026" (used for Past label)
   D: start_date  — DD-MM-YYYY
   E: end_date    — DD-MM-YYYY
   F: subtitle    — short description shown in card
   G: banner_file — filename in public/ folder
   H: banner_start— DD-MM-YYYY
   I: banner_end  — DD-MM-YYYY

   Returns { active: [...], past: [...] }
   active = end_date >= today
   past   = end_date < today AND end_date >= first day of last month
*/
function getContestsConfig() {
  try {
    const ss    = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo');
    const sheet = ss.getSheetByName('Contests Config');
    if (!sheet) return { active: [], past: [] };

    const rows = sheet.getDataRange().getValues().slice(1); // skip header
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Last month cutoff — show past contests from last month only
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    function parseDate(raw) {
      if (!raw) return null;
      const s = String(raw).trim();
      const p = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (p) return new Date(parseInt(p[3]), parseInt(p[2]) - 1, parseInt(p[1]));
      const d = new Date(raw);
      return isNaN(d) ? null : d;
    }

    const active = [], past = [];

    rows.forEach(row => {
      const name       = String(row[0] || '').trim();
      const type       = String(row[1] || '').trim().toLowerCase();
      const month      = String(row[2] || '').trim();
      const startDate  = parseDate(row[3]);
      const endDate    = parseDate(row[4]);
      const subtitle   = String(row[5] || '').trim();
      const bannerFile = String(row[6] || '').trim();
      const bannerStart= parseDate(row[7]);
      const bannerEnd  = parseDate(row[8]);

      if (!name || !type || !endDate) return;

      // Is banner currently active?
      const bannerActive = bannerFile &&
        (!bannerStart || bannerStart <= today) &&
        (!bannerEnd   || bannerEnd   >= today);

      const contest = { name, type, month, subtitle, bannerFile: bannerActive ? bannerFile : null };

      if (endDate >= today) {
        active.push(contest);
      } else if (endDate >= lastMonth) {
        past.push(contest);
      }
    });

    return { active, past };
  } catch (err) {
    Logger.log('getContestsConfig error: ' + err);
    return { active: [], past: [] };
  }
}

/* ── DATA PIPELINE: COPY FILTERED HEALTH DATA ───────────────── */
function copyFilteredHealthData() {
  const SOURCE_ID = "12HUrXG_ZYFDRaGt3UYqtqpJ6Hf9_fjLC0FfO5CVAnb8";
  const DEST_ID   = "1t7m7VVJPB6L78pkENAJgdK3GlewIWx178jqUaeWw4wo";

  const sourceSheet = SpreadsheetApp.openById(SOURCE_ID).getSheetByName("Sourcing - Live - Health");
  if (!sourceSheet) throw new Error("Source sheet not found.");
  const destSheet = SpreadsheetApp.openById(DEST_ID).getSheets()[0];

  const lastRow = sourceSheet.getLastRow();
  const lastCol = sourceSheet.getLastColumn();
  Logger.log("Source lastRow=" + lastRow + ", lastCol=" + lastCol);
  if (lastRow < 2) { Logger.log("No data."); return; }

  // Read entire source sheet in one call
  const allData = sourceSheet.getRange(1, 1, lastRow, lastCol).getValues();
  const header  = allData[0];
  const rows    = allData.slice(1);

  const COL_DATE   = 47 - 1; // AU — payment_date
  const COL_AI     = 38 - 1; // AL — policy type
  const COL_GCD    = 54 - 1; // BB — GCD ID (exclude GCD84343)
  const COL_STATUS = 51 - 1; // AY — exclude Refund Completed, Cancelled, Refund Pending
  const COL_BT     = 72 - 1; // BT — keep only blank cells
  const EXCLUDE_GCD = "GCD84343";
  const EXCLUDE_STATUS = new Set(["refund completed", "cancelled", "refund pending"]);

  // ── DIAGNOSTIC: show actual header names at AY and AP, plus sample values ──
  Logger.log("Header at column AU (index 47): '" + header[COL_DATE] + "'");
  Logger.log("Header at column AL (index 38): '" + header[COL_AI] + "'");
  Logger.log("Sample row 2 — AU value: " + JSON.stringify(rows[0] ? rows[0][COL_DATE] : "N/A") +
             " | AL value: " + JSON.stringify(rows[0] ? rows[0][COL_AI] : "N/A"));
  Logger.log("Sample row 100 — AU value: " + JSON.stringify(rows[99] ? rows[99][COL_DATE] : "N/A") +
             " | AL value: " + JSON.stringify(rows[99] ? rows[99][COL_AI] : "N/A"));

  let skippedNoDate = 0, skippedRenew = 0, skippedBadDate = 0, skippedOutOfRange = 0,
      skippedExcludedGcd = 0, skippedStatus = 0, skippedBtNotBlank = 0;
  let sampleSkippedDates = [];

  // Filter: Apr-Jun 2026, exclude renew, exclude GCD84343, exclude status, BT must be blank
  const matched = [];
  for (let i = 0; i < rows.length; i++) {
    const row       = rows[i];
    const rawDate   = row[COL_DATE];
    const aiVal     = (row[COL_AI] || "").toString().trim().toLowerCase();
    const gcdVal    = (row[COL_GCD] || "").toString().trim().toUpperCase();
    const statusVal = (row[COL_STATUS] || "").toString().trim().toLowerCase();
    const btVal     = row[COL_BT];

    if (gcdVal === EXCLUDE_GCD) { skippedExcludedGcd++; continue; }
    if (EXCLUDE_STATUS.has(statusVal)) { skippedStatus++; continue; }
    if (btVal !== "" && btVal !== null && btVal !== undefined) { skippedBtNotBlank++; continue; }
    if (!rawDate) { skippedNoDate++; continue; }
    if (aiVal === "renew") { skippedRenew++; continue; }

    let year = 0, month = 0;
    if (rawDate instanceof Date) {
      year  = rawDate.getFullYear();
      month = rawDate.getMonth() + 1;
    } else {
      const str = String(rawDate).trim();
      if (!str || str === "NA") { skippedBadDate++; continue; }
      const d = new Date(str);
      if (isNaN(d.getTime())) { skippedBadDate++; continue; }
      year  = d.getFullYear();
      month = d.getMonth() + 1;
    }
    if (year === 2026 && month >= 4 && month <= 6) {
      matched.push(row);
    } else {
      skippedOutOfRange++;
      if (sampleSkippedDates.length < 5) sampleSkippedDates.push(rawDate + " -> year:" + year + " month:" + month);
    }
  }

  Logger.log("Matching rows: " + matched.length +
             " | Skipped — noDate: " + skippedNoDate +
             ", renew: " + skippedRenew +
             ", badDate: " + skippedBadDate +
             ", outOfRange: " + skippedOutOfRange +
             ", excludedGcd(" + EXCLUDE_GCD + "): " + skippedExcludedGcd +
             ", excludedStatus(AY): " + skippedStatus +
             ", btNotBlank: " + skippedBtNotBlank);
  Logger.log("Sample out-of-range dates: " + JSON.stringify(sampleSkippedDates));

  // ── RESUMABLE WRITE ──
  // First call (no saved progress) clears destination and starts writing.
  // If it times out, re-run copyFilteredHealthData() — it will detect the
  // saved progress and continue writing from where it left off using the
  // SAME matched dataset (recomputed identically from source, since source
  // hasn't changed). This guarantees ALL rows eventually get written.
  const props = PropertiesService.getScriptProperties();
  let writeRow = parseInt(props.getProperty('cfh_writeRow')) || 2;
  const isResume = writeRow > 2;

  if (!isResume) {
    destSheet.clearContents();
    destSheet.getRange(1, 1, 1, lastCol).setValues([header]);
    Logger.log("Fresh start — destination cleared, header written. Total to write: " + matched.length);
  } else {
    Logger.log("Resuming write from row " + writeRow + " (matched.length=" + matched.length + ")");
  }

  // matchedAlreadyWritten = how many matched rows correspond to writeRow
  const alreadyWrittenCount = writeRow - 2;

  const writeStart = new Date().getTime();
  const MAX_WRITE_MS = 4.5 * 60 * 1000; // stop writing before 6-min hard limit
  const WRITE_CHUNK = 500;
  let stoppedEarly = false;

  for (let i = alreadyWrittenCount; i < matched.length; i += WRITE_CHUNK) {
    if (new Date().getTime() - writeStart > MAX_WRITE_MS) {
      stoppedEarly = true;
      props.setProperty('cfh_writeRow', String(writeRow));
      Logger.log("⏸ Time guard hit — saved progress at row " + (writeRow - 1) +
                 " / " + matched.length + " total matched. " +
                 "RUN copyFilteredHealthData() AGAIN to continue — it will resume automatically.");
      break;
    }
    const slice = matched.slice(i, i + WRITE_CHUNK);
    destSheet.getRange(writeRow, 1, slice.length, lastCol).setValues(slice);
    SpreadsheetApp.flush();
    writeRow += slice.length;
    Logger.log("Written rows up to: " + (writeRow - 1) + " / " + matched.length);
  }

  if (!stoppedEarly) {
    props.deleteProperty('cfh_writeRow');
    Logger.log("✅ ALL DONE. Total rows written: " + (writeRow - 2) + " / " + matched.length +
               ". Complete copy finished.");
  }
}

/* ── FEEDBACK HANDLER ────────────────────────────────────────── */
function saveFeedback(params) {
  try {
    const ss    = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo');
    let sheet   = ss.getSheetByName('Feedback');
    if (!sheet) {
      sheet = ss.insertSheet('Feedback');
      sheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Name', 'Message', 'GID']]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      params.name    || 'Anonymous',
      params.message || '',
      params.gid     || '',
    ]);
  } catch (err) {
    Logger.log('saveFeedback error: ' + err);
  }
}

function trackEvent(params) {
  try {
    const ss    = SpreadsheetApp.openById('1W8o7ZV07AVFAw3gliLYknEPCPixlu9sBGZD5K1FAdFo');
    let sheet   = ss.getSheetByName('Analytics');

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Analytics');
      sheet.getRange(1, 1, 1, 7).setValues([[
        'Timestamp', 'Event', 'Category', 'Detail_1', 'Detail_2', 'GID', 'Session'
      ]]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    }

    const row = [
      new Date(),
      params.event    || '',
      params.category || '',
      params.detail1  || '',
      params.detail2  || '',
      params.gid      || '',
      params.session  || '',
    ];

    sheet.appendRow(row);
  } catch (err) {
    Logger.log('trackEvent error: ' + err);
  }
}

/* ── Call this ONCE if you want to force a completely fresh copy
   (e.g. source data changed and old saved progress is stale) ── */
function resetCopyFilteredHealthData() {
  PropertiesService.getScriptProperties().deleteProperty('cfh_writeRow');
  Logger.log("Progress reset. Next run of copyFilteredHealthData() will start fresh.");
}
