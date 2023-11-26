import { NodePlopAPI } from "plop";

module.exports = function (plop: NodePlopAPI) {
  plop.setGenerator("championClass", {
    description: `Create a new champion class boilerplate`,
    prompts: [
      {
        type: "input",
        name: "championName",
        message:
          "Champion Name; Should correspond to champion ID in the data file",
      },
    ],
    actions: [
      // Creates champion's class file
      {
        type: "add",
        path: "../src/classes/champions/defs/{{championName}}/{{championName}}.ts",
        templateFile: "./championClass.hbs",
      },
      {
        type: "add",
        path: "../src/classes/champions/managers/{{championName}}Manager.ts",
        templateFile: "./championManager.hbs",
      },

      // Adds to big list of exports / enum
      {
        type: "modify",
        path: "../src/classes/champions/index.ts",
        pattern: /(( *)\/\/ PLOPFILE_CHAMP_IMPORT)/g,
        template: `$2import { {{championName}}Manager } from './managers/{{championName}}Manager';\n$1`,
      },
      {
        type: "modify",
        path: "../src/classes/champions/index.ts",
        pattern: /(( *)\/\/ PLOPFILE_CHAMP_NAME)/g,
        template: `$2{{championName}} = '{{championName}}',\n$1`,
      },
      {
        type: "modify",
        path: "../src/classes/champions/index.ts",
        pattern: /(( *)\/\/ PLOPFILE_CHAMP_CLASS)/g,
        template: `$2[ChampionName.{{championName}}]: {{championName}}Manager,\n$1`,
      },
    ],
  });
};
