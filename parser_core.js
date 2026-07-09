(function (global) {
  "use strict";

  function normalizeText(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/\u3000/g, " ")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function prepareDatabases(source) {
    const prepared = {};
    Object.keys(source || {}).forEach((country) => {
      prepared[country.toUpperCase()] = source[country]
        .map((row) => ({
          ...row,
          _normalizedAlias: normalizeText(row.city_alias),
        }))
        .filter((row) => row._normalizedAlias)
        .sort((a, b) => b._normalizedAlias.length - a._normalizedAlias.length);
    });
    return prepared;
  }

  function emptyResult(country, note) {
    return {
      city_raw: "",
      city_en: "",
      city_std: "",
      matched_alias: "",
      matched_country: country,
      confidence: 0,
      need_review: true,
      note,
    };
  }

  function createParser(sourceDatabases, config) {
    const databases = prepareDatabases(sourceDatabases);
    const addressColumn = config?.input?.address_col || "original_address";
    const countryColumn = config?.input?.country_col || "country";

    function parseRow(row) {
      const address = row[addressColumn] ?? "";
      const country = String(row[countryColumn] ?? "").trim().toUpperCase();
      if (!country) return emptyResult("", "missing country");
      if (!databases[country]) return emptyResult(country, "unsupported country");

      const normalizedAddress = normalizeText(address);
      if (!normalizedAddress) return emptyResult(country, "missing address");

      const match = databases[country].find((record) =>
        normalizedAddress.includes(record._normalizedAlias),
      );
      if (!match) return emptyResult(country, "no city alias matched");

      return {
        city_raw: match.city_alias,
        city_en: match.city_en || "",
        city_std: match.city_std || "",
        matched_alias: match.city_alias,
        matched_country: country,
        confidence: 1,
        need_review: false,
        note: "local db matched",
      };
    }

    return { parseRow, databases };
  }

  global.AddressParserCore = { normalizeText, prepareDatabases, createParser };
})(window);
