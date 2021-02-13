/**
 * This is the workaround for CSS file import in json-reactform.
 *
 * More on the error: https://github.com/vercel/next.js/blob/master/errors/css-npm.md
 */

const withTM = require("next-transpile-modules")(["json-reactform"]);

module.exports = withTM();
