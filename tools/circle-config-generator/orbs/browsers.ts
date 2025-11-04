import { orb, parameters, types } from "@circleci/circleci-config-sdk";

const browsersOrb = new orb.OrbImport(
  "browser-tools",
  "circleci",
  "browser-tools",
  "2.3.2"
);

browsersOrb.commands.install_chrome = new orb.OrbRef(
  "install_chrome",
  new parameters.CustomParametersList<types.parameter.literals.CommandParameterLiteral>(
    [
      new parameters.CustomParameter<types.parameter.literals.CommandParameterLiteral>(
        "chrome_version",
        "string"
      ),
    ]
  ),
  browsersOrb
);

browsersOrb.commands.install_chromedriver = new orb.OrbRef(
  "install_chromedriver",
  new parameters.CustomParametersList<types.parameter.literals.CommandParameterLiteral>(
    []
  ),
  browsersOrb
);

export { browsersOrb };
