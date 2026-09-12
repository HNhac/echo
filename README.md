# ECHO — shop quần áo bé gái

Monorepo 3 app: cửa hàng (`apps/web`), CMS (`apps/cms`), API (`apps/api`).

| App | Local | Production |
|---|---|---|
| Cửa hàng | http://localhost:3000 | https://echothuvui.vn |
| CMS | http://localhost:3001 | https://cms.echothuvui.vn |
| API | http://localhost:4000 | https://api.echothuvui.vn |

VPS: `167.104.101.253`

## Local

```bash
cp .env.example .env
npm install
npm run dev
```

Đơn hàng, user và ảnh upload lưu tại `apps/api/data/` (không commit).

CMS mặc định: `admin` / `echo-admin` — **đổi `ADMIN_KEY` trên VPS**.

## Deploy

DNS — 4 bản ghi **A** về `167.104.101.253`:

- `echothuvui.vn`
- `www.echothuvui.vn`
- `cms.echothuvui.vn`
- `api.echothuvui.vn`

Trên VPS:

```bash
cp .env.example .env
nano .env          # đổi ADMIN_KEY
npm install
npm run build
```

Chạy production — chọn **một** cách:

```bash
# PM2
npm i -g pm2
pm2 start deploy/ecosystem.config.cjs
pm2 save && pm2 startup
```

```bash
# Docker
docker compose up -d --build
```

```bash
# npm
npm run start
```

Nginx + HTTPS:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/echo
sudo ln -sf /etc/nginx/sites-available/echo /etc/nginx/sites-enabled/echo
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d echothuvui.vn -d www.echothuvui.vn -d cms.echothuvui.vn -d api.echothuvui.vn
```

Cổng 3000 / 3001 / 4000 chỉ listen `127.0.0.1` (nginx trên cùng máy mới vào được). Ngoài internet chỉ domain:80/443.

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 3000/tcp
sudo ufw deny 3001/tcp
sudo ufw deny 4000/tcp
sudo ufw enable
```

Sau khi đổi `NEXT_PUBLIC_API_URL` phải `npm run build` lại.

## Ghi chú

- Thanh toán: COD hoặc chuyển khoản (chưa gắn cổng thẻ).
- Client đọc sản phẩm từ API; CMS upload ảnh vào `/uploads`. API nén WebP (tối đa 1600px + bản 720px), không giữ file gốc. Không dùng catalog seed hay ảnh Unsplash.
