(() => {
  "use strict";

  const converter = window.DatabaseConverterCore;

  const form = document.querySelector("#converterForm");
  const countrySelect = document.querySelector("#countrySelect");
  const fileInput = document.querySelector("#databaseFile");
  const fileName = document.querySelector("#databaseFileName");
  const message = document.querySelector("#converterMessage");

  function showMessage(text, success = false) {
    message.textContent = text;
    message.classList.toggle("success", success);
    message.hidden = false;
  }

  fileInput.addEventListener("change", () => {
    fileName.textContent = fileInput.files[0]?.name || "選擇城市 database Excel";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.hidden = true;

    const file = fileInput.files[0];
    const country = countrySelect.value.toUpperCase();
    if (!file || !file.name.toLowerCase().endsWith(".xlsx")) {
      showMessage("請選擇 .xlsx 格式的城市 database。");
      return;
    }

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), {
        type: "array",
        cellDates: false,
      });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
      const headers = rows.length
        ? Object.keys(rows[0])
        : XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })[0] || [];
      const runtimeRows = converter.convertRows(rows, headers, country);
      const payload = converter.createPayload(country, runtimeRows);
      const blob = new Blob([payload], { type: "text/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${country}_city_database.js`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showMessage(
        `已產生 ${country}_city_database.js，共 ${runtimeRows.length.toLocaleString()} 筆 alias。`,
        true,
      );
    } catch (error) {
      showMessage(error.message || "Database 轉換失敗。");
    }
  });
})();
