# Address City Parser

## 1. 專案用途

這是一個完全在瀏覽器本機執行的地址城市解析工具。

使用者上傳 `.xlsx` 地址檔後，工具會：

1. 讀取 `original_address` 與 `country`。
2. 依 `country` 選擇 TW 或 CN 城市資料庫。
3. 從地址中比對 `city_alias`。
4. 輸出標準英文城市名稱 `city_en`。
5. 產生完整結果與未命中結果兩份 Excel。

本版本不需要：

- 安裝 Python。
- 執行 `pip install`。
- 啟動 localhost server。
- 系統管理員權限。
- 網路連線。

所有地址資料只存在瀏覽器記憶體中，不會上傳。

---

## 2. 最快使用方式

1. 保持整個 `browser_only` 資料夾結構不變。
2. 使用 Microsoft Edge 或 Google Chrome 雙擊開啟 `index.html`。
3. 選擇包含必要欄位的 `.xlsx`。
4. 按下 **Start Parsing**。
5. 檢查統計與前 20 筆預覽。
6. 下載：
   - `address_with_city.xlsx`
   - `unmatched_address.xlsx`

第一次驗證建議使用：

```text
input/city_parser_test_100.xlsx
```

該測試檔包含：

- 繁體中文：34 筆
- 簡體中文：33 筆
- 英文：33 筆
- 總計：100 筆

每筆另有 `expected_city_en`，可用來核對解析結果。

---

## 3. 資料夾結構

```text
Address-City-Parser/
├─ index.html
├─ style.css
├─ app.js
├─ parser_core.js
├─ config.js
├─ config.json
├─ database_converter.html
├─ database_converter_core.js
├─ database_converter.js
├─ README.md
│
├─ input/
│  └─ city_parser_test_100.xlsx
│
├─ database/
│  ├─ TW_city_database.xlsx
│  ├─ TW_city_database.js
│  ├─ CN_city_database.xlsx
│  └─ CN_city_database.js
│
└─ vendor/
   ├─ xlsx.full.min.js
   └─ SHEETJS_LICENSE.txt
```

---

## 4. 每個檔案的用途

### `index.html`

主操作頁面。

負責定義上傳區、統計卡、預覽表格與下載按鈕，並依序載入其他 JavaScript：

1. `config.js`
2. `vendor/xlsx.full.min.js`
3. TW/CN runtime database
4. `parser_core.js`
5. `app.js`

請勿任意改變載入順序。

### `style.css`

主頁與 database converter 共用的畫面樣式。

它不處理資料，只控制顏色、版面、表格與響應式顯示。

### `app.js`

主頁流程控制：

- 接收使用者上傳的 Excel。
- 檢查必要欄位。
- 呼叫 `parser_core.js` 解析每筆地址。
- 計算 matched、unmatched、need review。
- 顯示前 20 筆。
- 建立並下載兩份結果 Excel。

### `parser_core.js`

城市判斷核心。

主要工作：

- 正規化文字。
- country 轉大寫。
- city alias 依長度由長到短排序。
- 使用不分英文大小寫的 substring matching。
- 回傳 `city_en`、`city_std`、`matched_alias`、`confidence`、`need_review` 與 `note`。

這個檔案不負責 Excel，也不負責畫面。

### `config.json`

給人員查看、稽核與交接用的設定檔。

它記錄輸入欄位名稱、輸出檔名、database 對應與 runtime 原則。

### `config.js`

瀏覽器實際使用的 runtime 設定。

因為工具是直接透過 `file://` 雙擊開啟，瀏覽器通常不允許 JavaScript 使用 `fetch()` 自動讀取旁邊的 `config.json`。因此需要把同一份設定以可由 `<script>` 載入的 `config.js` 保存。

如果修改輸入欄位或輸出檔名，必須修改 `config.js`；建議同步更新 `config.json`，避免交接文件與實際行為不一致。

### `database_converter.html`

免安裝的 database 維護工具。

當維護者修改 TW 或 CN database Excel 後，可開啟此頁將 `.xlsx` 轉成主工具需要的 runtime `.js`。

### `database_converter.js`

database converter 的畫面與下載流程控制。

### `database_converter_core.js`

database converter 的資料轉換核心：

- 驗證統一欄位。
- 依所選 country 過濾。
- 建立 runtime rows 與 JavaScript payload。

### `input/city_parser_test_100.xlsx`

交接與回歸測試用資料。

包含 100 筆繁體、簡體、英文地址與預期城市。它不是正式 database，也不是程式必要元件；但建議保留，方便每次 database 更新後重新驗證。

### `vendor/xlsx.full.min.js`

本機 Excel 讀寫引擎。

瀏覽器原生無法直接解析或產生 `.xlsx`，因此需要這個隨專案附帶的 JavaScript 檔。

它不需要安裝，也不會在執行時連網。

### `vendor/SHEETJS_LICENSE.txt`

Excel 讀寫引擎的第三方授權文字。公司交接與稽核時應保留。

---

## 5. 為什麼 database 同時有 `.xlsx` 與 `.js`

這兩種檔案用途不同。

### `TW_city_database.xlsx` / `CN_city_database.xlsx`

這是「人員維護與檢查的來源資料」：

- 可用 Excel 開啟。
- 容易新增 alias。
- 方便篩選、排序與稽核。
- 不會被主頁自動載入。

### `TW_city_database.js` / `CN_city_database.js`

這是「瀏覽器實際載入的 runtime 資料」：

- `index.html` 透過 `<script>` 直接載入。
- 可在 `file://` 模式使用。
- 不需要 server。
- 不需要使用者每次重新選擇 database。

### 真的有必要同時存在嗎？

在目前「雙擊 HTML、零安裝、無 server、database 自動載入」的要求下，建議兩種都保留：

- `.xlsx` 解決維護與稽核。
- `.js` 解決瀏覽器離線自動載入。

如果刪除 `.js`，主工具無法判斷城市。

如果刪除 `.xlsx`，主工具仍能執行，但後續人員很難安全維護 database。

替代方案只有：

1. 每次啟動都要求使用者另外選擇 TW/CN database Excel；或
2. 使用 localhost server。

這兩種都不符合目前的操作目標，因此此專案保留兩套格式。

---

## 6. Database 統一欄位

TW 與 CN database Excel 必須包含：

| 欄位 | 用途 |
|---|---|
| `country` | ISO 2 國家碼，例如 TW、CN |
| `province_std` | 標準省分或上級行政區 |
| `city_alias` | 地址中可能出現的寫法 |
| `city_std` | 標準中文城市名稱 |
| `city_en` | 標準英文城市名稱 |
| `code` | 行政區代碼，可空白 |
| `level` | 行政層級 |

同一城市可以有多筆 alias。例如：

```text
TW, Taiwan, 臺北市, 臺北市, Taipei, , city
TW, Taiwan, 台北市, 臺北市, Taipei, , city
TW, Taiwan, Taipei City, 臺北市, Taipei, , city
```

---

## 7. 更新 Database 的免安裝流程

1. 備份整個 `browser_only` 資料夾。
2. 用 Excel 修改：
   - `database/TW_city_database.xlsx`
   - 或 `database/CN_city_database.xlsx`
3. 雙擊 `database_converter.html`。
4. 選擇 TW 或 CN。
5. 選擇剛修改的 database Excel。
6. 按 **Generate Runtime JS**。
7. 瀏覽器會下載：
   - `TW_city_database.js`
   - 或 `CN_city_database.js`
8. 把下載的檔案複製到 `database` 資料夾，覆蓋同名舊檔。
9. 關閉並重新開啟 `index.html`。
10. 使用 `input/city_parser_test_100.xlsx` 回歸測試。

重要：

- 只修改 `.xlsx` 不會自動影響主工具。
- 必須重新產生並替換對應的 `.js`。
- 覆蓋前先備份舊 `.js`。
- 不要用 Word 或文字編輯器修改 `.xlsx`。

---

## 8. 輸入 Excel

必要欄位：

| 欄位 | 說明 |
|---|---|
| `original_address` | 原始地址 |
| `country` | TW 或 CN |

可以包含其他欄位，輸出時會保留。

目前只接受 `.xlsx`。

---

## 9. 輸出欄位

完整結果會保留原始欄位，並新增：

| 欄位 | 說明 |
|---|---|
| `city_raw` | 命中的 alias |
| `city_en` | 標準英文城市 |
| `city_std` | 標準中文城市 |
| `matched_alias` | database 實際命中的 alias |
| `matched_country` | 使用的國家 database |
| `confidence` | local database 命中為 1 |
| `need_review` | 是否需人工確認 |
| `note` | 判斷結果說明 |

未命中資料會出現在 `unmatched_address.xlsx`。

常見 note：

- `local db matched`
- `no city alias matched`
- `missing country`
- `missing address`
- `unsupported country`

---

## 10. 比對規則

1. `country` 去除前後空白並轉大寫。
2. 地址與 alias：
   - 全形空白轉一般空白。
   - 多個空白壓成一個。
   - 英文轉小寫。
   - 中文不做自動繁簡轉換。
3. alias 依長度由長到短。
4. 使用 substring matching。

例如同時有：

```text
台北
台北市
```

地址為 `台北市信義區` 時，會優先命中較長的 `台北市`。

---

## 11. 驗證方式

### 基本驗證

1. 開啟 `index.html`。
2. 上傳 `input/city_parser_test_100.xlsx`。
3. 預期：
   - Total rows：100
   - Matched：100
   - Unmatched：0
   - Need review：0
4. 下載完整結果。
5. 比較 `city_en` 與原檔的 `expected_city_en`。

### Database 更新後驗證

每次 database 更新後至少測試：

- 繁體中文地址。
- 簡體中文地址。
- 英文地址。
- TW 與 CN。
- 長 alias 優先。
- 不支援 country。
- 空白 country。

---

## 12. 安全與隱私

- 程式碼沒有 `fetch()`、`XMLHttpRequest` 或 WebSocket。
- 地址資料不會傳送到外部服務。
- 沒有 geocoding API。
- 沒有 telemetry。
- 不依賴 CDN。
- Excel 引擎與 database 都在本機資料夾。

如公司禁止執行任何第三方 JavaScript，即使不需安裝，瀏覽器仍可能阻擋 Excel 讀寫；此時只能改用公司核准的格式或工具。

---

## 13. 常見問題

### 雙擊 `index.html` 後畫面空白

確認以下檔案仍存在：

- `style.css`
- `config.js`
- `app.js`
- `parser_core.js`
- `vendor/xlsx.full.min.js`
- 兩個 database `.js`

也確認沒有任意改變資料夾層級。

### 顯示找不到 Excel 讀寫程式

`vendor/xlsx.full.min.js` 遺失、被改名或被公司安全政策封鎖。

### 修改 database Excel 後結果沒有改變

主工具讀取的是 database `.js`。請執行第 7 節的轉換流程。

### 某城市沒有命中

1. 確認 country 正確。
2. 查看原始地址中的城市寫法。
3. 在對應 database Excel 新增 `city_alias`。
4. 重新產生 database `.js`。
5. 再次測試。

### 英文大小寫不同

英文比對不分大小寫。

### 中文繁簡問題

程式不會自動完整轉換繁簡體。應在 database 中明確加入需要支援的繁中、簡中 alias。

---

## 14. 交接清單

交接前確認：

- [ ] 整個 `browser_only` 資料夾可複製到其他位置。
- [ ] 雙擊 `index.html` 可正常開啟。
- [ ] 100 筆測試為 100 matched。
- [ ] TW/CN `.xlsx` 與 `.js` 都存在。
- [ ] `config.json` 與 `config.js` 設定一致。
- [ ] Database 更新流程已示範。
- [ ] `vendor/SHEETJS_LICENSE.txt` 已保留。
- [ ] 沒有把正式地址檔留在專案資料夾。

---

## 15. 已知限制

- 僅支援 `.xlsx`。
- 第一階段只支援 TW 與 CN。
- 使用 alias substring matching，不是 NLP。
- 不會自動完整繁簡轉換。
- Database Excel 修改後必須重新產生 runtime JS。
- 大量資料會受使用者電腦與瀏覽器記憶體影響。
