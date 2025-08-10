const inquirer = require("inquirer").default;
const path = require("path");
const chalk = require("chalk").default;
const fs = require("fs").promises;

const { fetchAndCopyRepoContents } = require("../utils/github");
const { runGitInit } = require("../utils/initGit");
const {
  createGitHubLabels,
  fetchGitHubLabels,
  fetchLocalGitHubLabels,
} = require("../utils/githubLabels");
const {
  setGitHooksPath,
  setGitHookExecPermission,
} = require("../utils/gitHooks");

/**
 * Loads the list of remote template sources from the config file.
 * @returns {Object} An object containing arrays of remote template, hook, and label configurations.
 */
const loadTemplateSources = async () => {
  const configPath = path.join(
    __dirname,
    "..",
    "config",
    "template-sources.json"
  );
  try {
    const configContent = await fs.readFile(configPath, "utf8");
    return JSON.parse(configContent);
  } catch (error) {
    console.error(
      chalk.red(`🚫 Error loading template sources config: ${error.message}`)
    );
    console.error(
      chalk.red(
        `Please ensure 'src/config/template-sources.json' exists and is valid.`
      )
    );
    return { templates: [], hooks: [], labels: [] };
  }
};

/**
 * Handles the 'init' command to set up template files, Git hooks, and GitHub labels.
 */
const initCommand = async () => {
  const templateSources = await loadTemplateSources();
  if (
    !templateSources ||
    (templateSources.templates.length === 0 &&
      templateSources.hooks.length === 0 &&
      templateSources.labels.length === 0)
  ) {
    console.log(
      chalk.yellow(
        "No remote template sources configured. Please add entries to src/config/template-sources.json."
      )
    );
    return;
  }

  const mainAnswers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "categoriesToSetup",
      message: "Which categories would you like to set up?",
      choices: [
        {
          name: "Templates (.github)",
          value: "templates",
          disabled:
            templateSources.templates.length === 0
              ? "No templates configured"
              : false,
        },
        {
          name: "Git Hooks (.githooks)",
          value: "hooks",
          disabled:
            templateSources.hooks.length === 0 ? "No hooks configured" : false,
        },
        {
          name: "GitHub Labels",
          value: "labels",
          disabled:
            templateSources.labels.length === 0
              ? "No labels configured"
              : false,
        },
      ],
      default: ["templates", "hooks", "labels"].filter(
        (cat) => templateSources[cat].length > 0
      ),
    },
  ]);

  if (mainAnswers.categoriesToSetup.length === 0) {
    console.log(chalk.yellow("No categories selected for setup. Exiting."));
    return;
  }

  // Initialize Git repository if not already initialized
  await runGitInit();

  for (const category of mainAnswers.categoriesToSetup) {
    let selectedSet = null;
    let categoryList = templateSources[category];

    if (categoryList.length > 0) {
      console.log();
      const { selectedId } = await inquirer.prompt({
        type: "list",
        name: "selectedId",
        message: `Select a ${category} set (enter ID):`,
        choices: categoryList.map((item) => ({
          name: `${item.id} | ${item.name} | ${item.description} ${
            item.lang ? `(${item.lang.toUpperCase()})` : ""
          }`,
          value: item.id,
        })),
        pageSize: 10,
      });
      selectedSet = categoryList.find((item) => item.id === selectedId);
      if (!selectedSet) {
        console.error(
          chalk.red(
            `🚫 Invalid ID for ${category} selected. Skipping this category.`
          )
        );
        continue;
      }
    } else {
      console.log(
        chalk.yellow(
          `⏩ No ${category} sets configured. Skipping this category.`
        )
      );
      continue;
    }

    if (category === "templates" || category === "hooks") {
      // For templates and hooks, iterate through files and fetch/copy them
      console.log(
        chalk.blue(
          `\n💡 Fetching ${category} from ${selectedSet.repo_info.owner}/${selectedSet.repo_info.repo}...`
        )
      );

      // For Git hooks, set core.hooksPath
      if (category === "hooks") await setGitHooksPath();

      for (const file of selectedSet.files) {
        const localDestPath = path.join(process.cwd(), file.local_path);
        try {
          await fetchAndCopyRepoContents(
            selectedSet.repo_info,
            file.remote_path,
            localDestPath
          );

          // For Git hooks, set execute permissions
          if (category === "hooks")
            await setGitHookExecPermission(localDestPath);
        } catch (error) {
          console.error(
            chalk.red(`🚫 Failed to copy ${file.remote_path}: ${error.message}`)
          );
        }
      }
    } else if (category === "labels") {
      const { owner, repo } = await inquirer.prompt([
        {
          type: "input",
          name: "owner",
          message: "GitHub Owner (username or organization name) for labels:",
          validate: (input) => input.length > 0 || "This field is required.",
        },
        {
          type: "input",
          name: "repo",
          message: "Repository name for labels:",
          validate: (input) => input.length > 0 || "This field is required.",
        },
      ]);

      try {
        if (selectedSet.source_type === "json_url") {
          const labelsData = await fetchGitHubLabels(
            selectedSet.repo_info.owner,
            selectedSet.repo_info.repo
          );
          await createGitHubLabels(owner, repo, labelsData);
        } else if (selectedSet.source_type === "json_file") {
          const labelsData = await fetchLocalGitHubLabels(
            selectedSet.source_path
          );
          await createGitHubLabels(owner, repo, labelsData);
        } else {
          console.error(
            chalk.red(
              '🚫 Invalid label source configuration. Expected "json_url" and "source_path".'
            )
          );
        }
      } catch (error) {
        console.error(
          chalk.red(`🚫 Error setting up labels: ${error.message}`)
        );
      }
    }
  }
  console.log(chalk.green("\n🎉 All selected settings completed!"));
};

module.exports = initCommand;
