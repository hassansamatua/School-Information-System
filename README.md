# School Information System

A comprehensive school management system built with Next.js 15, TypeScript, Tailwind CSS, MySQL, Prisma ORM, and NextAuth. This system provides role-based access for administrators, teachers, and parents to manage school operations efficiently.

## 🚀 Features

### Core Functionality
- **Role-Based Authentication**: Secure login system with three user types (Admin, Teacher, Parent)
- **Approval Workflow**: Teachers submit content for admin approval before publishing to parents
- **Student Management**: Complete student records with class assignments and parent linking
- **Class Management**: Organize classes, assign teachers, and track enrollment
- **Attendance Tracking**: Daily attendance recording with detailed reporting
- **Performance Monitoring**: Track student performance across subjects and assessments
- **Result Management**: Official exam results with rankings and detailed analytics
- **Announcements & Events**: School communication with targeted audience selection
- **Reports Generation**: Comprehensive reports with PDF/Excel export capabilities
- **Notifications System**: Real-time notifications for important updates
- **Audit Logging**: Complete activity tracking for security and compliance

### User Roles

#### Admin (Super User)
- ✅ Create and manage teacher accounts
- ✅ Approve/reject teacher submissions
- ✅ Manage student registrations and class assignments
- ✅ Publish official exam results
- ✅ Generate and download reports
- ✅ Manage school settings and system configuration
- ✅ View all system data and analytics

#### Teacher
- ✅ Login securely and manage profile
- ✅ Record daily attendance
- ✅ Add student performance data
- ✅ Create announcements and events (requires admin approval)
- ✅ Submit content for approval workflow
- ✅ View assigned class information
- ✅ Track student progress

#### Parent
- ✅ Register account and link to children
- ✅ View children's attendance records
- ✅ Monitor student performance and results
- ✅ Receive approved announcements and events
- ✅ Access real-time notifications
- ✅ Download child's reports

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: MySQL (via XAMPP)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Export**: jsPDF, SheetJS
- **State Management**: React Context
- **Form Validation**: Zod + React Hook Form

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- MySQL database (XAMPP recommended)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-information-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file with your configuration:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/school_information_system"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# App Settings
APP_NAME="School Information System"
APP_URL="http://localhost:3000"
```

### 4. Database Setup
1. Start XAMPP and ensure MySQL is running
2. Create a database named `school_information_system`
3. Run Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure

```
school-information-system/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── api/             # API routes
│   │   │   ├── auth/
│   │   │   ├── reports/
│   │   │   └── notifications/
│   │   ├── parent/           # Parent dashboard pages
│   │   ├── teacher/          # Teacher dashboard pages
│   │   ├── globals.css
│   │   ├── layout.ts
│   │   └── login/
│   ├── components/              # Reusable UI components
│   │   ├── ui/              # ShadCN UI components
│   │   ├── layout/           # Layout components
│   │   ├── forms/           # Form components
│   │   ├── dashboard/       # Dashboard components
│   │   └── auth/           # Auth components
│   ├── lib/                  # Utility functions
│   │   ├── auth.ts          # Authentication helpers
│   │   ├── database.ts      # Database connection
│   │   ├── utils.ts         # Utility functions
│   │   ├── constants.ts     # App constants
│   │   └── validations.ts   # Form validation schemas
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   │   └── nextauth.d.ts
│   └── middleware.ts          # NextAuth middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/           # Database migrations
├── public/                  # Static assets
├── docs/                   # Documentation
├── README.md
└── package.json
```

## 🔐 Database Schema

The system uses a comprehensive MySQL database schema with the following main entities:

- **Users**: Authentication and role management
- **Admins**: Administrator profiles
- **Teachers**: Teacher profiles and assignments
- **Parents**: Parent profiles and student linking
- **Students**: Student records and enrollment
- **Classes**: Class organization and teacher assignment
- **Attendance**: Daily attendance tracking
- **Performance**: Student performance data
- **Results**: Official exam results
- **Announcements**: School communications
- **Events**: School events and activities
- **Submissions**: Teacher submissions for approval
- **Approvals**: Admin approval workflow
- **Notifications**: System notifications
- **Reports**: Generated reports
- **Audit Logs**: Activity tracking

## 🔐 Authentication & Security

### Authentication Flow
1. **Login**: Secure login using NextAuth with credentials provider
2. **Role-Based Access**: Middleware protects routes based on user roles
3. **Session Management**: JWT tokens with secure configuration
4. **Password Security**: Bcrypt hashing for password storage

### Security Features
- Role-based middleware for route protection
- Input validation and sanitization
- SQL injection prevention via Prisma
- CSRF protection
- Rate limiting considerations
- Audit logging for all actions

## 📊 Key Features in Detail

### Approval Workflow System
The approval workflow ensures proper content control:

1. **Submission**: Teachers create content (announcements, events, attendance, performance)
2. **Review**: Admins review and approve/reject submissions
3. **Publishing**: Only approved content becomes visible to parents
4. **Tracking**: Complete audit trail of all approvals

### Attendance Management
- Daily attendance recording by teachers
- Attendance statistics and reporting
- Absence tracking with reasons
- Monthly and yearly attendance reports
- Parent access to children's attendance

### Performance Tracking
- Subject-wise performance recording
- Assessment type categorization (Quiz, Test, Assignment, Project, Exam)
- Grade calculation based on performance
- Performance trends and analytics
- Parent access to performance data

### Results Management
- Official exam result publishing
- Class and subject-wise results
- Automatic grade calculation
- Ranking system
- Result analytics and trends

## 📱 Reports Module

### Available Reports
- **Attendance Reports**: Daily, monthly, yearly attendance statistics
- **Performance Reports**: Student performance by subject and assessment
- **Results Reports**: Official exam results with rankings
- **Student Lists**: Complete student directories
- **Teacher Activity**: Teacher submission and activity reports
- **Parent Lists**: Parent registration and activity reports

### Export Options
- PDF export for printable reports
- Excel export for data analysis
- CSV export for data import
- Custom date range filtering

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/school_information_system"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-very-secure-secret-key-here"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# File Upload Configuration
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# Application Settings
APP_NAME="School Information System"
APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Database Configuration
The system uses MySQL with Prisma ORM. Update `prisma/schema.prisma` to modify the database structure.

## 🚀 Deployment

### Development Deployment
```bash
npm run build
npm start
```

### Production Deployment

#### Using Docker
```bash
# Build the application
npm run build

# Create Docker image
docker build -t school-system .

# Run with Docker Compose
docker-compose up -d
```

#### Traditional Hosting
1. Build the application: `npm run build`
2. Set up production database
3. Configure environment variables
4. Deploy to your hosting provider
5. Run database migrations

### Environment-Specific Setup
- **Development**: Use SQLite or local MySQL for easy setup
- **Staging**: Use cloud MySQL with proper migrations
- **Production**: Use managed database service with backups

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/teachers` - Teacher management
- `GET /api/admin/parents` - Parent management
- `GET /api/admin/students` - Student management
- `GET /admin/classes` - Class management
- `GET /api/admin/approvals` - Approval management
- `GET /api/admin/reports` - Reports management

### Teacher Endpoints
- `GET /api/teacher/dashboard` - Teacher dashboard stats
- `POST /api/teacher/attendance` - Record attendance
- `POST /api/teacher/performance` - Add performance data
- `GET /api/teacher/submissions` - View submissions
- `GET /api/teacher/classes` - View assigned classes

### Parent Endpoints
- `GET /api/parent/dashboard` - Parent dashboard stats
- `GET /api/parent/students` - View children info
- `GET /api/parent/attendance` - View attendance
- `GET /api/parent/performance` - View performance
- `GET /api/parent/results` - View results
- `GET /api/parent/announcements` - View announcements
- `GET /api/parent/events` - View events

## 🔄 Development Workflow

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Implement proper error handling
- Write meaningful commit messages
- Use semantic versioning

### Git Workflow
1. Create feature branches from `main`
2. Make changes and test thoroughly
3. Submit pull requests for review
4. Merge to `main` after approval

### Database Changes
1. Update `prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev`
3. Test migration: `npx prisma migrate reset`
4. Apply to production: `npx prisma migrate deploy`

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify MySQL is running
- Check database credentials in `.env.local`
- Ensure database exists and is accessible
- Run `npx prisma generate` after schema changes

#### Authentication Issues
- Verify NextAuth configuration
- Check session management
- Ensure middleware is properly configured
- Verify role-based access rules

#### Build Errors
- Check TypeScript compilation
- Verify all imports are correct
- Ensure environment variables are set
- Check for missing dependencies

### Performance Issues
- Monitor database query performance
- Implement proper indexing
- Use React.memo for expensive components
- Optimize bundle size

## 📋 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Create a feature branch
5. Make your changes
6. Test thoroughly
7. Submit a pull request

### Contribution Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Follow semantic versioning

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Check the documentation in the `/docs` directory
- Review existing issues on GitHub
- Create new issues for bugs or feature requests
- Join our community discussions

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile application (React Native)
- [ ] Email notifications system
- [ ] Advanced analytics dashboard
- [ ] Bulk data import/export
- [ ] Multi-school support
- [ ] Integration with school management systems
- [ ] Advanced reporting with custom filters
- [ ] Real-time notifications via WebSockets

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Enhanced reporting and export features
- **v1.2.0**: Improved mobile responsiveness
- **v1.3.0**: Advanced analytics and insights

## 📞 Documentation

For detailed documentation:
- [API Reference](/docs/api.md)
- [Database Schema](/docs/database.md)
- [Deployment Guide](/docs/deployment.md)
- [Development Guide](/docs/development.md)
- [Troubleshooting](/docs/troubleshooting.md)

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.