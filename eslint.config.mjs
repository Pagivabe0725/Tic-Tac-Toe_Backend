import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
        { 
          files: ["**/*.{js,mjs,cjs}"],
          plugins: { js }, 
          extends: ["js/recommended"],
          languageOptions: {
             globals: globals.browser 
            } 
          },

        { files: ["**/*.js"],
          languageOptions: {
             sourceType: "commonjs" 
            }, 

            rules:{
              "no-unused-vars": 1,
              "camelcase":1,
              "capitalized-comments":1,
              "arrow-body-style": [2, "always"],
              "no-duplicate-case": 2,
              "no-dupe-else-if": 2,
              "default-case": 2,
              "default-case-last": 2,
              "eqeqeq": [1, "always"],
              "id-denylist": [1, "data", "err", "e", "cb", "callback", "helper", "helperArray", "array",

              ],
              "id-length": [1, { "min": 4 }],
              
            }

          },
]);
