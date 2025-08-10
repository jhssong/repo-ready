# repo-ready

`repo-ready` is a command-line interface (CLI) tool designed to streamline your development workflow by automating initial Git project setup and GitHub integration. It handles complex configurations with just a few commands, allowing developers to quickly focus on writing code.

---

## ✨ Key Features

- **GitHub OAuth Authentication**: Secure and user-friendly GitHub OAuth authentication enables `repo-ready` to access the GitHub API without needing direct management of Personal Access Tokens.
- **Git Hooks Setup**: Easily set up Git Hooks such as `pre-commit`, `pre-push`, and `commit-msg` to enforce code quality and commit conventions.
- **GitHub Templates Copy**: Automatically copy standard templates like issue templates and Pull Request templates into your project's `.github` folder.
- **GitHub Labels Configuration**: Bulk create a default set of labels for your repository. It can also clear all existing labels before adding new ones for a clean start.

---

## 🚀 Installation

Install `repo-ready` globally to use it from any project directory.

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/jhssong/repo-ready.git
    cd repo-ready
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Link the CLI Globally**:
    ```bash
    npm link
    ```
    You can now use the `repo-ready` command from anywhere on your system.

---

## ⚙️ Setup (GitHub OAuth)

`repo-ready` requires GitHub OAuth App configuration to access the GitHub API.

1.  **Register a GitHub OAuth App**:
    - Log in to your GitHub account and navigate to [Developer settings](https://github.com/settings/developers).
    - Click the **OAuth Apps** tab and select **New OAuth App**.
    - Enter the following information:
      - **Application name**: `repo-ready-cli` (or a name of your choice)
      - **Homepage URL**: `https://github.com/jhssong/repo-ready`
      - **Authorization callback URL**: `http://localhost:3000/callback`
    - After registering the app, you will receive a **Client ID** and **Client Secret**.

2.  **.env File Configuration**:
    - Create a `.env` file in the root directory of your `repo-ready` project.
    - Add your received `Client ID` and `Client Secret` as follows:
      ```dotenv
      GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID_HERE
      GITHUB_CLIENT_SECRET=YOUR_GITHUB_CLIENT_SECRET_HERE
      ```

---

## 📝 Usage

### 1. GitHub Login

If you're using `repo-ready` for the first time or your authentication token has expired, you'll need to log in to GitHub.

```bash
repo-ready login
```

Running this command will open your web browser and redirect you to the GitHub authentication page. Once you authorize, the CLI will automatically save your authentication token.

### 2. Initialize Project

`repo-ready` now fetches templates, Git Hooks, and GitHub Labels directly from remote repositories, ensuring you always have access to the latest versions or custom sets.

To see all available options and their sources, refer to the detailed list in [`src/config/AVAILABLE_TEMPLATES.md`](src/config/AVAILABLE_TEMPLATES.md) within the `repo-ready` project directory.

```bash
repo-ready init
```

This command will present interactive prompts allowing you to configure:

- **Template Selection**: Select which items you want to set up (Git Hooks, GitHub Templates, and/or GitHub Labels) by choosing an ID from the available remote options.
- **Git Hook Customization**: If `Git Hooks` are selected, you'll be guided through options like branch naming conventions (e.g., Jira-style).
- **GitHub Labels Configuration**: If `GitHub Labels` are selected, you'll provide the owner and repository name for which the labels should be created.

---

## 🤝 Contributing

`repo-ready` is an open-source project, and your contributions are always welcome! Whether it's bug reports, feature suggestions, or code improvements, any form of contribution is appreciated.

---

## 📄 License

This project is distributed under the MIT License. See the `LICENSE` file for more details.
