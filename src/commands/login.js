const chalk = require("chalk").default;
const { startOAuthFlow, getToken } = require("../utils/auth");

/**
 * Handles the 'login' command to authenticate with GitHub.
 */
const loginCommand = async () => {
  const existingToken = await getToken();

  if (existingToken) {
    console.log(chalk.yellow("💡 You are already logged in to GitHub."));
    return;
  }

  try {
    await startOAuthFlow();
    console.log(
      chalk.green(
        "✅ Successfully logged in to GitHub! You can now run other commands."
      )
    );
  } catch (error) {
    console.error(chalk.red(`🚫 GitHub login failed: ${error.message}`));
    process.exit(1);
  }
};

module.exports = loginCommand;
