# NestJS 練習專案 (nest-practice)

這是一個使用 NestJS 框架開發的後端練習專案，整合了 Prisma ORM、PostgreSQL 以及 Redis 緩存機制。

## 🛠️ 開發環境初始化

在開始開發之前，請確保你已安裝 [Node.js](https://nodejs.org/)，並按照以下步驟設定環境：

### 1. 環境變數設定

請參考專案中的 .env.example 檔案，建立並設定你的 .env 檔案：

```bash
cp .env.example .env
```

---

### 2. 安裝專案依賴

執行以下指令安裝必要的封裝套件：

```bash
npm install
```

---

### 3. 啟動基礎設施 (PostgreSQL & Redis)

本專案依賴 PostgreSQL 存儲數據與 Redis 處理 Token/緩存。請確保這些服務已啟動：

```bash
# 如果你有編寫 docker-compose.yml，請執行：
docker compose up -d

# 或者確保你的本地服務已開啟
```

---

### 4. 生成Prisma文件

執行以下指令生成資料庫存取層的類型定義檔案：

```bash
npx prisma generate
```

---

### 5. 同步資料庫結構

將 prisma/schema.prisma 定義的結構同步到你的 PostgreSQL 資料庫中：

```bash
npx prisma db push
```

---

## 執行專案

請根據你的需求選擇執行模式：

```bash
# 開發模式 (帶有 watch 模式)
npm run start:dev

# 生產模式啟動
npm run start:prod
```

---
