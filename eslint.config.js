import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "scripts/**/*.ts"],
    rules: {
      // Existing rule and reporter contracts use any and empty lifecycle hooks.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "none",
        caughtErrors: "none",
      }],
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
