import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Scaf',
      social: {
        github: 'https://github.com/cNikolaou/scaf',
      },
      sidebar: [
        {
          label: 'Get Started',
          items: [
            { label: 'Introduction', link: '/getstarted/introduction/' },
            { label: 'Setup', link: '/getstarted/setup/' },
            { label: 'Run', link: '/getstarted/run/' },
          ],
        },
        {
          label: 'Reference',
          items: [{ label: 'Accounts', link: '/reference/accounts/' }],
        },
      ],
    }),
  ],

  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
