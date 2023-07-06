import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      head: [
        {
          tag: 'script',
          content: `
          <!-- Google tag (gtag.js) -->
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-Q3NQ96M6PB"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Q3NQ96M6PB');
          </script>
          `,
        },
      ],
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
          items: [
            { label: 'Accounts', link: '/reference/accounts/' },
            { label: 'Local Sui Network', link: '/reference/localnetwork/' },
            { label: 'Configuration', link: '/reference/configuration/' },
            { label: 'Scaf Functions', link: '/reference/functions/' },
          ],
        },
      ],
    }),
  ],

  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
