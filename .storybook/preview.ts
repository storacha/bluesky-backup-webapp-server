import type { Preview } from '@storybook/react'
import '../src/app/globals.css'; // replace with the name of your tailwind css file
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;