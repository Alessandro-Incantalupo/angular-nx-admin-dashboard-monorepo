# Admin Dashboard NX Monorepo

A production-ready enterprise admin dashboard built with Angular 21, Nx monorepo, and NgRx Signals demonstrating the patterns I consider non-negotiable in a well-structured Angular codebase.

## 🌐 **Live Demo**

- 🚀 **Frontend**: [admin-dashboard-nx-monorepo.vercel.app](https://admin-dashboard-nx-monorepo.vercel.app)
- 🔗 **Backend API**: [nx-angular-admin-vu22n.ondigitalocean.app](https://nx-angular-admin-vu22n.ondigitalocean.app/)

The frontend consumes data from the deployed backend API both are live and connected.

## Screenshot

<!-- Add a screenshot here: open the live demo, capture the user management table -->
![Dashboard: user management table with Signal Store state](./docs/screenshot.png)

## Why I Built It

Most Angular work I do lives behind NDAs. This project exists to make the architecture visible. The decisions here are the ones I'd make on any production codebase:

- **Services as the network boundary**: each HTTP service is the only layer that knows the backend URL and response shape. It fetches raw data and hands it off. Components never call services directly, which means swapping environments or backends touches one file, not the whole app.
- **Signal Store as the manipulation and distribution layer**: the store transforms, filters, and derives exactly what each component needs. Components consume signals passively. The store slice per feature keeps the domain's data and derived state co-located.
- **`OnPush` + zoneless**: components opt out of zone.js and trigger re-renders only when signals change. This is where Angular's roadmap is pointing; writing it this way now makes the eventual migration trivial.
- **Feature-based folder structure with lazy loading**: each domain (users, auth, settings) is a self-contained directory with its own store, service, and interceptor scope. The route chunk boundary enforces it at build time. Nothing from one feature leaks into another.

---

## 🎯 **Key Highlights**

- ✅ **Modern Angular 21** with standalone components and signal-based state management
- ✅ **Nx Monorepo** architecture with shared libraries and dependency management
- ✅ **Full-stack implementation** with REST API backend and frontend consuming it
- ✅ **Enterprise-grade patterns** including CRUD operations, user management, and role-based features
- ⚙️ **Production-ready tooling setup** with ESLint, Prettier, Jest, and Playwright configured
- ✅ **Modern UI/UX** with TailwindCSS, PrimeNG, and responsive design

## 🏗️ **Architecture Overview**

```
├── apps/
│   ├── admin-dashboard/          # Angular 21 Frontend Application
│   ├── api/                      # Hono.js + Bun REST API (current)
├── libs/
│   ├── models/                   # Shared TypeScript Models
│   └── app-info/                 # Shared Application Info
└── tools/                        # Nx Workspace Tooling
```

### **Frontend Architecture (Angular 21)**

- **Standalone Components** with modern Angular patterns
- **Signal Store** for reactive state management (NgRx Signals)
- **Feature-based folder structure** with lazy loading
- **Shared UI components** with PrimeNG and custom components
- **Internationalization** with Transloco
- **Responsive design** with TailwindCSS and custom themes

### **Backend Architecture**

- **Current**: REST API built with Hono.js on Bun, TypeScript-first with shared models
- **In Progress**: Quarkus (Java) backend with PostgreSQL, secured with Keycloak (OAuth 2.0 / OIDC)
- **CRUD operations** for user management with a structured data layer

### **Monorepo Benefits**

- **Code sharing** between frontend and backend (shared models)
- **Consistent tooling** across all projects
- **Optimized build pipeline** with Nx caching and task orchestration
- **Scalable architecture** ready for additional apps and libraries

## What This Demonstrates

| Pattern | Where |
|---|---|
| HTTP interceptors: global auth injection, error normalisation, response transformation | `apps/admin-dashboard/src/app/core/interceptors/` |
| NgRx Signal Store: per-feature state slices, computed state, effect isolation | `apps/admin-dashboard/src/app/` |
| `OnPush` change detection + zoneless signals | Component files in `apps/admin-dashboard/src/app/` |
| Feature-based lazy loading with self-contained route chunks | `app.routes.ts` |
| Nx shared library boundary: compiler-enforced type safety across apps | `libs/models/`, `libs/app-info/` |
| CI/CD: GitHub Actions + Docker build + DigitalOcean App Platform | `.github/workflows/`, `api/Dockerfile` |
| Full-stack TypeScript: shared models between Angular and Hono.js API | `libs/models/` consumed in both `apps/api/` and `apps/admin-dashboard/` |
| Vercel frontend + DigitalOcean backend (both live, CORS configured) | Live demo links above |

## 🚀 **Technical Skills Demonstrated**

### **Frontend Development**

- **Angular 21** - Latest features including standalone components, new control flow, signals
- **State Management** - NgRx Signals for reactive, signal-based state management
- **Component Architecture** - Reusable components with proper encapsulation
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Form Handling** - Reactive forms with validation
- **HTTP Client** - REST API integration with proper error handling
- **Routing** - Feature-based routing with guards and lazy loading

### **Development Tools & Best Practices**

- **TypeScript** - Strict typing and advanced TypeScript features
- **Testing Setup** - Jest and Playwright configured for unit and E2E testing
- **Code Quality** - ESLint, Prettier, and custom rules for Angular
- **Build Tools** - Nx workspace with optimized build pipeline
- **Version Control** - Git with proper commit conventions

### **UI/UX Design**

- **Modern Design System** - Consistent theming with CSS custom properties
- **Component Library** - PrimeNG integration with custom styling
- **Accessibility** - WCAG compliant components and navigation
- **Performance** - Optimized bundle sizes and lazy loading

## 🛠️ **Getting Started**

### **Prerequisites**

```bash
Node.js 18+
pnpm (recommended package manager)
```

### **Installation & Development**

```bash
# Clone and install dependencies
git clone https://github.com/Alessandro-Incantalupo/admin-dashboard-nx-monorepo
cd admin-dashboard-nx-monorepo
pnpm install

# Start development servers
pnpm nx serve admin-dashboard  # Frontend (http://localhost:4300)
pnpm nx serve api             # Backend API (http://localhost:3000)

# Testing (when implemented)
pnpm nx test admin-dashboard      # Unit tests
pnpm nx e2e admin-dashboard-e2e   # E2E tests

# Build for production
pnpm nx build admin-dashboard
pnpm nx build api
```

## 🎨 **Features Showcase**

### **User Management System**

- **CRUD Operations** - Create, read, update, delete users
- **Role-based Access** - Admin and user role management
- **Status Management** - Active/inactive user status
- **Profile Management** - User profile with avatar and details

### **Modern UI Components**

- **Responsive Dashboard** - Clean, modern admin interface
- **Data Tables** - Sortable, filterable user tables
- **Form Controls** - Reactive forms with validation
- **Navigation** - Sidebar navigation with route highlighting
- **Theming** - Light/dark theme support

### **State Management**

- **Signal Store** - Modern reactive state management
- **HTTP Integration** - API calls with loading states
- **Error Handling** - Graceful error states and user feedback

## 📊 **Project Structure Deep Dive**

### **Shared Libraries Strategy**

```typescript
// libs/models - Shared TypeScript interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
}

// Used in both frontend and backend for type safety
```

### **Component Architecture Example**

```typescript
// Signal-based component with modern Angular patterns
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class ProfileInfoComponent {
  private userStore = inject(UserStore);

  userName = computed(() => this.userStore.currentUser()?.name);
  avatarUrl = computed(() => this.generateAvatarUrl());
}
```

## 🔧 **Technical Decisions & Rationale**

### **Why Nx Monorepo?**

- **Code Sharing** - Shared models prevent duplication and ensure type safety
- **Build Optimization** - Intelligent caching and task orchestration
- **Scalability** - Easy to add new apps and libraries
- **Developer Experience** - Consistent tooling and commands

### **Why Angular Signals?**

- **Performance** - Fine-grained reactivity without zone.js overhead
- **Modern Patterns** - Future-proof architecture aligned with Angular's direction
- **Developer Experience** - Simpler mental model than RxJS for state management

### **Why Quarkus + Keycloak + PostgreSQL?**

- **Performance** - Native compilation and fast startup vs traditional Spring Boot
- **Security** - Industry-standard OAuth 2.0 / OIDC via Keycloak for enterprise authentication
- **PostgreSQL** - Production-grade relational database with type-safe JPA/Hibernate integration
- **Cloud-native** - Designed for containerized, microservices-ready deployments

### **Why PrimeNG + TailwindCSS?**

- **Rapid Development** - Pre-built components with customizable styling
- **Consistency** - Design system approach with utility-first CSS
- **Accessibility** - WCAG compliant components out of the box

## 🚀 **Deployment & DevOps**

### **CI/CD & Dockerized Deployments**

- **Dockerized Backend**: The backend API is containerized using Docker for consistent deployments.
- **Automated CI/CD**: GitHub Actions workflows build and push Docker images on every commit.
- **DigitalOcean Deployment**: The latest Docker image is deployed to DigitalOcean App Platform, ensuring a live, production-ready API.
- **Seamless Updates**: Every push to the main branch triggers a new deployment, keeping the live API up-to-date.

> See the `.github/workflows/` directory for the CI/CD pipeline configuration and `api/Dockerfile` for the backend container setup.

### **Production Deployments**

- **Frontend**: Deployed on **Vercel** with automatic deployments from Git
- **Integration**: Frontend configured to consume the production API

### **Deployment Features**

- ✅ **Automatic deployments** from Git commits
- ✅ **Environment-specific configurations**
- ✅ **Production build optimizations**
- ✅ **HTTPS/SSL enabled** on both frontend and backend
- ✅ **CORS properly configured** for cross-origin requests

## 📈 **Development Status & Roadmap**

### **✅ Completed**

- ✅ **Core Architecture** - Nx monorepo with Angular 21 and Hono.js + Bun backend
- ✅ **UI Framework** - PrimeNG components with TailwindCSS styling
- ✅ **State Management** - NgRx Signals implementation
- ✅ **User Features** - CRUD operations and user management
- ✅ **Code Quality Setup** - ESLint, Prettier, TypeScript strict mode
- ✅ **CI/CD Pipeline** - GitHub Actions + Docker + DigitalOcean deployment

### **🚧 In Progress / Planned**

- ⚙️ **Quarkus Backend Migration** - Replacing Hono.js + Bun API with Java Quarkus for native performance
- ⚙️ **PostgreSQL Integration** - Production database with JPA/Hibernate and type-safe repositories
- ⚙️ **Keycloak Authentication** - OAuth 2.0 / OIDC enterprise auth with role-based access control
- ⚙️ **Testing Implementation** - Unit tests with Jest, E2E tests with Playwright
- ⚙️ **Performance Optimization** - Bundle analysis and optimization
- ⚙️ **Accessibility Audit** - WCAG compliance testing and improvements
