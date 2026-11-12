# Security controls for external contributions

This document describes the automated controls that apply to pull requests from developers who are not members of the RootstockCollective organization, and how maintainers operate them. Contributor-facing rules are in the contribution guide that maintainers share with each external contributor.

## Overview

| Control | When it runs | Where it lives |
|---|---|---|
| Automatic checks | Every pull request | `.github/workflows/pr-security-checks.yml` |
| Security validation | When a maintainer triggers it for a pull request | `.github/workflows/security-validation.yml` |

Two principles apply to both:

- **Pull request content is data.** The security validation never installs dependencies or runs code from the pull request. The job that reads the pull request holds a read-only token and no secrets, and the job that writes the comment and the status never checks out the pull request.
- **Validation is bound to a commit.** The result of the security validation is attached to the exact commit that was validated. A new push to the pull request requires a new validation.

These controls complement the checks that already run in this repository: CodeQL, Dependency Review, OpenSSF Scorecard, Dependabot, lint, type check, build, unit tests and end-to-end tests.

## Automatic checks on every pull request

Workflow: `.github/workflows/pr-security-checks.yml`. Trigger: `pull_request`. It runs for internal and external pull requests with a read-only token and no secrets.

| Job | What it does | Result |
|---|---|---|
| `policy` | Classifies the changed files against the path policy and checks the target branch | Fails if a fork pull request targets a branch other than `develop` or changes a `forbidden` path. `review_required` paths are listed in the job summary |
| `lockfile` | Compares `package-lock.json` with the base branch and checks every new or changed package against the npm registry (`lockfile_diff.py`) | Same rules as the lockfile check of the security validation, described below |
| `secrets` | Runs TruffleHog over the commits of the pull request | Fails if it finds a credential that is live or whose status it cannot determine |
| `workflows` | Runs zizmor over `.github/` on the base and on the pull request (`zizmor_report.py`) | Fails on high-severity findings in workflow code that the pull request adds or changes |
| `semgrep` | Runs the project rules in `.github/semgrep/` with the base commit as baseline, so only findings introduced by the pull request count | Fails on rules of severity `ERROR` |

The path policy is the file `.github/security/paths-policy.json`. It has two lists: `forbidden`, for paths maintained only by the team, and `review_required`, for paths that an external contributor may change and that a maintainer reviews change by change.

## Security validation

Workflow: `.github/workflows/security-validation.yml`.

**Triggers.** A maintainer starts it with `workflow_dispatch` and the pull request number. For pull requests whose branch lives in this repository it also runs automatically on `pull_request`. For pull requests from forks the automatic run stops at the first job with a message, and the validation only happens when a maintainer dispatches it.

**Output.** One comment on the pull request, updated in place on each run, and one commit status named `security-validation` on the validated commit. The status is `success` when no check reports `fail`.

### Jobs

| Job | Permissions | What it does |
|---|---|---|
| `resolve` | `pull-requests: read`, `statuses: write` | Reads the head and base commits of the pull request and sets the status to pending |
| `analyze` | `contents: read` | Installs the tools, then checks out the pull request as data and runs the checks listed below. It publishes a digest of its results |
| `report` | `pull-requests: write`, `statuses: write` | Verifies the digest, assembles the results, sets the final status and posts the comment. It does not check out pull request code |

`analyze` verifies that the checked-out commit matches the commit recorded by `resolve`. It takes the scripts, the path policy and the Semgrep rules from the base branch, installs its tools before the pull request is on disk, and keeps everything outside the pull request checkout. If `analyze` does not finish, or the results that `report` receives do not match the digest, the verdict is `fail`.

### Checks

| Check | Tool | Result |
|---|---|---|
| Path policy | `check_paths.py` | For a fork, `fail` if it changes a `forbidden` path, adds a symbolic link or submodule, uses file names with control characters, changes a non-media file that git treats as binary, or targets a branch other than `develop`. `warn` when `review_required` paths change. Renames count as a deletion plus an addition |
| Lockfile | `lockfile_diff.py` | `fail` unless each new or changed entry is the tarball and integrity that the npm registry publishes for that name and version. Also `fail` on a new install script, a `link` entry, a bundled entry that its parent package does not bundle, an alias that no published `package.json` declares, or the presence of `npm-shrinkwrap.json`. For a fork, also `fail` when the install-time scripts of the root `package.json` change or when a package ships other packages inside it; for internal pull requests these are `warn`. `warn` on new packages, declared aliases, changed packages that run an install script, and command names declared by more than one package |
| npm audit | `npm audit` on the base and head lockfiles, without installing (`npm_audit_report.py`) | `fail` if the pull request brings in an advisory of severity high or critical that the base branch does not have; `warn` for moderate or low, and when it adds installed copies of a package with an advisory the base already has |
| Semgrep | Project rules in `.github/semgrep/` plus the registry rulesets `p/typescript`, `p/react`, `p/nodejs`, `p/secrets`, with the base commit as baseline. Inline suppressions and ignore files are not honoured | `fail` on blocking findings and when the scan does not complete; `warn` on other findings and on files that could not be fully analysed |
| Constants in the diff | `diff_sensitive_tokens.py` | `warn` listing the contract addresses, URLs, chain IDs and long encoded literals it recognises among the added and removed lines, for the reviewer to confirm. It is a reading aid, not a complete inventory |
| Secrets | TruffleHog | `fail` if it finds a credential that is live or whose status it cannot determine |
| Workflow audit | zizmor on the base and on the pull request (`zizmor_report.py`). Inline suppressions and ignore files are not honoured | `fail` on high-severity findings in workflow code that the pull request adds or changes |

Each check writes a fragment whose first line is `STATUS: pass|warn|fail`. `assemble_report.py` merges the fragments into the comment and computes the verdict. A check that produces no fragment counts as `fail`. Text taken from the pull request (file names, URLs, package names) is escaped before it enters the report.

### Project Semgrep rules

`.github/semgrep/dapp-security.yml` contains rules specific to this application. They cover token approvals, wallet and chain requests, message signing, dynamic code loading, HTML rendering, process execution, URL schemes, contract address literals and environment variable exposure. Rules of severity `ERROR` block the pull request in both workflows. Rules of severity `WARNING` appear in the security validation report for the maintainer to confirm.

## Maintainer procedure

1. An external pull request arrives against `develop`. Read the description and decide whether the change is wanted.
2. Wait for the automatic checks. If `policy` fails, ask the author to remove the changes to `forbidden` paths.
3. Review the diff. The summary of the `policy` job lists the `review_required` paths that changed.
4. Go to Actions > Security validation > Run workflow and enter the pull request number.
5. Read the report comment. Confirm each `warn` item against the pull request description. Ask the author to fix every `fail` item.
6. Merge when the report for the latest commit has no `fail` items. After a new push, repeat from step 3.

## Maintenance

- New project rules go in `.github/semgrep/dapp-security.yml`. Validate them with `semgrep --validate --config .github/semgrep/`.
- Actions are pinned by commit SHA (updated by Dependabot). Semgrep and zizmor are pinned by version in the workflow `env`.
- New checks go in `analyze` and follow its rules: tools are installed before the pull request checkout, no package manager runs with the pull request as working directory, and manifests and workflows are read from git objects, not from the working tree. `resolve` sets the pending status; only `report` writes the result.
