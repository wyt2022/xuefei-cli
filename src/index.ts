import { Command } from "commander";
const program = new Command("dawei");
import create from "./command/create";

import { version } from "../package.json";
program.version(version, "-v, --version");
program
  .command("create")
  .description("创建一个新项目")
  .argument("[name]", "项目名称")
  .action(async (name) => {
    create(name);
  });

program.parse();
