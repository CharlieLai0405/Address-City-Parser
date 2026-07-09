(function (global) {
  "use strict";

  const requiredColumns = [
    "country",
    "province_std",
    "city_alias",
    "city_std",
    "city_en",
    "code",
    "level",
  ];
  const runtimeColumns = ["country", "city_alias", "city_std", "city_en"];

  function convertRows(rows, headers, countryValue) {
    const country = String(countryValue || "").trim().toUpperCase();
    const missing = requiredColumns.filter((column) => !headers.includes(column));
    if (missing.length) {
      throw new Error(`Database 缺少欄位：${missing.join(", ")}`);
    }

    const runtimeRows = rows
      .filter((row) => String(row.country).trim().toUpperCase() === country)
      .map((row) => Object.fromEntries(
        runtimeColumns.map((column) => [column, String(row[column] ?? "").trim()]),
      ))
      .filter((row) => row.city_alias && row.city_en);

    if (!runtimeRows.length) {
      throw new Error(`Excel 中找不到 country = ${country} 的有效 alias。`);
    }
    return runtimeRows;
  }

  function createPayload(countryValue, runtimeRows) {
    const country = String(countryValue).trim().toUpperCase();
    return (
      "window.CITY_DATABASES=window.CITY_DATABASES||{};"
      + `window.CITY_DATABASES.${country}=`
      + JSON.stringify(runtimeRows)
      + ";\n"
    );
  }

  global.DatabaseConverterCore = {
    requiredColumns,
    runtimeColumns,
    convertRows,
    createPayload,
  };
})(window);
