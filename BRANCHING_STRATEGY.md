# Git Branching Strategy

## Overview
This project follows a **Git Flow** branching strategy with some modifications for better CI/CD integration.

## Branch Types

### Main Branches
- **`main`** - Production-ready code. Only merge through pull requests.
- **`develop`** - Integration branch for features. Latest development changes.

### Supporting Branches
- **`feature/*`** - New features and enhancements
- **`bugfix/*`** - Bug fixes for develop branch
- **`hotfix/*`** - Critical fixes for production
- **`release/*`** - Prepare releases (version bumps, final testing)

## Naming Conventions

### Feature Branches
- `feature/user-authentication`
- `feature/file-upload-system`
- `feature/real-time-chat`

### Bug Fix Branches
- `bugfix/login-validation-error`
- `bugfix/memory-leak-in-websocket`

### Hotfix Branches
- `hotfix/security-vulnerability`
- `hotfix/critical-database-issue`

### Release Branches
- `release/v1.2.0`
- `release/v2.0.0-beta`

## Workflow

### Feature Development
1. Create feature branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature-name
   ```

2. Develop and commit changes
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

3. Push branch and create Pull Request
   ```bash
   git push origin feature/new-feature-name
   ```

4. After review and approval, merge to `develop`

### Hotfix Process
1. Create hotfix branch from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. Fix issue and commit
   ```bash
   git add .
   git commit -m "fix: resolve critical issue"
   ```

3. Create PRs to both `main` and `develop`

### Release Process
1. Create release branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.0
   ```

2. Final testing, version bumps, documentation updates
3. Merge to `main` and `develop`
4. Tag the release on `main`
   ```bash
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push origin v1.2.0
   ```

## Pull Request Rules

### Required for ALL merges to main/develop:
- [ ] At least 1 reviewer approval
- [ ] All CI checks pass
- [ ] No merge conflicts
- [ ] Up-to-date with target branch
- [ ] Squash merge preferred for features

### Protection Rules:
- **main**: Require PR, require status checks, require up-to-date
- **develop**: Require PR, require status checks

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: add user authentication system
fix: resolve login validation error
docs: update API documentation
style: fix code formatting
refactor: restructure user service
test: add unit tests for auth module
chore: update dependencies
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Branch Protection

### main branch:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to admins only
- Delete head branches automatically

### develop branch:
- Require pull request reviews
- Require status checks to pass
- Allow force pushes for maintainers
- Delete head branches automatically

## Best Practices

1. **Keep branches small and focused**
2. **Write descriptive commit messages**
3. **Regularly sync with develop**
4. **Delete merged branches**
5. **Use draft PRs for work in progress**
6. **Add reviewers based on expertise**
7. **Link PRs to issues**
8. **Update documentation with features**

## GitHub Integration

- Use GitHub Issues for tracking
- Link PRs to issues with "Closes #123"
- Use GitHub Projects for sprint planning
- Set up branch protection rules
- Configure status checks (CI/CD)
- Use code owners for automated review assignment