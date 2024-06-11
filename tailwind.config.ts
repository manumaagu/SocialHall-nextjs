import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modals/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      'custom-purple': '#CCB8CC',
      'custom-purple-dark': '#5A4BAD',
      'custom-purple-dark-hover': '#463893',
      'custom-grey': '#DADADA',
      'custom-grey-disabled': '#E9ECEF',
      'custom-blue': '#1DA1F2',
      'custom-blue-disabled': '#B3D7F9',
      'blue': '#1fb6ff',
      'purple': '#7e5bef',
      'pink': '#ff49db',
      'orange': '#ff7849',
      'green': '#13ce66',
      'yellow': '#ffc82c',
      'gray-dark': '#273444',
      'gray': '#8492a6',
      'gray-light': '#f5f5f5',
      'white': '#ffffff',
      'black': '#000000',
      'black-light': '#2b2b2b',
      'red': '#ff5e57',
      'red-dark': '#ff1e00',
      'twitter': '#1DA1F2',
      'linkedin': '#0A66C2',
      'youtube': '#FF0000',
    },
    height: {
      "80vh": "80vh",
      "90%": "90%",
      "100%": "100%",
      "26": "100px",
      "screen": "100vh",
    },
    fontFamily: {
      sans: ['Jura'],
      serif: ['Jura'],
    },
    gridTemplateColumns: {
      none: 'none',
      subgrid: 'subgrid',
      1: 'repeat(1, minmax(0, 1fr))',
      2: 'repeat(2, minmax(0, 1fr))',
      3: 'repeat(3, minmax(0, 1fr))',
      4: 'repeat(4, minmax(0, 1fr))',
      5: 'repeat(5, minmax(0, 1fr))',
      6: 'repeat(6, minmax(0, 1fr))',
      7: 'repeat(7, minmax(0, 1fr))',
      8: 'repeat(8, minmax(0, 1fr))',
      9: 'repeat(9, minmax(0, 1fr))',
      10: 'repeat(10, minmax(0, 1fr))',
      11: 'repeat(11, minmax(0, 1fr))',
      12: 'repeat(12, minmax(0, 1fr))',
      'login': '1fr, 3fr',
    },
    margin: ({ theme }) => ({
      auto: 'auto',
      'center': '0 auto',
      'top': '1.75rem',
      ...theme('spacing'),
    }),
    lineClamp: {
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  plugins: [],
};
export default config;
