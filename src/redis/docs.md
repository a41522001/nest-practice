# Redis 結構定義

## 1. Refresh Token 詳細資訊 (Hash)
**Key:** `auth:refreshToken#{refreshToken}`

| 欄位 (Field) | 類型 | 說明 |
| :--- | :--- | :--- |
| `userId` | string | 使用者唯一識別碼 |
| `expire` | string | 到期時間 (ISOString) |
| `sub` | string | 訂閱主體 (Subject) |
| `name` | string | 使用者名稱 (Username) |
| `isOld` | number | 舊 Token 標記 (0 = 否, 1 = 是) |

---

## 2. 使用者 Token 索引 (ZSet)
**Key:** `auth:user#{userId}:refreshToken`

* **Member**: `refreshToken` (對應上述 Hash 的 Token 字串)
* **Score**: `Expire Timestamp` (到期時間，單位：毫秒)
* **用途**: 管理單一使用者名下的所有 Token，依到期時間排序，便於批量清理。

---

## 3. 使用者基本資訊快取 (Hash)
**Key:** `user:sub#{sub}`

| 欄位 (Field) | 類型 | 說明 |
| :--- | :--- | :--- |
| `userId` | string | 使用者唯一識別碼 |
| `email` | string | 使用者電子郵件 |
| `name` | string | 使用者名稱 (Username) |

* **資料結構**：Hash  
* **用途**：  
  - 以 `sub`（JWT Subject）作為索引，快速取得使用者基本身分資訊  
  - 避免每次驗證 Token 時都需要查詢主要使用者資料表  
  - 適合在驗證流程（Access Token / Refresh Token）中快速反查使用者
* **生命週期管理**: 
  - **同步過期**：建議生存時間 (TTL) 與 Refresh Token 的過期時間一致。
  - **主動更新**：當使用者修改個人資料（如變更姓名）時，應主動更新或刪除此快取以維持資料一致性。
