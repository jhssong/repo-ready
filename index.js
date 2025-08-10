#! /usr/bin/env node
require("dotenv").config();
const { program } = require("commander");
const chalk = require("chalk").default;
const path = require("path");

// commands
const initCommand = require("./src/commands/init.js");
const loginCommand = require(path.join(__dirname, "src", "commands", "login"));

program
  .name("repo-ready")
  .description(
    chalk.cyan(
      "A CLI tool to automate Git project setup and GitHub interactions."
    )
  )
  .version("1.0.0");

program
  .command("init")
  .description(chalk.green("Sets up Git hooks and template files."))
  .action(initCommand);

program
  .command("login")
  .description(
    chalk.green(
      "Authenticates with GitHub using OAuth to manage access tokens."
    )
  )
  .action(loginCommand);

program.parse(process.argv);
