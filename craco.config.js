// https://stackoverflow.com/a/63385127/2009336
// because CRA is CRAp
const CracoAlias = require("craco-alias");
const path = require('path');
module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        // baseUrl SHOULD be specified
        // plugin does not take it from tsconfig
        baseUrl: "./src",
        /* tsConfigPath should point to the file where "baseUrl" and "paths" 
             are specified*/
        tsConfigPath: "./tsconfig.json",
      },
    },
  ],
  // resolve: {
  //   alias: {
  //     react: path.resolve('./node_modules/react'),
  //   },
  // }
};
