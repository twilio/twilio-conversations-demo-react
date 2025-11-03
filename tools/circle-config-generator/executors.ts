import { executors } from "@circleci/circleci-config-sdk";

const nodeExecutor = new executors.DockerExecutor(
  "cimg/node:20.19.3-browsers",
  "medium"
);

export { nodeExecutor };
