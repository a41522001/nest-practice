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