# 🚀 WeCare CRM - Sales Dashboard

> Hệ thống quản lý Leads từ Marketing với xác thực Microsoft OAuth 2.0

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ Features

- 🔐 **JWT Authentication** - Microsoft OAuth 2.0 Implicit Flow
- 👥 **Lead Management** - Quản lý khách hàng từ Marketing
- 📊 **Real-time Dashboard** - Theo dõi trạng thái Leads
- 🎨 **Modern UI/UX** - Responsive design với Dark mode
- 🔒 **Protected Routes** - Bảo vệ app với AuthGuard
- 🌐 **Dynamics CRM Integration** - Kết nối trực tiếp với Dynamics 365

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- NPM hoặc Yarn
- Microsoft account (cho OAuth)

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Web-App-We-Care
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🔐 Authentication

### Microsoft OAuth Login
Hệ thống sử dụng **OAuth 2.0 Implicit Flow** để xác thực người dùng:

1. User click "Đăng nhập với Microsoft"
2. Popup mở trang Microsoft Login
3. User nhập credentials
4. Microsoft redirect với access token
5. Token được lưu vào localStorage
6. App hiển thị thông tin user từ JWT

### Manual Token (Development)
Cho development/testing, bạn có thể paste token thủ công:

```typescript
import { saveTokenManually } from './implicitAuthService';

const token = 'eyJ0eXAiOiJKV1Qi...'; // Your JWT token
saveTokenManually(token);
```

📖 **Chi tiết**: Xem [AUTH_GUIDE.md](AUTH_GUIDE.md)

## 📁 Project Structure

```
Web-App-We-Care/
├── components/
│   ├── Login.tsx           # 🔐 Login screen
│   ├── AuthGuard.tsx       # 🛡️ Protected route wrapper
│   ├── Header.tsx          # 📋 Header with user menu
│   ├── LeadTable.tsx       # 📊 Leads data table
│   └── CustomerSidebar.tsx # 📝 Customer details
├── implicitAuthService.ts  # 🔑 OAuth & JWT service
├── authDemo.ts            # 🧪 Testing utilities
├── App.tsx                # 🏠 Main app
├── types.ts               # 📐 TypeScript types
├── constants.ts           # 🔧 Constants
└── oauth-callback.html    # 🔄 OAuth callback page
```

## 🎨 UI Components

### Login Screen
- Gradient background với branding
- Microsoft OAuth button
- Manual token input (dev mode)
- Error handling & loading states
- Dark mode support

### Dashboard
- Header với search & notifications
- Leads table với filters
- Customer sidebar details
- Responsive layout

### User Menu
- User avatar & info
- Dropdown menu
- Logout với confirmation

## 🔒 Security

- ✅ OAuth 2.0 với Microsoft Azure AD
- ✅ JWT token validation
- ✅ Auto token expiry check (buffer 5 phút)
- ✅ Origin verification cho popup
- ✅ No credentials in code
- ✅ HTTPS only (production)

## 🧪 Testing

### Console Utilities
```javascript
// Trong browser console (dev mode)
AuthDemo.getAuthStatus()    // Xem trạng thái auth
AuthDemo.inspectToken()     // Phân tích JWT
AuthDemo.createMockAuth()   // Tạo mock user
AuthDemo.clearAuth()        // Xóa auth data
```

### Manual Testing Checklist
- [ ] Login với Microsoft account
- [ ] Login với manual token  
- [ ] Logout functionality
- [ ] Token expiry & auto-refresh
- [ ] User info display
- [ ] Dark mode toggle
- [ ] Mobile responsive
- [ ] Error states

## 📚 Documentation

- [AUTH_GUIDE.md](AUTH_GUIDE.md) - Hướng dẫn authentication chi tiết
- [AUTH_SUMMARY.md](AUTH_SUMMARY.md) - Tổng kết features & usage
- [implicitAuthService.ts](implicitAuthService.ts) - JWT service documentation

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS
- **Icons**: Material Symbols
- **Auth**: OAuth 2.0 Implicit Flow
- **Backend**: Microsoft Dynamics 365 CRM

## 🌐 Environment

Cập nhật CLIENT_ID trong [implicitAuthService.ts](implicitAuthService.ts):

```typescript
const CLIENT_ID = window.location.origin === 'YOUR_PRODUCTION_URL'
  ? 'PRODUCTION_CLIENT_ID'
  : 'DEVELOPMENT_CLIENT_ID';
```

## 📝 License

© 2026 WeCare CRM. All rights reserved.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- 📧 Email: support@wecare.com
- 📖 Docs: [AUTH_GUIDE.md](AUTH_GUIDE.md)
- 🐛 Issues: GitHub Issues

---

**Built with ❤️ by WeCare Team**
