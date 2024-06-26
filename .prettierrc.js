module.exports = {
  printWidth: 80,
  singleQuote: false,
  semi: true,
  tabWidth: 2,
  trailingComma: "es5",
  jsxBracketSameLine: false,
  arrowParens: "always",
  importOrder: [
    "^react(.*)$",
    "<THIRD_PARTY_MODULES>",
    "^(.*)/generated(.*)$",
    "^lib/(.*)$",
    "^(.+)/lib(.*)$",
    "^modules/(.*)$",
    "^(.+)/modules(.*)$",
    "^hooks/(.*)$",
    "^(.+)/hooks(.*)$",
    "^(.*)/router$",
    "^assets/(.*)$",
    "^(.+)/assets(.*)$",
    "^atom/(.*)$",
    "^(.+)/atom(.*)$",
    "^components/(.*)$",
    "^(.+)/components(.*)$",
    "^pages/(.*)$",
    "^(.+)/pages(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
};
