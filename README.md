# WMB Tracker Backend

A modern, secure backend API built with Hono, TypeScript, and MongoDB for user management, authentication, and role-based access control.

## 🚀 Features

- **Modern Authentication**: Cookie-based session management (no JWT)
- **Role-Based Access Control**: Admin and user roles with middleware protection
- **User Management**: Complete CRUD operations for users
- **Role Management**: Dynamic role creation and permission assignment
- **Permission System**: Granular permission management
- **Session Management**: Secure session handling with expiration
- **Password Security**: Bcrypt password hashing
- **Input Validation**: Zod schema validation
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Fast, lightweight web framework
- **Language**: TypeScript
- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Cookie-based sessions
- **Validation**: Zod
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- [Bun](https://bun.sh/) (latest version)
- MongoDB (v5 or higher)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd wmb-tracker-backend
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/wmb-tracker

# Environment
NODE_ENV=development
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the Application

```bash
# Development mode with hot reload
bun run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /logout
Cookie: session_token=your-session-token
```

#### Get Current User
```http
GET /me
Cookie: session_token=your-session-token
```

### User Management (Admin Only)

#### Get All Users
```http
GET /users
Cookie: session_token=your-admin-session-token
```

### Role Management (Admin Only)

#### Get All Roles
```http
GET /roles
Cookie: session_token=your-admin-session-token
```

#### Create Role
```http
POST /create-role
Content-Type: application/json
Cookie: session_token=your-admin-session-token

{
  "name": "Manager",
  "permissions": ["permission_id_1", "permission_id_2"]
}
```

#### Get Role by ID
```http
GET /roles/:id
Cookie: session_token=your-admin-session-token
```

#### Update Role
```http
PUT /roles/:id
Content-Type: application/json
Cookie: session_token=your-admin-session-token

{
  "name": "Updated Manager",
  "permissions": ["permission_id_1", "permission_id_3"]
}
```

#### Delete Role
```http
DELETE /roles/:id
Cookie: session_token=your-admin-session-token
```

#### Update Role Permissions
```http
POST /roles/:id/permissions
Content-Type: application/json
Cookie: session_token=your-admin-session-token

{
  "permissions": ["permission_id_1", "permission_id_2", "permission_id_3"]
}
```

#### Get Role Permissions
```http
GET /roles/:id/permissions
Cookie: session_token=your-admin-session-token
```

### Permission Management (Admin Only)

#### Get All Permissions
```http
GET /permissions
Cookie: session_token=your-admin-session-token
```

#### Create Permission
```http
POST /create-permission
Content-Type: application/json
Cookie: session_token=your-admin-session-token

{
  "name": "read_users",
  "description": "Permission to read user data"
}
```

## 🔐 Authentication & Security

### Session Management

The application uses secure cookie-based sessions instead of JWT tokens:

- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS only in production
- **SameSite=Strict**: CSRF protection
- **7-day Expiration**: Automatic session cleanup
- **Session Tracking**: User agent and IP address logging

### Password Security

- **Bcrypt Hashing**: 12 rounds of salt
- **Minimum Length**: 6 characters required
- **No Plain Text**: Passwords never stored in plain text

### Role-Based Access Control

- **Middleware Protection**: Route-level access control
- **Flexible Roles**: Support for multiple roles per endpoint
- **Permission System**: Granular permission management

## 🗂️ Project Structure

```
src/
├── controllers/          # Request handlers
│   └── authController.ts
├── db/                  # Database configuration
│   ├── connect.ts       # MongoDB connection
│   └── seed.ts          # Database seeding
├── middlewares/         # Custom middleware
│   └── auth.middleware.ts
├── models/              # Mongoose models
│   ├── user.ts          # User schema
│   ├── role.ts          # Role schema
│   ├── permission.ts    # Permission schema
│   └── session.ts       # Session schema
├── routes/              # API routes
│   ├── authRoute.ts     # Authentication routes
│   ├── roleRoutes.ts    # Role management routes
│   └── permissionRoutes.ts # Permission routes
├── services/            # Business logic
│   ├── authService.ts   # Authentication service
│   ├── roleService.ts   # Role management service
│   └── permissionService.ts # Permission service
├── validators/          # Input validation
│   └── authValidator.ts # Zod schemas
└── index.ts             # Application entry point
```

## 🧪 Testing with Postman

### 1. Create a User
```http
POST http://localhost:3000/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

### 2. Login
```http
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Important**: Save the `session_token` cookie from the response headers.

### 3. Access Protected Routes
Use the saved cookie in subsequent requests:

```http
GET http://localhost:3000/users
Cookie: session_token=your-session-token-here
```

## 🗄️ Database Schema

### User Model
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}
```

### Role Model
```typescript
{
  name: string
  permissions: ObjectId[] (ref: Permission)
  createdBy: ObjectId (ref: User)
  updatedBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

### Permission Model
```typescript
{
  name: string (unique)
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

### Session Model
```typescript
{
  userId: ObjectId (ref: User)
  sessionToken: string (unique)
  expiresAt: Date
  userAgent?: string
  ipAddress?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db-url
```

### Docker Deployment (Optional)

```dockerfile
FROM oven/bun:1-alpine
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/wmb-tracker-backend/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🔄 Changelog

### v1.0.0
- Initial release
- User authentication with cookie-based sessions
- Role-based access control
- User, Role, and Permission management
- Complete API documentation

---

**Made with ❤️ using Bun, Hono, TypeScript, and MongoDB**

## MongoDB Management

### Start MongoDB:
```bash
mongod --config /opt/homebrew/etc/mongod.conf
```

### Stop MongoDB:
```bash
pkill -f mongod
```

### Check MongoDB Status:
```bash
mongosh --eval "db.runCommand('ping')"
```


