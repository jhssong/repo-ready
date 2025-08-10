const { Octokit } = require("@octokit/rest");
const chalk = require("chalk").default;
const open = require("open").default;
const http = require("http");
const fs = require("fs").promises;
const path = require("path");

// Define the path to store the GitHub token securely in user's home directory
const TOKEN_FILE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".repo-ready-github-token"
);
const GITHUB_OAUTH_SCOPES = "repo,user";
const LOCAL_SERVER_PORT = 3003;
const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

/**
 * Stores the GitHub access token securely in a file.
 * @param {string} token - The access token to store.
 */
const storeToken = async (token) => {
  try {
    // Ensure the file has restrictive permissions (read/write only for owner)
    await fs.writeFile(TOKEN_FILE_PATH, token, {
      encoding: "utf8",
      mode: 0o600,
    });
    console.log(chalk.green("✅ GitHub token saved successfully."));
  } catch (error) {
    console.error(
      chalk.red(`🚫 Failed to save GitHub token: ${error.message}`)
    );
  }
};

/**
 * Retrieves the GitHub access token from the stored file.
 * @returns {Promise<string | null>} A promise that resolves with the stored access token or null if not found.
 */
const getToken = async () => {
  try {
    const exists = await fs
      .access(TOKEN_FILE_PATH)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      return (await fs.readFile(TOKEN_FILE_PATH, { encoding: "utf8" })).trim();
    }
  } catch (error) {
    console.error(
      chalk.red(`🚫 Failed to read GitHub token: ${error.message}`)
    );
  }
  return null;
};

/**
 * Initiates the GitHub OAuth flow by opening a browser and starting a local server to capture the callback.
 * @returns {Promise<string>} A promise that resolves with the access token upon successful authentication.
 */
const startOAuthFlow = () => {
  return new Promise((resolve, reject) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(
        chalk.red(
          "🚫 GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variables are not set. Please check your .env file."
        )
      );
      return reject(new Error("Missing GitHub client credentials."));
    }

    const redirectUri = `http://localhost:${LOCAL_SERVER_PORT}/callback`;
    const authUrl = `${GITHUB_AUTHORIZE_URL}?client_id=${clientId}&scope=${GITHUB_OAUTH_SCOPES}&redirect_uri=${redirectUri}`;

    console.log(
      chalk.blue("💡 Opening your browser to GitHub for authentication...")
    );
    open(authUrl).catch((err) => {
      console.error(chalk.red(`🚫 Failed to open browser: ${err.message}`));
      reject(err);
    });

    const server = http.createServer(async (req, res) => {
      const requestUrl = new URL(
        req.url,
        `http://localhost:${LOCAL_SERVER_PORT}`
      );

      if (requestUrl.pathname === "/callback") {
        const code = requestUrl.searchParams.get("code");
        if (code) {
          try {
            const accessToken = await exchangeCodeForToken(
              clientId,
              clientSecret,
              code
            );
            await storeToken(accessToken);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(
              "<h1>Authentication successful! You can close this tab.</h1><script>window.close();</script>"
            );
            console.log(chalk.green("✅ GitHub authentication completed."));
            server.close(() => resolve(accessToken));
          } catch (error) {
            res.writeHead(500, { "Content-Type": "text/html" });
            res.end(`<h1>Authentication failed: ${error.message}</h1>`);
            console.error(
              chalk.red(`🚫 Authentication failed: ${error.message}`)
            );
            server.close(() => reject(error));
          }
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authentication failed: No code received.</h1>");
          server.close(() =>
            reject(new Error("No authorization code received."))
          );
        }
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    server.listen(LOCAL_SERVER_PORT, () => {});

    server.on("error", (err) => {
      console.error(chalk.red(`🚫 Local server error: ${err.message}`));
      reject(err);
    });
  });
};

/**
 * Exchanges the authorization code for an access token with GitHub.
 * @param {string} clientId - The GitHub OAuth App Client ID.
 * @param {string} clientSecret - The GitHub OAuth App Client Secret.
 * @param {string} code - The authorization code received from GitHub.
 * @returns {Promise<string>} A promise that resolves with the access token.
 */
const exchangeCodeForToken = async (clientId, clientSecret, code) => {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }),
  });

  const data = await response.json();

  if (response.ok && data.access_token) {
    return data.access_token;
  } else {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to get access token from GitHub."
    );
  }
};

/**
 * Returns an Octokit instance, ensuring authentication.
 * If no token is found, it will initiate the OAuth flow.
 * @returns {Promise<Octokit>} A promise that resolves with an authenticated Octokit instance.
 */
const getOctokit = async () => {
  let token = await getToken();

  if (!token) {
    console.log(chalk.yellow("⚠️ GitHub token not found. Initiating login..."));
    try {
      token = await startOAuthFlow();
    } catch (error) {
      console.error(
        chalk.red(
          "🚫 GitHub login failed. Please try again or check your GitHub App credentials."
        )
      );
      process.exit(1);
    }
  }

  return new Octokit({ auth: token });
};

module.exports = { getOctokit, startOAuthFlow, getToken };
