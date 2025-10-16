# data-labeling

[![Version](https://img.shields.io/github/v/tag/ptdevhk/data-labeling?label=version)](https://github.com/ptdevhk/data-labeling/releases)
[![Semantic Release](https://img.shields.io/badge/semantic--release-conventional-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Web-based image annotation tool with automated semantic versioning.

## Quick Links

- [Versioning & CI/CD Guide](./docs/VERSIONING.md) - Version management and workflows
- [CHANGELOG](./CHANGELOG.md) - Release history
- [VERSION](./VERSION) - Current version

## Versioning

Automated semantic versioning based on [Conventional Commits](https://www.conventionalcommits.org/).

```bash
# Check version
make version-current

# Manual bump
make version-bump TYPE=patch   # 0.1.0 → 0.1.1
make version-bump TYPE=minor   # 0.1.0 → 0.2.0
make version-bump TYPE=major   # 0.1.0 → 1.0.0

# Commit format (auto-releases on push to main)
git commit -m "feat(scope): description"    # MINOR bump
git commit -m "fix(scope): description"     # PATCH bump
git commit -m "feat!: breaking change"      # MAJOR bump
```

See [docs/VERSIONING.md](./docs/VERSIONING.md) for complete guide.

## GitHub Repository Setup

After creating a new repository, configure these settings to enable Dependabot auto-merge and semantic-release:

### 1. Enable Auto-Merge Feature

**Via GitHub CLI:**
```bash
gh api -X PATCH repos/ptdevhk/data-labeling -f allow_auto_merge=true
```

**Via GitHub UI:**
1. Go to repository Settings: `https://github.com/ptdevhk/data-labeling/settings`
2. Scroll to "Pull Requests" section
3. ✅ Check "Allow auto-merge"
4. Click "Save changes"

### 2. Create Personal Access Token for semantic-release

**⚠️ Required**: semantic-release needs elevated permissions to bypass branch protection with required status checks.

**Via GitHub Web UI** (Recommended):
1. Go to: https://github.com/settings/tokens/new
2. Token name: `SEMANTIC_RELEASE_TOKEN`
3. Expiration: Choose your preference (90 days, 1 year, or no expiration)
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

**Add as GitHub Secret:**
```bash
gh secret set SEMANTIC_RELEASE_TOKEN
# Paste your PAT when prompted
```

Verify:
```bash
gh secret list
# Should show: SEMANTIC_RELEASE_TOKEN
```

**Why a PAT is needed:**
- `GITHUB_TOKEN` (default) **cannot bypass** required status checks
- Personal Access Token has elevated permissions when `enforce_admins: false`
- This allows semantic-release to push version commits while PRs still require checks

### 3. Configure Branch Protection Rules

**✅ Recommended Configuration** (Works with both semantic-release AND Dependabot):

**Via GitHub CLI:**
```bash
gh api -X PUT repos/ptdevhk/data-labeling/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      {"context": "Validate Commit Messages"},
      {"context": "run-tests (ubuntu-latest, 3.13)"},
      {"context": "run-tests (macos-latest, 3.13)"},
      {"context": "test (313)"}
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
```

**What this configuration provides:**
- ✅ **Dependabot PRs wait for all 4 checks** before auto-merge
- ✅ **semantic-release can push** (bypasses via PAT with `enforce_admins: false`)
- ✅ Prevents force pushes and branch deletion
- ✅ Requires PRs to be up-to-date before merging (`strict: true`)

**How it works:**
1. **For PRs (Dependabot & manual):**
   - All 4 required checks must pass
   - `gh pr merge --auto` waits for green status
   - Auto-merge only triggers when all checks are ✅

2. **For semantic-release (direct push to main):**
   - Uses `SEMANTIC_RELEASE_TOKEN` (PAT) instead of `GITHUB_TOKEN`
   - PAT bypasses required checks when `enforce_admins: false`
   - Tests run BEFORE release via workflow `needs:` dependency
   - Safe because tests already passed

**Via GitHub UI:**
1. Go to: `https://github.com/ptdevhk/data-labeling/settings/branches`
2. Click "Add branch protection rule" (or edit existing)
3. Branch name pattern: `main`
4. **Check these:**
   - ✅ "Require status checks to pass before merging"
     - Select: `Validate Commit Messages`, `run-tests (ubuntu-latest, 3.13)`, `run-tests (macos-latest, 3.13)`, `test (313)`
     - ✅ "Require branches to be up to date before merging"
   - ❌ **DO NOT** check "Require a pull request before merging"
   - ❌ **DO NOT** check "Do not allow bypassing the above settings"
   - ❌ Keep "Allow force pushes" unchecked
   - ❌ Keep "Allow deletions" unchecked
5. Click "Save changes"

### 4. Verify Settings

Check if auto-merge is enabled:
```bash
gh api repos/ptdevhk/data-labeling --jq '.allow_auto_merge'
# Expected output: true
```

Check if PAT secret is configured:
```bash
gh secret list
# Should show: SEMANTIC_RELEASE_TOKEN
```

Check branch protection:
```bash
gh api repos/ptdevhk/data-labeling/branches/main/protection --jq '{
  required_checks: .required_status_checks.checks[].context,
  strict: .required_status_checks.strict,
  pr_reviews: .required_pull_request_reviews,
  enforce_admins: .enforce_admins.enabled,
  allow_force_pushes: .allow_force_pushes.enabled,
  allow_deletions: .allow_deletions.enabled
}'
# Expected: 4 check contexts, strict: true, pr_reviews: null, enforce_admins: false, allow_force_pushes: false, allow_deletions: false
```

### 5. Troubleshooting

**Quick troubleshooting for common issues:**

- **PAT secret not found**: Follow step 2 above to create and configure `SEMANTIC_RELEASE_TOKEN`
- **Branch protection errors**: Verify PAT is configured in `.github/workflows/release.yml`
- **Dependabot not auto-merging**: Ensure required status checks are configured (step 3)
- **Tests not running**: Check verification commands in step 4

**For detailed troubleshooting**, including version bumping issues, commitlint failures, and CI/CD workflow problems, see:
📖 [Complete Troubleshooting Guide in docs/VERSIONING.md](./docs/VERSIONING.md#troubleshooting)

**For workflow architecture and execution flow**, see:
📖 [CI/CD Workflows in docs/VERSIONING.md](./docs/VERSIONING.md#cicd-workflows)
