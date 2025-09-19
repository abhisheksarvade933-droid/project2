# Organ Transplantation Management System

A comprehensive web-based platform that facilitates the entire organ donation and transplantation process by connecting patients, donors, medical professionals, and administrators in a secure, role-based environment.

## 🏥 Overview

This system streamlines organ donation workflows by providing specialized dashboards and tools for each user role:

- **Patients**: Request organs, track transplant status, and manage medical information
- **Donors**: Pledge organs, view donation history, and track impact
- **Doctors**: Review patient requests, approve transplants, and find donor-patient matches
- **Administrators**: Manage users, oversee organ inventory, and approve final transplant decisions

## ✨ Features

### Authentication & Security
- JWT-based authentication with secure password hashing
- Role-based access control with protected routes
- Session management with token expiration

### Patient Features
- Submit organ transplant requests with medical details
- Track request status and priority levels
- View medical information and treatment history
- Monitor waiting times and compatibility scores

### Donor Features
- Pledge organs for living or posthumous donation
- Track donation impact and lives saved
- Manage medical eligibility information
- View donation history and availability status

### Doctor Features
- Review and approve/reject patient requests
- Find potential donor-patient matches
- Manage medical records and documentation
- Recommend transplant matches based on compatibility

### Administrator Features
- User management with role assignments
- System analytics and statistics dashboard
- Organ inventory tracking and management
- Final approval authority for transplant procedures

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and context
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Performant form handling with validation
- **Wouter** - Lightweight client-side routing
- **Zod** - Schema validation for forms and APIs

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and verification

### Database
- **PostgreSQL** - Relational database with ACID compliance
- **Drizzle ORM** - Type-safe database operations
- **Neon** - Serverless PostgreSQL hosting

### Development Tools
- **Vite** - Fast build tool and development server
- **ESBuild** - JavaScript bundling for production
- **PostCSS** - CSS processing and optimization

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (or Neon serverless)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd organ-transplantation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Push database schema
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 🚀 Usage

### Getting Started

1. **Registration**: Visit `/register` to create an account
2. **Role Selection**: Choose your role during registration (patient, donor, doctor, admin)
3. **Login**: Access your role-specific dashboard after authentication
4. **Dashboard**: Each role has a customized interface with relevant tools and information

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

#### Organ Requests (Patients)
- `POST /api/organ-requests` - Create new organ request
- `GET /api/organ-requests` - Get user's requests or all requests (role-dependent)
- `PATCH /api/organ-requests/:id/status` - Update request status (doctors/admins)

#### Organ Pledges (Donors)
- `POST /api/organ-pledges` - Create organ pledge
- `GET /api/organ-pledges` - Get donor's pledges or available pledges

#### Organ Matches (Doctors)
- `POST /api/organ-matches` - Create potential match
- `GET /api/organ-matches` - Get potential matches
- `PATCH /api/organ-matches/:id/status` - Update match status (admins)

#### Medical Records (Doctors)
- `POST /api/medical-records` - Create medical record
- `GET /api/medical-records/:userId` - Get user's medical records

#### Administration
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management
- `PATCH /api/admin/users/:id/status` - Update user status

## 🗃️ Database Schema

### Core Tables
- **users** - User accounts with role-based information
- **organ_requests** - Patient requests for organ transplants
- **organ_pledges** - Donor commitments to donate organs
- **organ_matches** - Potential matches between requests and pledges
- **medical_records** - Medical documentation and history

### Key Enums
- **User Roles**: patient, donor, doctor, admin
- **Organ Types**: heart, kidney, liver, lung, pancreas, cornea
- **Blood Types**: A+, A-, B+, B-, AB+, AB-, O+, O-
- **Request Status**: pending, approved, rejected, matched, completed
- **Priority Levels**: low, medium, high, critical

## 🔐 Security Features

- Password hashing with bcrypt and salt rounds
- JWT token authentication with expiration
- Role-based route protection on frontend and backend
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- CORS protection for API endpoints

## 🎨 UI/UX Features

- Responsive design optimized for desktop and mobile
- Medical-themed color scheme with accessibility considerations
- Role-specific navigation and dashboard layouts
- Real-time status updates and notifications
- Loading states and error handling
- Form validation with user-friendly error messages

## 📊 Development Scripts

```bash
# Development server with hot reload
npm run dev

# Database schema management
npm run db:push        # Push schema changes to database
npm run db:push --force # Force push schema changes

# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for troubleshooting guides

## 🚀 Deployment

The application is designed to run on Replit and can be deployed to various platforms:

- **Replit**: Ready to run with automatic dependency management
- **Vercel/Netlify**: Frontend deployment with serverless functions
- **Railway/Render**: Full-stack deployment with PostgreSQL
- **Docker**: Containerized deployment (Dockerfile included)

---

**Made with ❤️ for saving lives through organ donation**