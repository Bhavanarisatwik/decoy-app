# Angular Project Guidelines for GitHub Copilot

## Code Style and Best Practices

### Component Structure
- Use standalone components (default in Angular 17+)
- Follow the single responsibility principle
- Keep component logic minimal, delegate to services

### Naming Conventions
- Components: PascalCase with suffix `Component` (e.g., `UserProfileComponent`)
- Services: PascalCase with suffix `Service` (e.g., `DataService`)
- Directives: camelCase with descriptive names
- Pipes: camelCase with suffix `Pipe`

### File Organization
- One component/service/directive per file
- Group related features in feature modules or folders
- Place shared code in a `shared` folder

### TypeScript Best Practices
- Use strict type checking
- Prefer interfaces over classes for data models
- Use readonly for properties that shouldn't change
- Leverage TypeScript utility types

### Angular Specific
- Use signals for reactive state management
- Prefer `inject()` function over constructor injection
- Use `OnPush` change detection strategy where possible
- Implement proper lifecycle hooks
- Use async pipe for observables in templates

### Template Syntax
- Use `@if`, `@for`, `@switch` (new control flow syntax)
- Avoid complex logic in templates
- Use track expressions in `@for` loops

### Routing
- Use lazy loading for feature modules
- Implement route guards for protected routes
- Use resolver for pre-fetching data

### State Management
- Use signals for local state
- Consider RxJS for complex async operations
- Implement proper error handling

### Testing
- Write unit tests for components and services
- Use TestBed for component testing
- Mock dependencies appropriately

### Performance
- Implement trackBy functions in lists
- Use OnPush change detection
- Lazy load routes and modules
- Optimize bundle size
