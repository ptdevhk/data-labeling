# Versioning & CI/CD Guide

This project uses automated semantic versioning based on [Conventional Commits](https://www.conventionalcommits.org/) with [semantic-release](https://github.com/semantic-release/semantic-release).

## Quick Reference

### Version Format
We follow [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

### Version Commands

```bash
# Check current version
make version-current

# Manual version bump
make version-bump TYPE=patch   # 1.2.3 → 1.2.4
make version-bump TYPE=minor   # 1.2.3 → 1.3.0
make version-bump TYPE=major   # 1.2.3 → 2.0.0

# Sync version across files
make version-sync VERSION=1.2.3
```

## Commit Message Format

### Structure
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Commit Types & Version Bumps

| Type | Version Bump | Description |
|------|--------------|-------------|
| `feat` | **MINOR** | New feature |
| `fix` | **PATCH** | Bug fix |
| `perf` | **PATCH** | Performance improvement |
| `refactor` | **PATCH** | Code restructuring |
| `build` | **PATCH** | Build system changes |
| `revert` | **PATCH** | Revert previous commit |
| `docs` | None | Documentation only |
| `style` | None | Code formatting |
| `test` | None | Test changes |
| `ci` | None | CI configuration |
| `chore` | None | Maintenance tasks |
| `BREAKING CHANGE:` | **MAJOR** | Breaking change (in footer) |

### Examples

**Feature (MINOR bump):**
```bash
git commit -m "feat(canvas): add polygon drawing tool"
```

**Bug Fix (PATCH bump):**
```bash
git commit -m "fix(auth): resolve token expiration issue"
```

**Breaking Change (MAJOR bump):**
```bash
git commit -m "feat(api): redesign authentication

BREAKING CHANGE: JWT token format changed. All clients must update."
```

**Documentation (NO bump):**
```bash
git commit -m "docs(readme): update installation instructions"
```

### Common Scopes
- `canvas` - Annotation canvas
- `auth` - Authentication
- `api` - Backend API
- `ui` - User interface
- `i18n` - Internationalization
- `deps` - Dependencies
- `ci` - CI/CD workflows
- `docker` - Docker/deployment

## Automated Release Process

### How It Works

When commits are pushed to `main`:

1. **Test**: Backend, frontend, and Docker tests run in parallel
2. **Wait**: Release job depends on all tests passing (native `needs`)
3. **Analyze**: semantic-release analyzes conventional commits
4. **Calculate**: Determines version bump based on commit types
5. **Update**: Updates `CHANGELOG.md`, `VERSION`, `pyproject.toml`, `web/package.json`
6. **Tag**: Creates git tag `vX.Y.Z`
7. **Release**: Publishes GitHub release with notes
8. **Commit**: Commits changes back with `[skip ci]`

### Pre-releases (develop branch)

Commits to `develop` create beta pre-releases:
- Format: `1.2.3-beta.1`, `1.2.3-beta.2`
- Published as GitHub pre-releases

### Workflow Architecture

```yaml
Release Workflow (single workflow, integrated tests)
├── test-backend (parallel) → Python + pytest + lint
├── test-frontend (parallel) → Bun + ESLint + build
├── test-docker (parallel) → Docker build + health check
└── release (needs: all tests) → semantic-release
```

**Why integrated tests?**
- Uses GitHub Actions native `needs` dependency (no third-party actions)
- Fail-fast: release skips if any test fails
- Better visibility: all steps in one workflow
- Follows semantic-release best practices
- No polling/waiting, immediate feedback

## CI/CD Workflows

### Active Workflows

1. **test.yml** - Backend tests (Python, pytest, lint)
2. **test-web.yml** - Frontend tests (React, ESLint, build)  
3. **build.yml** - Docker build and health check
4. **commitlint.yml** - PR commit message validation
5. **release.yml** - Integrated tests + semantic-release
6. **automerge.yml** - Auto-merge Dependabot PRs

### Workflow Execution Flow

**Pull Request:**
```
PR opened/updated
├─ commitlint → validates commit messages
├─ test.yml → backend tests (if backend changed)
├─ test-web.yml → frontend tests (if frontend changed)
└─ build.yml → docker build
```

**Push to Main:**
```
Push to main
└─ release.yml
   ├─ test-backend (parallel)
   ├─ test-frontend (parallel)
   ├─ test-docker (parallel)
   └─ release (runs after all tests pass)
```

## Manual Version Bumping

For local development or hotfixes:

```bash
# Bump version
make version-bump TYPE=patch

# Commit
git add -A
git commit -m "chore(release): 1.2.4"

# Tag
git tag -a v1.2.4 -m "Release v1.2.4"

# Push
git push origin main --tags
```

## Version Files

Version is synchronized across three files:

1. **VERSION** - Single source of truth
2. **pyproject.toml** - Python package version
3. **web/package.json** - Frontend package version

All files are automatically synced by `make version-sync`.

## Best Practices

### ✅ Do's

- Use conventional commit format for all commits
- Use specific scopes (`canvas`, `auth`, `api`)
- Write clear, descriptive commit subjects
- Reference issues with `Closes #123` in commit body
- Mark breaking changes with `BREAKING CHANGE:` footer
- Squash related commits before merging PRs

### ❌ Don'ts

- Avoid vague messages like "fix stuff" or "update code"
- Don't manually edit version files in PRs
- Don't use version numbers in branch names
- Don't mix multiple types in one commit
- Don't use vague scopes like `misc` or `various`

## Troubleshooting

### Branch Protection Issues

**semantic-release fails with "Protected branch update failed" or "SEMANTIC_RELEASE_TOKEN secret not found":**

**Cause**: semantic-release requires a Personal Access Token (PAT) to bypass branch protection with required status checks.

**Solution**: Follow the complete GitHub repository setup guide in the main README, which includes:
- Creating a Personal Access Token (PAT)
- Configuring branch protection with required status checks
- Setting up the PAT as a GitHub Secret

See: [GitHub Repository Setup in README.md](../README.md#github-repository-setup)

**Why PAT is required**:
- `GITHUB_TOKEN` (default) cannot bypass required status checks
- PAT has elevated permissions when `enforce_admins: false`
- This allows semantic-release to push version commits while PRs still require checks to pass
- Tests run before semantic-release in the same workflow via `needs:` dependency

### Version Not Bumping

**Cause**: Commits don't follow conventional format or contain non-release types

**Solution**: 
- Verify commit messages follow `type(scope): subject` format
- Check for release-worthy types (`feat`, `fix`, etc.)
- Ensure `[skip ci]` is not in commit message
- Review GitHub Actions logs

### Files Out of Sync

**Cause**: Manual version edits or failed sync

**Solution**:
```bash
make version-sync VERSION=1.2.3
git add -A
git commit -m "chore: sync version files"
```

### Commitlint Failures

**Cause**: Invalid commit message format

**Solution**:
```bash
# Reword last commit
git commit --amend

# Interactive rebase for multiple commits
git rebase -i HEAD~3

# Update PR title to match conventional format
```

### Release Blocked

**Cause**: Tests failing in release workflow

**Solution**:
- Check release.yml workflow logs (integrated test jobs)
- Tests run in parallel: backend, frontend, docker
- Fix failing test and push again
- Release automatically runs after all tests pass

### Dependabot Issues

**Dependabot PRs merge immediately without waiting for tests:**

**Cause**: No required status checks configured in branch protection

**Solution**: Ensure branch protection has required status checks enabled (see [README.md GitHub Setup](../README.md#3-configure-branch-protection-rules))

**Dependabot PRs don't auto-merge:**

**Cause**: Missing configuration or checks not passing

**Solution**:
- Ensure "Allow auto-merge" is enabled in repository settings
- Verify all 4 required tests are configured in branch protection
- Check that tests are passing on the PR (green checkmarks)
- Confirm auto-merge workflow ran successfully

## Configuration Files

- **.releaserc.json** - semantic-release configuration
- **.commitlintrc.json** - Commit message validation rules
- **.github/workflows/release.yml** - Release automation workflow
- **.github/workflows/commitlint.yml** - PR commit validation
- **VERSION** - Current version number
- **CHANGELOG.md** - Auto-generated release history

## Examples

### Feature Development

```bash
# Start feature branch
git checkout -b feature/polygon-tool

# Commit with conventional format
git commit -m "feat(canvas): implement polygon tool"
git commit -m "test(canvas): add polygon tests"
git commit -m "docs(canvas): document polygon usage"

# Create PR with conventional title
# PR Title: "feat(canvas): add polygon drawing tool"

# After merge to main:
# - semantic-release bumps MINOR version (1.2.3 → 1.3.0)
# - CHANGELOG.md updated
# - GitHub release created
```

### Hotfix

```bash
# Create hotfix branch
git checkout -b hotfix/token-expiry main

# Fix and commit
git commit -m "fix(auth): correct token expiration calculation"

# After merge:
# - semantic-release bumps PATCH version (1.3.0 → 1.3.1)
```

### Breaking Change

```bash
# Feature with breaking change
git commit -m "feat(api): redesign authentication

BREAKING CHANGE: Auth endpoints moved from /api/auth to /api/v2/auth.
Old endpoints removed."

# After merge:
# - semantic-release bumps MAJOR version (1.3.1 → 2.0.0)
```

## Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [semantic-release](https://semantic-release.gitbook.io/)
- [Commitlint](https://commitlint.js.org/)
- [Makefile Commands](../makefile) - Run `make help`

## Support

For issues with versioning:
1. Check GitHub Actions logs: `gh run list --workflow=release.yml`
2. Validate commits locally: `npx commitlint --from HEAD~1 --to HEAD`
3. Review CHANGELOG.md for release history
4. Check version sync: `make version-current`
