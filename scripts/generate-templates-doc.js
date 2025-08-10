const path = require("path");
const fs = require("fs").promises;

/**
 * Generates Markdown content based on the template-sources.json data.
 * @param {Object} sources - Data loaded from template-sources.json.
 * @returns {string} The generated Markdown string.
 */
function generateAvailableTemplatesMarkdown(sources) {
  let markdownContent = `# Available Templates for repo-ready CLI

This document lists the GitHub repositories (and local files) from which you can fetch templates, Git hooks, and labels using the \`repo-ready init\` command. Each entry is identified by a unique \`ID\` for easy selection in the CLI.

---

## How to Use

When you run \`repo-ready init\`, you will be prompted to select which categories (Templates, Git Hooks, GitHub Labels) you want to set up. For each selected category, you will then be asked to choose an \`ID\` from the lists below.

---

## 📄 Templates (\`.github\` folders)

These sets provide common GitHub issue and pull request templates.

| ID | Name | Description | Language | Source Repository | Included Files |
|---|---|---|---|---|---|
`;

  sources.templates.forEach((template) => {
    const sourceRepo = template.repo_info
      ? `\`https://github.com/${template.repo_info.owner}/${template.repo_info.repo}\``
      : "N/A";
    const includedFiles = template.files
      .map((f) => `\`${path.basename(f.local_path)}\``)
      .join(", ");
    const langDisplay = template.lang ? template.lang.toUpperCase() : "N/A";
    markdownContent += `| **${template.id}** | **${template.name}** | ${template.description} | ${langDisplay} | ${sourceRepo} | ${includedFiles} |\n`;
  });

  markdownContent += `
---

## 🪝 Git Hooks (\`.githooks\` folders)

These sets provide \`pre-commit\`, \`pre-push\`, and \`commit-msg\` hooks. Note that \`pre-push\` hooks may have different branch naming conventions.

| ID | Name | Description | Language | Source Repository | Included Hooks |
|---|---|---|---|---|---|
`;

  sources.hooks.forEach((hook) => {
    const sourceRepo = hook.repo_info
      ? `\`https://github.com/${hook.repo_info.owner}/${hook.repo_info.repo}\``
      : "N/A";
    const includedHooks = hook.files
      .map((f) => `\`${path.basename(f.local_path)}\``)
      .join(", ");
    const langDisplay = hook.lang ? hook.lang.toUpperCase() : "N/A";
    markdownContent += `| **${hook.id}** | **${hook.name}** | ${hook.description} | ${langDisplay} | ${sourceRepo} | ${includedHooks} |\n`;
  });

  markdownContent += `
---

## 🏷️ GitHub Labels

These sets provide predefined GitHub labels for your repository. Selecting a set will first **delete all existing labels** in your target repository before adding the new ones.

| ID | Name | Description | Language | Source |
|---|---|---|---|---|
`;

  sources.labels.forEach((label) => {
    let source = "";
    if (label.source_type === "json_url" && label.repo_info) {
      source = `\`https://github.com/${label.repo_info.owner}/${label.repo_info.repo}/labels\``;
    } else if (label.source_type === "json_file" && label.source_path) {
      source = `Local file: \`src/templates/${label.source_path}\``;
    } else {
      source = "N/A";
    }
    const langDisplay = label.lang ? label.lang.toUpperCase() : "N/A";
    markdownContent += `| **${label.id}** | **${label.name}** | ${label.description} | ${langDisplay} | ${source} |\n`;
  });

  markdownContent += `
---

## Extending This List

You can extend this list by editing the \`src/config/template-sources.json\` file in your \`repo-ready\` CLI's installation directory. Just add new JSON objects to the respective \`templates\`, \`hooks\`, or \`labels\` arrays following the existing structure. After editing, remember to run \`npm link\` in the \`repo-ready\` project directory to update your global CLI.
`;
  return markdownContent;
}

/**
 * Main function: reads template-sources.json and generates the Markdown document.
 */
async function main() {
  const configPath = path.join(
    __dirname,
    "..",
    "src",
    "config",
    "template-sources.json"
  );
  const outputPath = path.join(
    __dirname,
    "..",
    "src",
    "config",
    "AVAILABLE_TEMPLATES.md"
  );

  try {
    const configContent = await fs.readFile(configPath, "utf8");
    const templateSources = JSON.parse(configContent);
    const generatedMarkdown =
      generateAvailableTemplatesMarkdown(templateSources);

    let existingContent = "";
    try {
      existingContent = await fs.readFile(outputPath, "utf8");
    } catch (readError) {
      console.log("AVAILABLE_TEMPLATES.md does not exist, creating it.");
    }

    if (existingContent !== generatedMarkdown) {
      await fs.writeFile(outputPath, generatedMarkdown, "utf8");
      console.log("✅ AVAILABLE_TEMPLATES.md updated successfully.");
      // Inform GitHub Actions about file changes (using output variable)
      console.log("::set-output name=files_changed::true");
    } else {
      console.log(
        "ℹ️ AVAILABLE_TEMPLATES.md is already up-to-date. No changes needed."
      );
      console.log("::set-output name=files_changed::false");
    }
  } catch (error) {
    console.error(
      `🚫 Error generating or writing AVAILABLE_TEMPLATES.md: ${error.message}`
    );
    process.exit(1);
  }
}

// Execute the main function
main();
