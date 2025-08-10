# Available Templates for repo-ready CLI

This document lists the GitHub repositories (and local files) from which you can fetch templates, Git hooks, and labels using the `repo-ready init` command. Each entry is identified by a unique `ID` for easy selection in the CLI.

---

## How to Use

When you run `repo-ready init`, you will be prompted to select which categories (Templates, Git Hooks, GitHub Labels) you want to set up. For each selected category, you will then be asked to choose an `ID` from the lists below.

---

## 📄 Templates (`.github` folders)

These sets provide common GitHub issue and pull request templates.

| ID | Name | Description | Language | Source Repository | Included Files |
|---|---|---|---|---|---|
| **1** | **Repo-ready Github Templates** | Default templates for repo-ready | EN | `https://github.com/jhssong/repo-ready` | `feature_request.yml`, `bug_report.yml`, `config.yml`, `PULL_REQUEST_TEMPLATE.md` |

---

## 🪝 Git Hooks (`.githooks` folders)

These sets provide `pre-commit`, `pre-push`, and `commit-msg` hooks. Note that `pre-push` hooks may have different branch naming conventions.

| ID | Name | Description | Language | Source Repository | Included Hooks |
|---|---|---|---|---|---|
| **1** | **Repo-ready Simple Commits Hooks** | Enforce commit message rules, Prettier/ESLint formatting, and simple branch naming | EN | `https://github.com/jhssong/repo-ready` | `commit-msg`, `pre-commit`, `pre-push` |
| **2** | **Repo-ready Conventional Commits Hooks** | Enforce commit message rules, Prettier/ESLint formatting, and conventional branch naming | EN | `https://github.com/jhssong/repo-ready` | `commit-msg`, `pre-commit`, `pre-push` |
| **3** | **Repo-ready Jira-Style Branch Naming Hooks** | Enforce commit message rules, Prettier/ESLint formatting, and Jira-style branch naming | EN | `https://github.com/jhssong/repo-ready` | `commit-msg`, `pre-commit`, `pre-push` |

---

## 🏷️ GitHub Labels

These sets provide predefined GitHub labels for your repository. Selecting a set will first **delete all existing labels** in your target repository before adding the new ones.

| ID | Name | Description | Language | Source |
|---|---|---|---|---|
| **1** | **Repo-ready Labels** | Default labels for repo-ready | EN | `https://github.com/jhssong/repo-ready/labels` |

---

## Extending This List

You can extend this list by editing the `src/config/template-sources.json` file in your `repo-ready` CLI's installation directory. Just add new JSON objects to the respective `templates`, `hooks`, or `labels` arrays following the existing structure. After editing, remember to run `npm link` in the `repo-ready` project directory to update your global CLI.
