import { commands, Config, Job, reusable } from "@circleci/circleci-config-sdk";
import { nodeExecutor } from "./executors";
import { browsersOrb } from "./orbs/browsers";

const runAutomationTests = (config: Config) => {
  const job = new Job(`test-webdrive`, nodeExecutor, [
    new commands.Run({
      command:
        "sudo apt-get update; sudo apt-get install -y libu2f-udev libvulkan1",
    }), // prepare chrome installation
    new reusable.ReusedCommand(browsersOrb.commands.install_chrome, {
      "chrome-version": "111.0.5563.146",
    }),
    new reusable.ReusedCommand(browsersOrb.commands.install_chromedriver),
    new commands.Checkout(),
    new commands.Run({ command: "./AutomationTests/scripts/decrypt.sh" }),
    new commands.Run({
      command:
        "echo ${FIREBASE_CONFIG} | base64 -d > public/firebase-config.js",
    }),
    new commands.Run({ command: "yarn" }),
    new commands.Run({ command: "yarn build:wdio" }),
    new commands.Run({
      command:
        "yarn start & > /tmp/react-app.log; yarn test:wdio; cat /tmp/react-app.log",
    }),
  ]);
  config.addJob(job);
  return job;
};

export { runAutomationTests };
