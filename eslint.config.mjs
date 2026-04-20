import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src-tauri/target/**",
  ]),
  {
    rules: {
      // This rule flags the common SSR-safe localStorage hydration pattern
      // (reading storage in useEffect after mount to avoid hydration mismatches).
      // That pattern is correct here; the rule is a stylistic preference, not a bug.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
