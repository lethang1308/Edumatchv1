# React Base Template

> Modern, lightweight, and scalable starter template for production-grade React web applications built with **React 19**, **Vite 8**, **Tailwind CSS**, and **React Router DOM**.

---

## Tech Stack

- **Core**: React 19, Vite 8, JavaScript (ESNext)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), clsx, tailwind-merge
- **Routing**: React Router DOM v7 (`useRoutes`, Layout Nesting, ProtectedRoute)
- **HTTP Client**: Axios (Pre-configured Instance with Request & Response Interceptors)
- **Feedback & Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Code Quality & Formatting**: ESLint, Prettier

---

## Requirements

- **Node.js**: `>= 18.0.0` (Khuyến nghị Node.js v20+)
- **Package Manager**: npm, yarn, hoặc pnpm

---

## Installation

Clone hoặc sao chép thư mục base vào dự án mới của bạn:

```bash
# 1. Cài đặt các dependencies
npm install

# 2. Tạo file môi trường từ file mẫu
cp .env.example .env
```

---

## Development

Khởi chạy máy chủ phát triển cục bộ (Vite Dev Server):

```bash
npm run dev
```

Mở trình duyệt tại: `http://localhost:5173`

---

## Build

Đóng gói ứng dụng cho môi trường Production:

```bash
npm run build
```

Kiểm tra bản build cục bộ:

```bash
npm run preview
```

Kiểm tra linter và định dạng mã nguồn:

```bash
# Kiểm tra linter
npm run lint

# Định dạng toàn bộ source code với Prettier
npm run format
```

---

## Project Structure

Cấu trúc thư mục được tổ chức theo nguyên tắc phân tách trách nhiệm (**Separation of Concerns** & **Clean Architecture**):

```text
src/
│
├── assets/                  # Tài nguyên tĩnh
│   ├── images/              # Hình ảnh
│   ├── icons/               # SVG / Icon tĩnh
│   └── styles/              # CSS tùy biến bổ sung nếu có
│
├── components/              # UI Components tái sử dụng
│   ├── common/              # Button, Card, Badge, Divider, Container
│   ├── form/                # Input, Textarea, Select, Checkbox, FormError
│   ├── feedback/            # Loading, Spinner, Modal, ConfirmDialog, EmptyState, ErrorState
│   ├── navigation/          # Header, Footer, Sidebar, Breadcrumb, Pagination
│   └── index.js             # Barrel export tập trung
│
├── layouts/                 # Bộ khung Layout chính
│   ├── MainLayout/          # Layout chung (Header + Content Outlet + Footer)
│   ├── AuthLayout/          # Layout xác thực (Login, Register, Forgot Password)
│   └── index.js
│
├── pages/                   # Màn hình theo từng route
│   ├── Home/                # Trang chủ Home
│   ├── Login/               # Trang đăng nhập Login (kèm demo form)
│   ├── Dashboard/           # Bảng điều khiển quản trị (Sidebar, StatsCard, Activity)
│   ├── NotFound/            # Trang lỗi 404
│   └── Forbidden/           # Trang truy cập bị từ chối 403
│
├── routes/                  # Quản lý định tuyến tập trung
│   ├── index.jsx            # Gộp và khởi tạo route với useRoutes()
│   ├── publicRoutes.jsx     # Danh sách route công khai
│   ├── privateRoutes.jsx    # Danh sách route bảo vệ (Private)
│   └── ProtectedRoute.jsx   # Route guard kiểm tra authentication
│
├── services/                # Tầng giao tiếp dữ liệu & API
│   ├── api.js               # Axios instance cấu hình sẵn interceptors
│   ├── authService.js       # Authentication service (skeleton)
│   └── exampleService.js    # CRUD service mẫu tham khảo
│
├── hooks/                   # Custom React Hooks
│   ├── useAuth.js           # Truy xuất Auth Context
│   ├── useDebounce.js       # Trì hoãn input cho tìm kiếm
│   ├── useLocalStorage.js   # Đồng bộ state với LocalStorage
│   ├── useClickOutside.js   # Bắt sự kiện click ra ngoài component
│   └── index.js
│
├── utils/                   # Hàm tiện ích dùng chung
│   ├── cn.js                # Kết hợp clsx và tailwind-merge
│   ├── storage.js           # LocalStorage wrapper an toàn (try/catch)
│   ├── formatDate.js        # Định dạng ngày tháng
│   └── formatCurrency.js    # Định dạng tiền tệ
│
├── constants/               # Hằng số toàn cục
│   ├── routes.js            # Danh sách URL paths (ROUTES)
│   ├── storageKeys.js       # Key định danh LocalStorage
│   └── common.js            # Hằng số chung hệ thống
│
├── contexts/                # React Contexts toàn cục
│   ├── AuthContext.js       # Định nghĩa context xác thực
│   ├── AuthProvider.jsx     # Provider quản lý auth token & user
│   └── index.js
│
├── store/                   # Placeholder cho Global Store (Redux Toolkit / Zustand)
│   └── index.js
│
├── config/                  # Cấu hình ứng dụng
│   └── app.js               # Đọc biến môi trường tập trung (APP_CONFIG)
│
├── App.jsx                  # Root component (BrowserRouter, AuthProvider, Toaster)
├── main.jsx                 # Bootstrap React vào DOM
└── index.css                # CSS Reset & nạp Tailwind directives
```

---

## Environment Variables

Tất cả các biến môi trường phía client bắt buộc phải có tiền tố `VITE_`. File mẫu cấu hình `.env.example`:

```env
VITE_APP_NAME="React Base"
VITE_API_BASE_URL="http://localhost:8000/api"
```

Truy xuất an toàn trong mã nguồn qua file `src/config/app.js`:

```javascript
import { APP_CONFIG } from '@/config/app';

console.log(APP_CONFIG.name);
console.log(APP_CONFIG.apiBaseUrl);
```

---

## Components

Tất cả component đều tuân thủ nguyên tắc **Reusable, Accessible và Clean Code**.

Theme EduMatch dùng chung nằm ở [`src/styles/theme.css`](src/styles/theme.css),
lấy Home làm chuẩn font, cỡ chữ và màu. Hướng dẫn tạo màn mới bằng các class
Tailwind, biến CSS và hằng số JavaScript nằm ở
[`src/styles/README.md`](src/styles/README.md).

### 1. Button (`@/components/common/Button`)

```jsx
import { Button } from '@/components/common/Button';

<Button>Lưu thông tin</Button>
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Xóa</Button>
<Button variant="outline">Outline</Button>
<Button loading>Đang lưu...</Button>
<Button disabled>Vô hiệu hóa</Button>
```

### 2. Form Inputs (`@/components/form`)

```jsx
import { Input, Textarea, Select, Checkbox, FormError } from '@/components/form';

<Input
  label="Email"
  name="email"
  placeholder="admin@example.com"
  error="Email không hợp lệ"
  required
/>

<Select
  label="Vai trò"
  name="role"
  options={[
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ]}
/>

<Checkbox label="Ghi nhớ đăng nhập" name="remember" />
<FormError message="Có lỗi xảy ra trong quá trình xử lý" />
```

### 3. Feedback (`@/components/feedback`)

```jsx
import { Modal, ConfirmDialog, Loading, Spinner, EmptyState, ErrorState } from '@/components/feedback';

// Reusable Modal
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Tạo mới"
  footer={<Button onClick={() => setIsOpen(false)}>Đóng</Button>}
>
  Nội dung modal...
</Modal>

// Confirm Dialog
<ConfirmDialog
  open={isConfirmOpen}
  title="Xác nhận xóa"
  message="Bạn có chắc chắn muốn xóa bản ghi này?"
  onConfirm={handleDelete}
  onCancel={() => setIsConfirmOpen(false)}
/>

// Loading
<Loading />
<Loading fullScreen text="Đang tải dữ liệu..." />

// Empty & Error States
<EmptyState title="Không có dữ liệu" description="Chưa có mục nào được tạo." />
<ErrorState title="Lỗi tải dữ liệu" onRetry={refetch} />
```

### 4. Navigation (`@/components/navigation`)

```jsx
import { Breadcrumb, Pagination, Header, Footer, Sidebar } from '@/components/navigation';

<Breadcrumb items={[{ label: 'Bảng điều khiển', path: '/dashboard' }, { label: 'Chi tiết' }]} />

<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={(newPage) => setPage(newPage)}
/>
```

### 5. Toast Notifications

Sử dụng trực tiếp `react-hot-toast` ở bất kỳ component hay hook nào:

```javascript
import toast from 'react-hot-toast';

toast.success('Thao tác thành công!');
toast.error('Có lỗi xảy ra, vui lòng thử lại.');
```

---

## Routing

Routing được chia tách theo mảng cấu hình rõ ràng trong thư mục `src/routes/`:

- `publicRoutes.jsx`: Chứa các trang công khai (Home, Login, 403, 404).
- `privateRoutes.jsx`: Chứa các trang bảo vệ được bọc bởi `<ProtectedRoute>`.
- `index.jsx`: Sử dụng `useRoutes` gom cụm danh sách route.

Các đường dẫn URL được quản lý tập trung tại `src/constants/routes.js`:

```javascript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FORBIDDEN: '/403',
  NOT_FOUND: '*',
};
```

---

## API Integration

### Axios Instance (`src/services/api.js`)

Axios instance được khởi tạo với baseURL từ biến môi trường:

- **Request Interceptor**: Tự động kiểm tra `localStorage` và đính kèm `Authorization: Bearer <token>` nếu tồn tại.
- **Response Interceptor**: Trả về trực tiếp `response.data`, bắt lỗi `401` (xóa token), `403` (cấm truy cập), `500` (lỗi server) mà không gây loop redirect.

### CRUD Service Pattern (`src/services/exampleService.js`)

```javascript
import api from './api';

export const exampleService = {
  getAll(params) {
    return api.get('/examples', { params });
  },

  getById(id) {
    return api.get(`/examples/${id}`);
  },

  create(data) {
    return api.post('/examples', data);
  },

  update(id, data) {
    return api.put(`/examples/${id}`, data);
  },

  remove(id) {
    return api.delete(`/examples/${id}`);
  },
};

export default exampleService;
```

---

## Coding Conventions

1. **Path Alias**: Luôn sử dụng alias `@/` thay vì đường dẫn tương đối sâu (`../../../`):
   ```javascript
   import { Button } from '@/components/common/Button';
   import api from '@/services/api';
   import { ROUTES } from '@/constants/routes';
   ```
2. **Quy tắc đặt tên**:
   - Component: `PascalCase` (ví dụ: `StatsCard.jsx`, `MainLayout.jsx`)
   - Function / Variable: `camelCase` (ví dụ: `handleSubmit`, `formatDate`)
   - Constants: `UPPER_SNAKE_CASE` (ví dụ: `STORAGE_KEYS`, `DEFAULT_PAGE_SIZE`)
3. **Thứ tự import**:
   1. React / External libraries (`react`, `react-router-dom`, `lucide-react`)
   2. Internal components (`@/components/...`, `@/layouts/...`)
   3. Hooks (`@/hooks/...`)
   4. Services (`@/services/...`)
   5. Utils / Constants / Config (`@/utils/...`, `@/constants/...`, `@/config/...`)

---

## How to create a new project from this base

Khi bạn muốn bắt đầu một dự án website mới từ base này:

1. **Sao chép thư mục template**:
   ```bash
   cp -r react-base my-new-project
   cd my-new-project
   ```
2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```
3. **Cập nhật thông tin dự án**:
   - Mở file `.env`: Thay đổi `VITE_APP_NAME` và `VITE_API_BASE_URL` trỏ tới backend thật của bạn.
   - Mở file `package.json`: Thay đổi `"name"` của dự án.
4. **Bắt đầu phát triển nghiệp vụ**:
   - Tạo page mới trong `src/pages/<TênTrang>/`
   - Khai báo path trong `src/constants/routes.js`
   - Đăng ký route trong `src/routes/publicRoutes.jsx` hoặc `src/routes/privateRoutes.jsx`
   - Tạo service tương tác API trong `src/services/<tênService>.js`
