import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";
import createLogger from "progress-estimator";
import chalk from "chalk";
import log from "./log";

const logger = createLogger({
  // 初始化进度条
  spinner: {
    interval: 300, // 变换时间 ms
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"].map((item) =>
      chalk.blue(item)
    ) // 设置加载动画
  }
});

const gitOptions: Partial<SimpleGitOptions> = {
  baseDir: process.cwd(), // 根目录
  binary: "git",
  maxConcurrentProcesses: 6 // 最大并发进程数
};

export const clone = async (
  url: string,
  prjName: string,
  options: string[]
): Promise<any> => {
  const git: SimpleGit = simpleGit(gitOptions);
  try {
    // 开始下载代码并展示预估时间进度条
    await logger(git.clone(url, prjName, options), "代码下载中: ", {
      estimate: 7000
    });

    // 下面就是一些相关的提示
    console.log();
    log.info(chalk.blueBright(`==================================`));
    log.info(chalk.blueBright(`=== 欢迎使用 dawei-cli 脚手架 ===`));
    log.info(chalk.blueBright(`==================================`));
    console.log();

    log.success(`项目创建成功 ${chalk.blueBright(prjName)}`);
    log.info(`执行以下命令启动项目：`);
    log.info(`cd ${chalk.blueBright(prjName)}`);
    log.info(`${chalk.yellow("pnpm")} install`);
    log.info(`${chalk.yellow("pnpm")} run dev`);
  } catch (err: any) {
    log.error("下载失败");
  }
};
