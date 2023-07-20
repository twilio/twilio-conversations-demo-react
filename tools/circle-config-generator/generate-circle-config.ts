import { Config, Workflow } from "@circleci/circleci-config-sdk";

import { writeFileSync } from "fs";
import { runAutomationTests } from "./jobs";
import { browsersOrb } from "./orbs/browsers";

const config = new Config();
config.importOrb(browsersOrb);

const workflow = new Workflow("workflow");

workflow.addJob(runAutomationTests(config), {
  context: ["rtd-react-demo-testing"],
});

config.addWorkflow(workflow);

const generatedFile = config.stringify();
console.log(generatedFile);

writeFileSync(`${__dirname}/../../dynamicConfig.yml`, generatedFile);
