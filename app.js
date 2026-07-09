(() => {
  "use strict";

  const CONFIG = window.APP_CONFIG || {
    input: { address_col: "original_address", country_col: "country" },
    output: {
      result_excel: "address_with_city.xlsx",
      unmatched_excel: "unmatched_address.xlsx",
    },
  };
  const ADDRESS_COLUMN = CONFIG.input.address_col;
  const COUNTRY_COLUMN = CONFIG.input.country_col;
  const RESULT_COLUMNS = [
    "city_raw",
    "city_en",
    "city_std",
    "matched_alias",
    "matched_country",
    "confidence",
    "need_review",
    "note",
  ];
  const PREVIEW_COLUMNS = [
    ADDRESS_COLUMN,
    COUNTRY_COLUMN,
    "city_en",
    "city_std",
    "matched_alias",
    "confidence",
    "need_review",
    "note",
  ];

  const form = document.querySelector("#parseForm");
  const fileInput = document.querySelector("#fileInput");
  const fileName = document.querySelector("#fileName");
  const parseButton = document.querySelector("#parseButton");
  const message = document.querySelector("#message");
  const resultsSection = document.querySelector("#results");
  const loading = document.querySelector("#loading");
  const fullButton = document.querySelector("#downloadFull");
  const unmatchedButton = document.querySelector("#downloadUnmatched");

  let fullResults = [];
  let unmatchedResults = [];
  let exportHeaders = [...RESULT_COLUMNS];

  const parser = window.AddressParserCore.createParser(
    window.CITY_DATABASES || {},
    CONFIG,
  );

  function showMessage(text, success = false) {
    message.textContent = text;
    message.classList.toggle("success", success);
    message.hidden = false;
  }

  function clearMessage() {
    message.hidden = true;
    message.textContent = "";
  }

  function setLoading(active) {
    loading.hidden = !active;
    parseButton.disabled = active;
  }

  function renderPreview(rows) {
    const head = document.querySelector("#previewHead");
    const body = document.querySelector("#previewBody");
    head.replaceChildren();
    body.replaceChildren();

    const heading = document.createElement("tr");
    PREVIEW_COLUMNS.forEach((column) => {
      const cell = document.createElement("th");
      cell.textContent = column;
      heading.appendChild(cell);
    });
    head.appendChild(heading);

    rows.slice(0, 20).forEach((row) => {
      const tableRow = document.createElement("tr");
      PREVIEW_COLUMNS.forEach((column) => {
        const cell = document.createElement("td");
        const value = row[column] ?? "";
        cell.textContent = typeof value === "boolean" ? (value ? "True" : "False") : value;
        cell.title = String(value);
        tableRow.appendChild(cell);
      });
      body.appendChild(tableRow);
    });
  }

  function columnWidths(rows) {
    if (!rows.length) return [];
    return Object.keys(rows[0]).map((column) => {
      const width = rows.slice(0, 200).reduce(
        (largest, row) => Math.max(largest, String(row[column] ?? "").length),
        column.length,
      );
      return { wch: Math.min(Math.max(width + 2, 11), 48) };
    });
  }

  function downloadWorkbook(rows, filename) {
    const sheet = XLSX.utils.json_to_sheet(rows, { header: exportHeaders });
    sheet["!cols"] = columnWidths(rows);
    if (sheet["!ref"]) sheet["!autofilter"] = { ref: sheet["!ref"] };
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Results");
    XLSX.writeFile(workbook, filename, { compression: true });
  }

  fileInput.addEventListener("change", () => {
    fileName.textContent = fileInput.files[0]?.name || "按這裡選擇 Excel";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();
    const file = fileInput.files[0];

    if (!window.XLSX) {
      showMessage("找不到本機 Excel 讀寫程式，請確認 vendor 資料夾沒有被移除。");
      return;
    }
    if (!file || !file.name.toLowerCase().endsWith(".xlsx")) {
      showMessage("請選擇 .xlsx 格式的 Excel 檔案。");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 30));

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false });
      const headers = rows.length
        ? Object.keys(rows[0])
        : XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" })[0] || [];
      const missing = [ADDRESS_COLUMN, COUNTRY_COLUMN].filter(
        (column) => !headers.includes(column),
      );

      if (missing.length) {
        throw new Error(`Excel 缺少必要欄位：${missing.join(", ")}`);
      }

      exportHeaders = [...headers, ...RESULT_COLUMNS.filter((column) => !headers.includes(column))];
      fullResults = rows.map((row) => ({ ...row, ...parser.parseRow(row) }));
      unmatchedResults = fullResults.filter(
        (row) => row.need_review === true || !String(row.city_en || "").trim(),
      );

      const matched = fullResults.filter((row) => String(row.city_en || "").trim()).length;
      const review = fullResults.filter((row) => row.need_review === true).length;
      document.querySelector("#totalRows").textContent = fullResults.length.toLocaleString();
      document.querySelector("#matchedRows").textContent = matched.toLocaleString();
      document.querySelector("#unmatchedRows").textContent = unmatchedResults.length.toLocaleString();
      document.querySelector("#reviewRows").textContent = review.toLocaleString();
      renderPreview(fullResults);
      resultsSection.hidden = false;
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      showMessage(error.message || "Excel 解析失敗。");
      resultsSection.hidden = true;
    } finally {
      setLoading(false);
    }
  });

  fullButton.addEventListener("click", () =>
    downloadWorkbook(fullResults, CONFIG.output.result_excel),
  );
  unmatchedButton.addEventListener("click", () =>
    downloadWorkbook(unmatchedResults, CONFIG.output.unmatched_excel),
  );
})();
