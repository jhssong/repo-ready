const chalk = require("chalk").default;
const { execa } = require("execa");

/**
 * Runs 'git init' if the current directory is not a git repository.
 */
const runGitInit = async () => {
  try {
    await execa("git", ["rev-parse", "--is-inside-work-tree"]);
  } catch (error) {
    console.log(chalk.blue("💡 Initializing Git repository..."));
    try {
      await execa("git", ["init"]);
      console.log(chalk.green("✅ Git repository initialized."));
    } catch (initError) {
      console.error(
        chalk.red(
          `🚫 Failed to initialize Git repository: ${initError.message}`
        )
      );
    }
  }
};

module.exports = { runGitInit };
