const path = require("path");
const chalk = require("chalk").default;
const { execa } = require("execa");

/**
 * Configure Git to use the '.githooks' directory for hooks by setting core.hooksPath.
 */
const setGitHooksPath = async () => {
  const githooksDir = path.join(process.cwd(), ".githooks");

  try {
    await execa("git", ["config", "core.hooksPath", githooksDir]);
    console.log(chalk.green(`✅ Git hooks path set to: ${githooksDir}`));
  } catch (error) {
    console.error(
      chalk.red(`🚫 Failed to set git hooks path: ${error.message}`)
    );
  }
};

/**
 * Make a Git hook file executable.
 * @param {string} localDestPath - Path to the target Git hook file.
 */
const setGitHookExecPermission = async (localDestPath) => {
  try {
    await execa("chmod", ["+x", localDestPath]);
    console.log(
      chalk.green(`✅ Made ${path.basename(localDestPath)} executable.`)
    );
  } catch (error) {
    console.error(
      chalk.red(
        `🚫 Failed to set execute permission for ${path.basename(
          localDestPath
        )}: ${error.message}`
      )
    );
  }
};

module.exports = { setGitHooksPath, setGitHookExecPermission };
