import type { Context } from "hono";

const adminKey = {
  name: "x-admin-key",
  in: "header" as const,
  required: true,
  schema: { type: "string" },
  description: "Key sau khi đăng nhập CMS",
};

function adminSecurity() {
  return [{ AdminKey: [] as string[] }];
}

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "ECHO API",
    version: "0.1.0",
    description: "Nội bộ — shop public + CMS admin. Không public Swagger ra ngoài.",
  },
  servers: [{ url: "/", description: "API hiện tại" }],
  tags: [
    { name: "Shop", description: "Public cho web" },
    { name: "CMS", description: "Cần x-admin-key" },
  ],
  components: {
    securitySchemes: {
      AdminKey: {
        type: "apiKey",
        in: "header",
        name: "x-admin-key",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Shop"],
        summary: "Ping API",
        responses: { "200": { description: "{ ok, service }" } },
      },
    },
    "/categories": {
      get: {
        tags: ["Shop"],
        summary: "Danh mục",
        responses: { "200": { description: "Danh sách category" } },
      },
      post: {
        tags: ["CMS"],
        summary: "Tạo nhóm sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "201": { description: "Category" }, "401": { description: "Unauthorized" } },
      },
    },
    "/categories/{slug}": {
      put: {
        tags: ["CMS"],
        summary: "Sửa nhóm sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey, { name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Category" }, "404": { description: "Không tìm thấy" } },
      },
      delete: {
        tags: ["CMS"],
        summary: "Xóa nhóm sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey, { name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "{ ok }" }, "409": { description: "Còn sản phẩm trong nhóm" } },
      },
    },
    "/catalog/home": {
      get: {
        tags: ["Shop"],
        summary: "Catalog trang chủ",
        responses: { "200": { description: "Sản phẩm nổi bật / mới + banner" } },
      },
    },
    "/banners": {
      get: {
        tags: ["Shop"],
        summary: "Banner slide trang chủ",
        responses: { "200": { description: "Banner đang bật; CMS (có key) xem cả banner ẩn" } },
      },
      post: {
        tags: ["CMS"],
        summary: "Thêm banner",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "201": { description: "Banner" }, "401": { description: "Unauthorized" } },
      },
    },
    "/banners/{id}": {
      put: {
        tags: ["CMS"],
        summary: "Sửa banner",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Banner" } },
      },
      delete: {
        tags: ["CMS"],
        summary: "Xóa banner",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "{ ok }" } },
      },
    },
    "/products": {
      get: {
        tags: ["Shop"],
        summary: "Danh sách sản phẩm",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "featured", in: "query", schema: { type: "string", example: "1" } },
          { name: "exclude", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Mảng product" } },
      },
      post: {
        tags: ["CMS"],
        summary: "Tạo sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "201": { description: "Product" }, "401": { description: "Unauthorized" } },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Shop"],
        summary: "Chi tiết sản phẩm (slug hoặc id)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product" }, "404": { description: "Không tìm thấy" } },
      },
      put: {
        tags: ["CMS"],
        summary: "Sửa sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Product" } },
      },
      delete: {
        tags: ["CMS"],
        summary: "Xóa sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "{ ok }" } },
      },
    },
    "/pages": {
      get: {
        tags: ["Shop"],
        summary: "SEO tất cả trang",
        responses: { "200": { description: "Mảng SeoPage" } },
      },
    },
    "/pages/{id}": {
      get: {
        tags: ["Shop"],
        summary: "SEO một trang",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "SeoPage" } },
      },
      put: {
        tags: ["CMS"],
        summary: "Sửa SEO trang",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "SeoPage" } },
      },
    },
    "/uploads/{name}": {
      get: {
        tags: ["Shop"],
        summary: "Ảnh upload",
        parameters: [{ name: "name", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "File ảnh" }, "404": { description: "Không tìm thấy" } },
      },
    },
    "/orders": {
      get: {
        tags: ["CMS"],
        summary: "Danh sách đơn",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "200": { description: "Mảng Order" } },
      },
      post: {
        tags: ["Shop"],
        summary: "Tạo đơn hàng",
        responses: { "201": { description: "Order" }, "400": { description: "Thiếu thông tin / giỏ trống" } },
      },
    },
    "/orders/{id}": {
      patch: {
        tags: ["CMS"],
        summary: "Đổi trạng thái đơn",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Order" } },
      },
    },
    "/admin/login": {
      post: {
        tags: ["CMS"],
        summary: "Đăng nhập CMS",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "{ ok, key, user }" }, "401": { description: "Sai tài khoản" } },
      },
    },
    "/admin/me": {
      get: {
        tags: ["CMS"],
        summary: "Phiên hiện tại",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "200": { description: "StaffPublic" } },
      },
    },
    "/admin/host-stats": {
      get: {
        tags: ["CMS"],
        summary: "RAM, disk, IP, Docker, lượt truy cập và IP khách xem trang",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "200": { description: "HostStats" }, "403": { description: "Không phải chủ studio" } },
      },
    },
    "/admin/users": {
      get: {
        tags: ["CMS"],
        summary: "Danh sách tài khoản",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "200": { description: "Mảng StaffPublic" } },
      },
      post: {
        tags: ["CMS"],
        summary: "Tạo tài khoản",
        security: adminSecurity(),
        parameters: [adminKey],
        responses: { "201": { description: "StaffPublic" } },
      },
    },
    "/admin/users/{id}": {
      patch: {
        tags: ["CMS"],
        summary: "Sửa tài khoản",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "StaffPublic" } },
      },
      delete: {
        tags: ["CMS"],
        summary: "Xóa tài khoản",
        security: adminSecurity(),
        parameters: [adminKey, { name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "{ ok }" } },
      },
    },
    "/admin/uploads": {
      post: {
        tags: ["CMS"],
        summary: "Upload ảnh sản phẩm",
        security: adminSecurity(),
        parameters: [adminKey],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: { file: { type: "string", format: "binary" } },
              },
            },
          },
        },
        responses: { "201": { description: "File đã lưu" } },
      },
    },
  },
};

export function swaggerAllowed(c: Context) {
  if (c.req.header("x-forwarded-for") || c.req.header("x-forwarded-host") || c.req.header("x-real-ip")) {
    return false;
  }
  return true;
}

export function swaggerHtml() {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ECHO API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.27.1/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fffaf8; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.27.1/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/openapi.json",
      dom_id: "#swagger-ui",
      persistAuthorization: true,
    });
  </script>
</body>
</html>`;
}
