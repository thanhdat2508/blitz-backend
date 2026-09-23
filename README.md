# Group Backend

Dự án backend xây dựng trên nền tảng **Express.js (v5)** kết hợp với **PostgreSQL**, **Prisma ORM (v7)**, **Redis**, **bcrypt**, **crypto**, và **Docker Compose**.

---

## 🚀 Công nghệ sử dụng

- **Express.js 5.x**: Phiên bản mới nhất của Express với cải tiến xử lý async/await tự động.
- **TypeScript**: Hỗ trợ type-safe, cấu trúc code rõ ràng và hiện đại.
- **PostgreSQL**: Cơ sở dữ liệu quan hệ mạnh mẽ, cấu hình chạy qua Docker.
- **Prisma ORM 7.x**: ORM thế hệ mới sử dụng `@prisma/adapter-pg` kết hợp `pg pool` tối ưu hiệu năng.
- **Redis (v7)**: In-memory cache & session store, cấu hình chạy qua Docker.
- **bcrypt**: Mã hóa mật khẩu bảo mật chuẩn công nghiệp.
- **node:crypto**: Tích hợp sẵn trong Node.js để sinh token bảo mật, UUID, băm SHA-256 và mã hóa đối xứng AES-256-CBC.
- **Docker & Docker Compose**: Quản lý container cho PostgreSQL và Redis chỉ với một câu lệnh.

---

## 📁 Cấu trúc thư mục

```text
group-backend/
├── docker-compose.yml       # Docker config cho PostgreSQL & Redis
├── prisma/
│   └── schema.prisma        # Prisma Schema (User model, datasource)
├── prisma7.config.ts        # Prisma 7 config file
├── src/
│   ├── config/
│   │   ├── database.ts      # Khởi tạo PrismaClient với pg Pool adapter
│   │   └── redis.ts         # Khởi tạo Redis client & kết nối
│   ├── utils/
│   │   ├── hash.ts          # Bcrypt hashing utilities
│   │   └── crypto.ts        # Node.js crypto utilities (AES, SHA-256, Tokens)
│   ├── routes/
│   │   ├── auth.routes.ts   # Demo Auth: Register, Login (bcrypt + crypto + prisma)
│   │   ├── cache.routes.ts  # Demo Redis: Set, Get, Delete cache
│   │   ├── crypto.routes.ts # Demo Crypto: AES Encrypt/Decrypt, SHA-256
│   │   └── index.ts         # Tổng hợp API routes & Health check
│   ├── app.ts               # Express application setup & middlewares
│   └── index.ts             # Server entrypoint & graceful shutdown
├── .env                     # File biến môi trường
├── .env.example             # File mẫu biến môi trường
├── package.json
└── tsconfig.json
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Khởi động PostgreSQL và Redis bằng Docker

> **Lưu ý**: Hãy đảm bảo ứng dụng **Docker Desktop** trên máy Mac của bạn đã được mở trước khi chạy lệnh.

Chạy lệnh sau để khởi động PostgreSQL (port 5432) và Redis (port 6379) dưới nền:

```bash
npm run docker:up
```

Kiểm tra trạng thái container:
```bash
docker compose ps
```

Xem log container:
```bash
npm run docker:logs
```

Dừng các container khi không sử dụng:
```bash
npm run docker:down
```

---

### 2. Chạy Migration Database (Prisma)

Sau khi Docker PostgreSQL đã sẵn sàng, chạy migration để tạo các bảng trong database:

```bash
npm run prisma:migrate
```

Nếu muốn mở giao diện trực quan Prisma Studio để xem dữ liệu:
```bash
npm run prisma:studio
```

---

### 3. Khởi chạy Server Express

Chế độ phát triển (Development với hot-reload):
```bash
npm run dev
```

Build production và khởi chạy:
```bash
npm run build
npm start
```

Server sẽ lắng nghe tại: `http://localhost:3000`

---

## 📡 Danh sách API Endpoints Demo

| Phương thức | Endpoint | Mô tả | Công nghệ áp dụng |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái server | Express |
| `POST` | `/api/auth/register` | Đăng ký người dùng mới | Prisma + bcrypt |
| `POST` | `/api/auth/login` | Đăng nhập & sinh session token | Prisma + bcrypt + crypto |
| `GET` | `/api/auth/users` | Lấy danh sách người dùng | Prisma ORM |
| `POST` | `/api/cache/set` | Lưu cache (hỗ trợ TTL) | Redis |
| `GET` | `/api/cache/get/:key` | Lấy giá trị cache theo key | Redis |
| `DELETE` | `/api/cache/delete/:key` | Xóa key trong cache | Redis |
| `GET` | `/api/crypto/generate` | Sinh token ngẫu nhiên & UUID | node:crypto |
| `POST` | `/api/crypto/hash` | Băm chuỗi bằng SHA-256 | node:crypto |
| `POST` | `/api/crypto/encrypt` | Mã hóa AES-256-CBC | node:crypto |
| `POST` | `/api/crypto/decrypt` | Giải mã AES-256-CBC | node:crypto |

---

## 📝 Ví dụ cURL thử nghiệm

### Kiểm tra sức khỏe hệ thống:
```bash
curl http://localhost:3000/api/health
```

### Đăng ký tài khoản:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secretpassword","name":"Developer"}'
```

### Đăng nhập tài khoản:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secretpassword"}'
```

### Thử nghiệm Cache Redis:
```bash
# Lưu cache có thời hạn 60 giây
curl -X POST http://localhost:3000/api/cache/set \
  -H "Content-Type: application/json" \
  -d '{"key":"demo_key","value":{"hello":"world"},"ttlInSeconds":60}'

# Lấy dữ liệu cache
curl http://localhost:3000/api/cache/get/demo_key
```

### Thử nghiệm Mã hóa Crypto (AES-256):
```bash
curl -X POST http://localhost:3000/api/crypto/encrypt \
  -H "Content-Type: application/json" \
  -d '{"text":"Du lieu can bao mat","secretKey":"my-super-secret-key"}'
```
