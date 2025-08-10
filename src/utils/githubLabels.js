const path = require("path");
const chalk = require("chalk").default;
const fs = require("fs").promises;
const { getOctokit } = require("./auth");

/**
 * Fetches GitHub labels for a specified repository.
 * @param {string} owner - The repository owner.
 * @param {string} repo - The repository name.
 * @returns {Promise<Array>} Resolves with an array of label objects.
 */
const fetchGitHubLabels = async (owner, repo) => {
  try {
    const octokit = await getOctokit();

    try {
      const { data: existingLabels } =
        await octokit.rest.issues.listLabelsForRepo({
          owner,
          repo,
          per_page: 100, // Fetch up to 100 labels to avoid pagination for most cases
        });
      if (Array.isArray(existingLabels)) {
        return existingLabels;
      } else {
        console.error(
          chalk.red(
            `🚫 Fetched label data is not a valid array: ${JSON.stringify(
              existingLabels
            )}`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(`🚫 Failed to fetch existing labels: ${error.message}`)
      );
    }
  } catch (error) {
    console.error(
      chalk.red(`🚫 Error setting up GitHub labels: ${error.message}`)
    );
  }
};

/**
 * Reads and parses GitHub labels from a local JSON file.
 * @param {string} source_path - The local source path
 * @returns {Promise<Array>} Resolves with an array of label objects.
 */
const fetchLocalGitHubLabels = async (source_path) => {
  const localJsonPath = path.join(__dirname, "..", "templates", source_path);
  console.log(
    chalk.blue(`\n💡 Reading local JSON labels from ${localJsonPath}...`)
  );
  try {
    const fileContent = await fs.readFile(localJsonPath, "utf8");
    const labelsData = JSON.parse(fileContent);
    if (Array.isArray(labelsData)) {
      return labelsData;
    } else {
      console.error(
        chalk.red(
          `🚫 Local label file content is not a valid array: ${localJsonPath}`
        )
      );
    }
  } catch (fileError) {
    console.error(
      chalk.red(
        `🚫 Error reading local JSON labels from ${localJsonPath}: ${fileError.message}`
      )
    );
    throw fileError;
  }
};

/**
 * Creates GitHub labels for a specified repository.
 * @param {string} owner - The repository owner (username or organization).
 * @param {string} repo - The repository name.
 * @param {Array<Object>} labels - An array of label objects { name, color, description }.
 */
const createGitHubLabels = async (owner, repo, labels) => {
  try {
    const octokit = await getOctokit();

    // 1. Fetch and delete existing labels
    console.log(chalk.blue("💡 Checking for and deleting existing labels..."));
    const existingLabels = await fetchGitHubLabels(owner, repo);
    if (existingLabels.length > 0) {
      for (const label of existingLabels) {
        try {
          await octokit.rest.issues.deleteLabel({
            owner,
            repo,
            name: label.name,
          });
        } catch (deleteError) {
          // A 404 error means the label was already deleted by another process or didn't exist.
          // Only log if it's not a 404 to avoid excessive error messages for non-issues.
          if (deleteError.status !== 404) {
            console.error(
              chalk.red(
                `  🚫 Failed to delete label '${label.name}': ${deleteError.message}`
              )
            );
          } else {
            console.log(
              chalk.yellow(
                `  ⚠️ Label '${label.name}' not found, skipping deletion (might have been deleted already).`
              )
            );
          }
        }
      }
    }

    // 2. Create new default labels
    for (const label of labels) {
      try {
        await octokit.rest.issues.createLabel({
          owner,
          repo,
          name: label.name,
          color: label.color,
          description: label.description,
        });
      } catch (error) {
        if (
          error.status === 422 &&
          error.response.data.errors[0].code === "already_exists"
        ) {
          console.log(
            chalk.yellow(`⚠️ Label '${label.name}' already exists, skipping.`)
          );
        } else {
          console.error(
            chalk.red(
              `🚫 Failed to create label '${label.name}': ${error.message}`
            )
          );
        }
      }
    }
    console.log(chalk.green("✅ All specified labels processed."));
  } catch (error) {
    console.error(
      chalk.red(`🚫 Error setting up GitHub labels: ${error.message}`)
    );
  }
};

module.exports = {
  fetchGitHubLabels,
  fetchLocalGitHubLabels,
  createGitHubLabels,
};
