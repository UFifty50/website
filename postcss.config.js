import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssImport from 'postcss-import';

export default ({ctx}) => ({
  plugins: [
    postcssImport,
    tailwind,
    autoprefixer,
  ],
});

