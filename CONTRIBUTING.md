# Contributing to School Relocation Planner

Thank you for contributing to the School Relocation Planner! This document provides guidelines and standards for contributing to the project.

## 📋 Before You Start

1. **Read the Project Delivery Plan** — `../PROJECT_DELIVERY_PLAN.md`
2. **Check Dependencies** — `../DEPENDENCIES_MASTER.md`
3. **Review Code Standards** — `../.cursorrules`
4. **Understand Code Conventions** — `../CODE_WRITING_CONVENTIONS.md`

## 🎯 Development Standards

### Code Quality

- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: 0 errors, 0 warnings
- **Prettier**: Consistent formatting
- **Tests**: 85%+ coverage on financial modules
- **Performance**: <800ms page load, <400ms statement generation

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test changes
- `refactor`: Code refactoring
- `chore`: Tooling/config changes
- `perf`: Performance improvements

**Examples:**
```
feat(financial-engine): add NPV calculation for rent schedules

Implement Net Present Value calculation using Decimal.js for
precision. Supports all three rent models: Fixed+Esc, Revenue
Share, and Partner.

Closes #123
```

## 🔄 Development Workflow

### 1. Before Writing Code

```bash
# Check current phase and tasks
cat ../PROJECT_DELIVERY_PLAN.md

# Verify dependencies
cat ../DEPENDENCIES_MASTER.md

# Pull latest changes
git pull origin main
```

### 2. Create a Branch

```bash
git checkout -b feat/your-feature-name
```

### 3. Write Code

- Follow naming conventions (see `../CODE_WRITING_CONVENTIONS.md`)
- Write self-documenting code
- Add JSDoc comments for public functions
- Use early returns to reduce nesting
- Extract magic numbers to constants

### 4. Write Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### 5. Run Quality Checks

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format

# Build
pnpm build
```

### 6. Commit Changes

```bash
git add .
git commit -m "feat: your feature description"
```

Pre-commit hooks will automatically:
- Run ESLint
- Run Prettier
- Check for errors

### 7. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub.

## ✅ Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project conventions
- [ ] All tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention
- [ ] PR description explains changes
- [ ] Related issues linked

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Use Vitest and React Testing Library
- Aim for 85%+ coverage on financial modules
- Test edge cases

### Integration Tests

- Test API routes and database operations
- Use Vitest with Supertest
- Mock external dependencies

### E2E Tests

- Test critical user journeys
- Use Playwright
- Test on multiple browsers

### Golden Dataset Tests

- Test financial engine accuracy
- Use known-good inputs and outputs
- Located in `tests/golden/`

## 📝 Code Review Process

1. **Automated Checks**: CI must pass
2. **Peer Review**: At least 1 approval required
3. **Code Quality**: Follows all standards
4. **Testing**: Adequate test coverage
5. **Documentation**: Updated if needed

## 🚫 What NOT to Do

- ❌ Skip quality gates
- ❌ Use `any` type without justification
- ❌ Skip validation on user input
- ❌ Commit secrets or API keys
- ❌ Bypass RLS policies
- ❌ Modify locked versions
- ❌ Hard-delete records (use soft delete)
- ❌ Skip tests
- ❌ Ignore linting errors

## 🎯 Quality Standards

### Code Writing

- **Naming**: PascalCase for components, camelCase for functions, UPPER_SNAKE_CASE for constants
- **Functions**: Small, focused, single responsibility
- **Comments**: Explain "why", not "what"
- **DRY**: Don't Repeat Yourself
- **Early Returns**: Reduce nesting

### Financial Calculations

- **Always use Decimal.js** for money calculations
- **Round consistently** to 2 decimal places
- **Test with golden datasets**
- **Document formulas** in JSDoc

### Performance

- **Page load**: <800ms (p95)
- **Statement generation**: <400ms (p95)
- **Comparison**: <500ms (p95)
- **Use React Server Components** by default
- **Implement caching** where appropriate

### Security

- **Validate all input** with Zod
- **Check authentication** on all routes
- **Check authorization** before actions
- **Use parameterized queries**
- **Rate limit** public endpoints

## 📚 Resources

- [Project Delivery Plan](../PROJECT_DELIVERY_PLAN.md)
- [Technical Specification](../SCHOOL_RELOCATION_PLANNER_TECHNICAL_SPEC.md)
- [Dependencies Master](../DEPENDENCIES_MASTER.md)
- [Code Writing Conventions](../CODE_WRITING_CONVENTIONS.md)
- [Zero Error Development Guide](../ZERO_ERROR_DEVELOPMENT_GUIDE.md)

## 💬 Questions?

- Check documentation first
- Search GitHub issues
- Ask in team Slack channel
- Tag @tech-lead for urgent issues

---

**Remember**: Code is read 10x more than it's written. Optimize for readability.

