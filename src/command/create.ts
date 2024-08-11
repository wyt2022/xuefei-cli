import { input, select } from "@inquirer/prompts";
import { clone } from "../utils/clone";
import path from "path";
import chalk from "chalk";
import fs from "fs-extra";
import log from "../utils/log";
import { name, version } from "../../package.json";
import lodash from "lodash";
import axios, { AxiosResponse } from "axios";

export interface TemplateInfo {
  name: string; // 项目名称
  downloadUrl: string; // 下载地址
  description: string; // 项目描述
  branch: string; // 项目分支
}
// 这里保存了我写好了咱们的之前开发的模板
export const templates: Map<string, TemplateInfo> = new Map([
  [
    "Vite4-Vue3-Typescript-template",
    {
      name: "pc-template",
      downloadUrl: "git@github.com:wyt2022/admin.git",
      description: "Vue3技术栈开发模板",
      branch: "main"
    }
  ],
  [
    "vant-mobile-template",
    {
      name: "vant-template",
      downloadUrl: "git@github.com:wyt2022/admin.git",
      description: "vant技术栈开发模板",
      branch: "main"
    }
  ]
]);
export const isOverwrite = async (fileName: string) => {
  // log.warning(`${fileName} 文件已存在 !`);
  return select({
    message: "是否覆盖原文件: ",
    choices: [
      { name: "覆盖", value: true },
      { name: "取消", value: false }
    ]
  });
};

export const getNpmInfo = async (npmName: string) => {
  const npmUrl = "https://registry.npmjs.org/" + npmName;
  let res = {};
  try {
    res = await axios.get(npmUrl);
  } catch (err) {
    log.error(err as string);
  }
  return res;
};

export const getNpmLatestVersion = async (npmName: string) => {
  // data['dist-tags'].latest 为最新版本号
  const { data } = (await getNpmInfo(npmName)) as AxiosResponse;
  return data["dist-tags"].latest;
};

export const checkVersion = async (name: string, curVersion: string) => {
  const latestVersion = await getNpmLatestVersion(name);
  const need = lodash.gt(latestVersion, curVersion);
  if (need) {
    log.info(
      `检测到 dawei 最新版:${chalk.blueBright(
        latestVersion
      )} 当前版本:${chalk.blueBright(curVersion)} ~`
    );
    log.info(`可使用 ${chalk.yellow("pnpm")} install dawei-cli@latest 更新 ~`);
  }
  return need;
};
export default async function create(prjName?: string) {
  // 我们需要将我们的 map 处理成 @inquirer/prompts select 需要的形式
  // 大家也可以封装成一个方法去处理
  const templateList = [...templates.entries()].map(
    (item: [string, TemplateInfo]) => {
      const [name, info] = item;
      return {
        name,
        value: name,
        description: info.description
      };
    }
  );

  if (!prjName) {
    // 用户没有输入项目名称，那么我们询问一下用户
    prjName = await input({ message: "请输入项目名称" });
  }
  // 如果文件已存在需要让用户判断是否覆盖原文件
  const filePath = path.resolve(process.cwd(), prjName);
  if (fs.existsSync(filePath)) {
    const run = await isOverwrite(prjName);
    if (run) {
      // 删除原文件
      fs.removeSync(filePath);
    } else {
      return;
    }
  }

  await checkVersion(name, version);

  // 选择模板
  const templateName = await select({
    message: "请选择需要初始化的模板:",
    choices: templateList
  });

  // 下载模板
  const gitRepoInfo = templates.get(templateName);
  if (gitRepoInfo) {
    clone(gitRepoInfo.downloadUrl, prjName, ["-b", `${gitRepoInfo.branch}`]);
  } else {
    log.error(`${templateName} 模板不存在`);
  }
}
