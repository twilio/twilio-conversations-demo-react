import { executors } from "@circleci/circleci-config-sdk";

const nodeExecutor = new executors.DockerExecutor(
  "cimg/node:lts-browsers",
  "medium"
);

export { nodeExecutor };
