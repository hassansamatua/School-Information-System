# Development Guide

This guide provides comprehensive information for developers working on the School Information System, including code structure, conventions, best practices, and development workflow.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Code Conventions](#code-conventions)
- [Development Workflow](#development-workflow)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [API Development](#api-development)
- [Database Development](#database-development)
- [Testing](#testing)
- [Debugging](#debugging)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MySQL 8.0+
- Git
- VS Code (recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd school-information-system

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### Development Tools
- **VS Code Extensions**:
  - Prisma
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
  - GitLens

### Environment Configuration
```env
# Development environment
NODE_ENV=development
DATABASE_URL="mysql://root:@localhost:3306/school_information_system"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
```

## Project Structure

### Directory Overview
```
src/
├── app/                    # Next.js app directory
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API routes
│   ├── parent/          # Parent dashboard pages
│   ├── teacher/         # Teacher dashboard pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── login/           # Authentication pages
├── components/              # Reusable components
│   ├── ui/              # ShadCN UI components
│   ├── layout/           # Layout components
│   ├── forms/           # Form components
│   ├── dashboard/       # Dashboard components
│   └── auth/           # Authentication components
├── lib/                  # Utility functions
│   ├── auth.ts          # Authentication helpers
│   ├── database.ts      # Database connection
│   ├── utils.ts         # Utility functions
│   ├── constants.ts     # App constants
│   └── validations.ts   # Form validation schemas
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── middleware.ts          # NextAuth middleware
└── context/              # React contexts
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: kebab-case (e.g., `user-profile/page.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useUserProfile.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Import Organization
```typescript
// 1. React and Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/userTypes';
```

## Code Conventions

### TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper typing for all functions and variables
- Avoid `any` type unless absolutely necessary

```typescript
// Good practice
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'parent';
}

const getUserById = async (id: string): Promise<User | null> => {
  // Implementation
};

// Avoid this
const getUserById = async (id: any): Promise<any> => {
  // Implementation
};
```

### Component Structure
```typescript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Update logic
      onUpdate?.(updatedUser);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

export default UserProfile;
```

### Form Validation
```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'teacher', 'parent']),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm: React.FC = () => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'parent',
    },
  });

  const onSubmit = (data: UserFormData) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### API Route Structure
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'parent']),
});

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        admin: true,
        teacher: true,
        parent: true,
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const user = await prisma.user.create({
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

## Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/user-profile

# Make changes
git add .
git commit -m "feat: add user profile component"

# Push to remote
git push origin feature/user-profile

# Create pull request
# Request code review
# Merge after approval
```

### Commit Message Convention
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user registration API
fix(dashboard): resolve attendance display issue
docs(readme): update installation instructions
```

### Code Review Process
1. **Self-review**: Review your own code before submitting
2. **Peer review**: Request review from team member
3. **Automated checks**: Ensure all tests pass
4. **Approval**: Merge after approval

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical fixes
- `release/*`: Release preparation

## Component Architecture

### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Footer
├── Dashboard
│   ├── StatsCards
│   ├── Charts
│   └── RecentActivity
└── Pages
    ├── Admin
    ├── Teacher
    └── Parent
```

### Component Patterns

#### 1. Presentational Components
```typescript
// Pure UI components without business logic
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
}> = ({ title, value, icon, trend }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="text-2xl">{icon}</div>
        </div>
        {trend && <TrendIndicator trend={trend} />}
      </CardContent>
    </Card>
  );
};
```

#### 2. Container Components
```typescript
// Components with business logic
export const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) return <StatsSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Students" value={stats?.totalStudents} />
      <StatCard title="Total Teachers" value={stats?.totalTeachers} />
      <StatCard title="Total Classes" value={stats?.totalClasses} />
      <StatCard title="Pending Approvals" value={stats?.pendingApprovals} />
    </div>
  );
};
```

#### 3. Higher-Order Components
```typescript
// withAuth HOC
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) => {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();

    if (isLoading) return <LoadingSpinner />;

    if (!user) {
      redirect('/login');
      return null;
    }

    if (requiredRole && user.role !== requiredRole) {
      redirect('/unauthorized');
      return null;
    }

    return <Component {...props} />;
  };
};

// Usage
export default withAuth(DashboardPage, 'admin');
```

## State Management

### Local State
```typescript
// Use useState for simple local state
const [isLoading, setIsLoading] = useState(false);
const [formData, setFormData] = useState<FormData>({});

// Use useReducer for complex state logic
const formReducer = (state: FormState, action: FormAction) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [formState, dispatch] = useReducer(formReducer, initialState);
```

### Global State
```typescript
// Context for user authentication
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session on mount
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await signIn('credentials', { email, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Server State
```typescript
// Custom hook for API data
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation for data updates
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create user');
    },
  });
};
```

## API Development

### API Route Structure
```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        admin: true,
        teacher: true,
        parent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const user = await prisma.user.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

### Error Handling
```typescript
// Custom error class
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handler middleware
export const handleApiError = (error: unknown) => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
};
```

### Validation
```typescript
// Request validation schema
const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'teacher', 'parent']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
    }
  };
};
```

## Database Development

### Prisma Schema Development
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(PARENT)
  password  String
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  admin     Admin?
  teacher   Teacher?
  parent    Parent?

  @@map("users")
}

enum Role {
  ADMIN
  TEACHER
  PARENT
}
```

### Database Operations
```typescript
// lib/database.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Repository Pattern
```typescript
// lib/repositories/userRepository.ts
export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        admin: true,
        teacher: true,
        parent: true,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
```

### Migration Management
```bash
# Create new migration
npx prisma migrate dev --name add_user_profile

# Apply migration
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

## Testing

### Unit Testing
```typescript
// __tests__/components/UserProfile.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'parent' as const,
  };

  it('renders user information correctly', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onUpdate when update button is clicked', () => {
    const mockOnUpdate = jest.fn();
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Update'));
    expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
  });
});
```

### Integration Testing
```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/users/route';

describe('/api/users', () => {
  it('GET returns list of users', async () => {
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('POST creates new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      role: 'parent',
      password: 'password123',
    };

    const { req } = createMocks({
      method: 'POST',
      body: userData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe(userData.name);
  });
});
```

### E2E Testing
```typescript
// e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test';

test('user registration flow', async ({ page }) => {
  await page.goto('/register');

  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.fill('[data-testid="email-input"]', 'john@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.selectOption('[data-testid="role-select"]', 'parent');

  await page.click('[data-testid="register-button"]');

  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  await expect(page).toHaveURL('/dashboard');
});
```

## Debugging

### Debugging Techniques
```typescript
// Use console.log for quick debugging
console.log('User data:', user);

// Use debugger for breakpoints
debugger;

// Use React DevTools
// Install browser extension for React debugging

// Use Next.js debugging
// Set NEXT_PUBLIC_DEBUG=true in .env.local
```

### Error Logging
```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  },
  info: (message: string, data?: unknown) => {
    console.log(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data);
  },
};
```

### Performance Monitoring
```typescript
// Use React Profiler
import { Profiler } from 'react';

const onRenderCallback = (id: string, phase: string, actualDuration: number) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
};

<Profiler id="UserProfile" onRender={onRenderCallback}>
  <UserProfile user={user} />
</Profiler>
```

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for code splitting
const DashboardPage = dynamic(() => import('@/app/admin/page'), {
  loading: () => <LoadingSpinner>,
  ssr: false,
});

// Route-based code splitting
const AdminDashboard = lazy(() => import('@/components/AdminDashboard'));
const TeacherDashboard = lazy(() => import('@/components/TeacherDashboard'));
```

### Image Optimization
```typescript
import Image from 'next/image';

export const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
  return (
    <Image
      src={user.image || '/default-avatar.png'}
      alt={user.name}
      width={40}
      height={40}
      className="rounded-full"
      priority={user.role === 'admin'}
    />
  );
};
```

### Database Optimization
```typescript
// Use select for specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
});

// Use include for relations efficiently
const userWithProfile = await prisma.user.findUnique({
  where: { id },
  include: {
    admin: {
      select: {
        permissions: true,
      },
    },
  },
});

// Use where and orderBy for filtering
const activeStudents = await prisma.student.findMany({
  where: {
    status: 'active',
    class: {
      grade: '10',
    },
  },
  orderBy: {
    name: 'asc',
  },
});
```

## Security Best Practices

### Input Validation
```typescript
// Always validate user input
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'parent']),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

// Sanitize data before database operations
const sanitizedData = {
  name: data.name.trim(),
  email: data.email.toLowerCase(),
  role: data.role,
};
```

### Authentication Security
```typescript
// Use secure password hashing
import bcrypt from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

// Use secure session management
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
};
```

### Authorization
```typescript
// Role-based middleware
export const withRole = (requiredRole: UserRole) => {
  return async (request: NextRequest) => {
    const session = await getServerSession(request);
    
    if (!session?.user || session.user.role !== requiredRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  };
};
```

### Data Protection
```typescript
// Use environment variables for secrets
const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.NEXTAUTH_SECRET;

// Never log sensitive data
logger.info('User created', { userId: user.id }); // Good
logger.info('User created', { user }); // Bad - logs sensitive data

// Use HTTPS in production
const secureCookie = process.env.NODE_ENV === 'production';
```

---

This development guide provides comprehensive information for working with the School Information System codebase. Follow these conventions and best practices to maintain code quality and consistency across the project.