const chalk = require("chalk").default;
const { getOctokit } = require("./auth");
const fs = require("fs").promises;
const path = require("path");

/**
 * Fetches contents of a file or directory from a remote GitHub repository and copies them to the local project.
 * @param {Object} repoInfo - Object containing owner, repo, branch.
 * @param {string} remotePath - Path to the file/directory in the remote repo (e.g., '.github/PULL_REQUEST_TEMPLATE.md', '.githooks/pre-commit').
 * @param {string} localDestPath - Local destination path for the copied content (e.g., '.github/PULL_REQUEST_TEMPLATE.md', '.githooks/pre-commit').
 */
const fetchAndCopyRepoContents = async (
  repoInfo,
  remotePath,
  localDestPath
) => {
  const { owner, repo, branch } = repoInfo;
  const octokit = await getOctokit();

  console.log(
    chalk.blue(
      `\n💡 Fetching ${remotePath} from ${owner}/${repo} (${branch} branch)...`
    )
  );

  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: remotePath,
      ref: branch,
    });
    const contents = response.data;

    // Ensure the local destination directory exists for the file
    await fs.mkdir(path.dirname(localDestPath), { recursive: true });

    if (Array.isArray(contents)) {
      // It's a directory listing (shouldn't happen with single file fetch but for robustness)
      console.warn(
        chalk.yellow(
          `⚠️ Warning: Expected a single file, but received directory listing for ${remotePath}. Skipping recursive copy.`
        )
      );
      // For this use case, we are assuming direct file paths are given.
    } else if (contents.type === "file") {
      // It's a single file
      const fileContent = Buffer.from(contents.content, "base64").toString(
        "utf8"
      );
      await fs.writeFile(localDestPath, fileContent, "utf8");
      console.log(
        chalk.green(`✅ Copied remote file: ${remotePath} to ${localDestPath}`)
      );
    } else {
      console.error(
        chalk.red(
          `🚫 Unexpected content type for ${remotePath}: ${contents.type}`
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red(
        `🚫 Error fetching remote contents from ${owner}/${repo}/${remotePath}: ${error.message}`
      )
    );
    if (error.status === 404) {
      console.error(
        chalk.red(
          `   Ensure the path '${remotePath}' exists in the remote repository's '${branch}' branch.`
        )
      );
    }
    throw error;
  }
};

module.exports = { fetchAndCopyRepoContents };
