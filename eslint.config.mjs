import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import nodePlugin from "eslint-plugin-n";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintJs from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ignores: ["dist", "node_modules", "public"],
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      eslintPluginPrettierRecommended,
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "import/no-named-as-default-member": 0,
      "unused-imports/no-unused-vars": 0,
      "@typescript-eslint/no-require-imports": 0,
      "@eslint-react/prefer-shorthand-boolean": "warn",
      "@eslint-react/hooks-extra/no-direct-set-state-in-use-effect": 0,

      "@eslint-react/no-array-index-key": 0,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/ban-ts-comment": 0,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": 0,
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // `react` related packages & side effect imports come first.
            ["^react", "^\\u0000"],
            /*
             * Node.js builtins. You could also generate this regex if you use a `.js` config.
             * For example: `^(${require("module").builtinModules.join("|")})(/|$)`
             */
            [
              "^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)",
            ],
            // Other packages.
            ["^\\w", "^@\\w"],
            // internal package
            [
              "^(@|@assets|assets|@styles|styles|@static|static|@utils|utils|@tools|tools|@hooks|hooks|@pages|pages|@components|components|@component|component|@service|service|@services|services|@constants|@store|store|@types|types|@src|src|@providers|providers|@containers|containers|@layout|layout)(/.*|$)",
            ],
            [
              // Parent imports. Put `..` last.
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              // Other relative imports. Put same-folder imports and `.` last.
              "^\\./(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
            [
              // Image imports.
              "^.+\\.(gif|png|jpg|jpeg|webp|svg)$",
              // Style imports.
              "^.+\\.(sass|scss|less|css)$",
            ],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
        {
          usePrettierrc: true,
        },
      ],
      "jsx-a11y/no-autofocus": 0,
    },
  },
  {
    files: ["**/plugins/*.{ts,js}", "**/electron/**/*.{ts,js}"],
    extends: [nodePlugin.configs["flat/recommended-script"]],
    rules: {
      "n/no-missing-import": 0,
      "n/no-process-exit": 0,
      "n/no-missing-require": [
        "error",
        {
          allowModules: ["electron"],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,cjs,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
