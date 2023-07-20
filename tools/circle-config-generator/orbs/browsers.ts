import { orb, parameters, types } from "@circleci/circleci-config-sdk";

const browsersOrb = new orb.OrbImport(
  "browser-tools",
  "circleci",
  "browser-tools",
  "volatile"
);

browsersOrb.commands.install_chrome = new orb.OrbRef(
  "install-chrome",
  new parameters.CustomParametersList<types.parameter.literals.CommandParameterLiteral>(
    [
      new parameters.CustomParameter<types.parameter.literals.CommandParameterLiteral>(
        "chrome-version",
        "string"
      ),
    ]
  ),
  browsersOrb
);

browsersOrb.commands.install_chromedriver = new orb.OrbRef(
  "install-chromedriver",
  new parameters.CustomParametersList<types.parameter.literals.CommandParameterLiteral>(
    []
  ),
  browsersOrb
);

export { browsersOrb };
