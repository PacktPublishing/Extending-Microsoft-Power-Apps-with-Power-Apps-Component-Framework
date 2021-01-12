module.exports = {
  verbose: true,
  rootDir: ".",
  testMatch: ["<rootDir>/tests/*.(spec|test).(j|t)s"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
