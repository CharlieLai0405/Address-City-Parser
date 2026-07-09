window.APP_CONFIG = {
  input: {
    address_col: "original_address",
    country_col: "country",
  },
  output: {
    result_excel: "address_with_city.xlsx",
    unmatched_excel: "unmatched_address.xlsx",
  },
  database: {
    TW: {
      source_excel: "database/TW_city_database.xlsx",
      runtime_data: "database/TW_city_database.js",
    },
    CN: {
      source_excel: "database/CN_city_database.xlsx",
      runtime_data: "database/CN_city_database.js",
    },
  },
  runtime: {
    mode: "browser_only",
    requires_server: false,
    requires_python: false,
    network_access: false,
  },
};
