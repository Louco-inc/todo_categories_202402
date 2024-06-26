import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "main-bg-color": "#F7F8FA",
        "main-color": "#282F72",
        "border-gray": "#ACB4BE",
        "todo-color": "#6598FC",
        "inprogress-color": "#FFB546",
        "done-color": "#757575",
        "dashboard-color": "#F7F8FA",
      },
    },
  },
  plugins: [],
};
export default config;
