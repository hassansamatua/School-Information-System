# Troubleshooting Guide

This guide provides solutions to common issues developers may encounter while working with the School Information System.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Database Problems](#database-problems)
- [Authentication Issues](#authentication-issues)
- [Build and Runtime Errors](#build-and-runtime-errors)
- [Performance Issues](#performance-issues)
- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Testing Issues](#testing-issues)
- [Deployment Issues](#deployment-issues)
- [Common Debugging Techniques](#common-debugging-techniques)

## Installation Issues

### Node.js Version Incompatibility
**Problem**: `Error: Node.js version 16.x is not supported`

**Solution**:
```bash
# Check current Node.js version
node --version

# Install required version (18+)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

### npm Install Fails
**Problem**: `npm ERR! code ERESOLVE` or dependency conflicts

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Permission Denied
**Problem**: `EACCES: permission denied` during installation

**Solutions**:
```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or use nvm for Node.js management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

## Database Problems

### Database Connection Failed
**Problem**: `Can't connect to MySQL server`

**Solutions**:
```bash
# Check if MySQL is running
sudo systemctl status mysql
# or on Windows
net start mysql

# Start MySQL if not running
sudo systemctl start mysql

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Create database if missing
mysql -u root -p -e "CREATE DATABASE school_information_system;"
```

### Invalid Database URL
**Problem**: `Invalid database URL` or `Connection refused`

**Solutions**:
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL

# Correct format:
# mysql://username:password@host:port/database

# Update .env.local
DATABASE_URL="mysql://root:@localhost:3306/school_information_system"
```

### Prisma Migration Errors
**Problem**: `Migration failed` or `Schema mismatch`

**Solutions**:
```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or manually apply schema
npx prisma db push

# Regenerate Prisma client
npx prisma generate

# Check migration status
npx prisma migrate status
```

### Foreign Key Constraint Violations
**Problem**: `Cannot add or update a child row`

**Solutions**:
```sql
-- Check if parent record exists
SELECT * FROM users WHERE id = 'user_id';

-- Check foreign key constraints
SHOW CREATE TABLE students;

-- Update parent record first
UPDATE students SET parentId = NULL WHERE parentId = 'nonexistent_id';
```

## Authentication Issues

### NextAuth Configuration Error
**Problem**: `NEXTAUTH_URL is not configured`

**Solutions**:
```env
# Add to .env.local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Generate secret
openssl rand -base64 32
```

### Session Not Persisting
**Problem**: User gets logged out on page refresh

**Solutions**:
```typescript
// Check NextAuth configuration
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};

// Verify middleware configuration
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### Role-Based Access Not Working
**Problem**: Users can access unauthorized pages

**Solutions**:
```typescript
// Check middleware implementation
export function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role-based access
  if (request.nextUrl.pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}
```

### Password Hashing Issues
**Problem**: Invalid password or login fails

**Solutions**:
```typescript
// Verify password hashing
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

const verifyPassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};
```

## Build and Runtime Errors

### TypeScript Compilation Errors
**Problem**: `Type 'string' is not assignable to type 'never'`

**Solutions**:
```typescript
// Fix type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent'; // Explicit union type
}

// Use proper typing
const [users, setUsers] = useState<User[]>([]);

// Fix type assertions
const role = user.role as UserRole;
```

### Module Not Found
**Problem**: `Cannot find module '@/components/ui/button'`

**Solutions**:
```typescript
// Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// Verify file exists
ls -la src/components/ui/button.tsx

// Check import path
import { Button } from '@/components/ui/button'; // Correct
import { Button } from './ui/button'; // Also correct
```

### Next.js Build Failed
**Problem**: `Build failed` or `Static generation failed`

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check for dynamic imports in static pages
// Use dynamic imports for client-side only components
const DynamicComponent = dynamic(() => import('./DynamicComponent'), {
  ssr: false,
});
```

### Memory Issues During Build
**Problem**: `JavaScript heap out of memory`

**Solutions**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json
"scripts": {
  "build": "node --max-old-space-size=4096 node_modules/.bin/next build"
}
```

## Performance Issues

### Slow Page Load
**Problem**: Pages take too long to load

**Solutions**:
```typescript
// Implement code splitting
const DashboardPage = dynamic(() => import('./DashboardPage'), {
  loading: () => <LoadingSpinner>,
});

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Optimize database queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
  take: 50, // Limit results
});
```

### Database Query Slow
**Problem**: API endpoints respond slowly

**Solutions**:
```sql
-- Add indexes to frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_classid ON students(classId);

-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM students WHERE classId = 'class_id';

-- Optimize Prisma queries
const students = await prisma.student.findMany({
  where: {
    classId: classId,
    status: 'active',
  },
  include: {
    parent: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});
```

### Memory Leaks
**Problem**: Application memory usage increases over time

**Solutions**:
```typescript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Clear intervals and timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // Interval logic
  }, 1000);

  return () => {
    clearInterval(interval);
  };
}, []);
```

## Frontend Issues

### CSS Not Applying
**Problem**: Tailwind styles not working

**Solutions**:
```bash
# Check Tailwind configuration
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css

# Verify CSS import in layout.tsx
import './globals.css';

# Check PostCSS configuration
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Components Not Rendering
**Problem**: Components show blank or don't render

**Solutions**:
```typescript
// Check for JavaScript errors
// Open browser dev tools and check console

// Verify component exports
export default function UserProfile() {
  return <div>User Profile</div>;
}

// Check for missing return statements
const MyComponent = () => {
  const data = fetchData();
  // Missing return statement
  return <div>{data}</div>;
};
```

### State Management Issues
**Problem**: State not updating or persisting

**Solutions**:
```typescript
// Use proper state updates
const [count, setCount] = useState(0);

// Correct way to update based on previous state
setCount(prevCount => prevCount + 1);

// Use useEffect for side effects
useEffect(() => {
  // Side effect logic
  return () => {
    // Cleanup
  };
}, [dependency]);
```

### Form Validation Not Working
**Problem**: Form validation errors not showing

**Solutions**:
```typescript
// Check form resolver configuration
const form = useForm({
  resolver: zodResolver(userSchema),
  mode: 'onSubmit', // or 'onChange', 'onBlur'
});

// Display validation errors
{errors.name && (
  <p className="text-red-500">{errors.name.message}</p>
)}

// Check schema validation
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});
```

## Backend Issues

### API Route Not Found
**Problem**: 404 errors for API endpoints

**Solutions**:
```typescript
// Check file structure
// app/api/users/route.ts (correct)
// app/api/users/index.ts (incorrect for App Router)

// Verify export names
export async function GET(request: NextRequest) {
  // Implementation
}

export async function POST(request: NextRequest) {
  // Implementation
}
```

### CORS Issues
**Problem**: CORS errors when calling API from frontend

**Solutions**:
```typescript
// Add CORS headers to API routes
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { data: 'response' },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}
```

### Database Connection Pool Exhausted
**Problem**: Too many database connections

**Solutions**:
```typescript
// Use singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Close connections in cleanup
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Memory Leaks in API Routes
**Problem**: Memory usage increases with API calls

**Solutions**:
```typescript
// Use streaming for large data
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Stream data
      controller.enqueue('data');
      controller.close();
    },
  });

  return new Response(stream);
}

// Implement pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const data = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

## Testing Issues

### Test Fails with Database Error
**Problem**: Tests fail due to database connection

**Solutions**:
```typescript
// Use test database
const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
});

// Mock database for unit tests
jest.mock('@/lib/database', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

### Component Testing Issues
**Problem**: React Testing Library can't find elements

**Solutions**:
```typescript
// Use proper test queries
import { screen, render } from '@testing-library/react';

// Use getByRole for accessibility
screen.getByRole('button', { name: 'Submit' });

// Use getByText for text content
screen.getByText('User Profile');

// Use data-testid for complex elements
<button data-testid="submit-button">Submit</button>
screen.getByTestId('submit-button');
```

### Mock Function Not Called
**Problem**: Jest mocks not working as expected

**Solutions**:
```typescript
// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Use proper mock implementation
const mockFetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ data: 'test' }),
});

global.fetch = mockFetch;

// Verify mock calls
expect(mockFetch).toHaveBeenCalledWith('/api/users');
expect(mockFetch).toHaveBeenCalledTimes(1);
```

## Deployment Issues

### Build Fails in Production
**Problem**: `npm run build` fails in production

**Solutions**:
```bash
# Check environment variables
printenv | grep NEXTAUTH

# Verify all required variables are set
echo $DATABASE_URL
echo $NEXTAUTH_SECRET

# Check Node.js version
node --version

# Use production build command
NODE_ENV=production npm run build
```

### Database Connection in Production
**Problem**: Can't connect to database after deployment

**Solutions**:
```bash
# Test database connection
mysql -h host -u user -p database

# Check firewall settings
# Ensure database port is open

# Use SSL connection if required
DATABASE_URL="mysql://user:pass@host:port/db?sslmode=require"
```

### Environment Variables Not Loading
**Problem**: Environment variables undefined in production

**Solutions**:
```bash
# Check .env file location
ls -la .env*

# Verify variable names
# NEXTAUTH_SECRET (correct)
# NEXTAUTH-SECRET (incorrect)

# Restart application after env changes
pm2 restart app
```

### Static Assets Not Loading
**Problem**: CSS, JS, or images not loading

**Solutions**:
```typescript
// Check public folder structure
public/
├── images/
├── icons/
└── uploads/

// Use correct paths
<Image src="/images/logo.png" alt="Logo" />

// Check build output
ls -la .next/static/
```

## Common Debugging Techniques

### Console Debugging
```typescript
// Use console.log for quick debugging
console.log('User data:', user);
console.log('API response:', response);

// Use console.table for arrays
console.table(users);

// Use console.group for related logs
console.group('User Authentication');
console.log('User:', user);
console.log('Session:', session);
console.groupEnd();
```

### Browser DevTools
```javascript
// Network tab - Check API calls
// Console tab - Look for JavaScript errors
// Elements tab - Inspect DOM and CSS
// Application tab - Check localStorage and cookies

// Debug React components
// Install React DevTools browser extension
```

### VS Code Debugging
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Error Boundary Implementation
```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }

    return this.props.children;
  }
}
```

### Performance Profiling
```typescript
// Use React Profiler
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};

<Profiler id="UserProfile" onRender={onRenderCallback}>
  <UserProfile user={user} />
</Profiler>

// Use performance API
const startTime = performance.now();
// Run expensive operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

---

This troubleshooting guide covers the most common issues developers may encounter. For additional help, check the documentation, create an issue in the repository, or reach out to the development team.