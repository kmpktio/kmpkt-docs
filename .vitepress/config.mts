import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'KmpKt',
  description: 'Modular CQRS, event sourcing, and typed messaging framework for Kotlin, built on compile-time DI.',
  base: process.env.VITEPRESS_BASE ?? '/',
  srcExclude: ['_upstream/**'],
  appearance: 'dark',
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${process.env.VITEPRESS_BASE ?? '/'}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#10B981' }],
  ],

  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },

  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence!;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info.trim() === 'mermaid') {
          const encoded = encodeURIComponent(token.content);
          return `<MermaidDiagram code="${encoded}" />`;
        }
        return defaultFence(tokens, idx, options, env, self);
      };
    },
  },

  themeConfig: {
    siteTitle: false,
    logo: '/favicon.svg',

    search: {
      provider: 'local',
    },

    nav: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/guide/' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
      { text: 'Architecture', link: '/guide/cqrs-and-event-sourcing' },
      { text: 'Modules', link: '/guide/modules' },
      {
        text: 'Examples',
        items: [
          { text: 'Todo CQRS', link: '/examples/todo-cqrs' },
          { text: 'Todo Event Sourced', link: '/examples/todo-event-sourced' },
          { text: 'Messenger', link: '/examples/messenger' },
          { text: 'Modulith', link: '/examples/modulith' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/guide/' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
      {
        text: 'Architecture',
        items: [
          { text: 'CQRS & Event Sourcing', link: '/guide/cqrs-and-event-sourcing' },
          { text: 'Module Guide', link: '/guide/modules' },
        ],
      },
      {
        text: 'Modules',
        collapsed: true,
        items: [
          { text: 'kmpkt-di', link: '/modules/kmpkt-di' },
          { text: 'kmpkt-di-compiler', link: '/modules/kmpkt-di-compiler' },
          { text: 'kmpkt-di-compiler-api', link: '/modules/kmpkt-di-compiler-api' },
          { text: 'kmpkt-di-compiler-plugin', link: '/modules/kmpkt-di-compiler-plugin' },
          { text: 'kmpkt-command-bus', link: '/modules/kmpkt-command-bus' },
          { text: 'kmpkt-query-bus', link: '/modules/kmpkt-query-bus' },
          { text: 'kmpkt-event-bus', link: '/modules/kmpkt-event-bus' },
          { text: 'kmpkt-messenger', link: '/modules/kmpkt-messenger' },
          { text: 'kmpkt-messenger-persistence', link: '/modules/kmpkt-messenger-persistence' },
          { text: 'kmpkt-messenger-outbox-relay', link: '/modules/kmpkt-messenger-outbox-relay' },
          { text: 'kmpkt-messenger-clikt', link: '/modules/kmpkt-messenger-clikt' },
          { text: 'kmpkt-worker', link: '/modules/kmpkt-worker' },
          { text: 'kmpkt-aggregate', link: '/modules/kmpkt-aggregate' },
          { text: 'kmpkt-aggregate-snapshot', link: '/modules/kmpkt-aggregate-snapshot' },
          { text: 'kmpkt-event-store', link: '/modules/kmpkt-event-store' },
          { text: 'kmpkt-policy', link: '/modules/kmpkt-policy' },
          { text: 'kmpkt-projection', link: '/modules/kmpkt-projection' },
          { text: 'kmpkt-persistence', link: '/modules/kmpkt-persistence' },
          { text: 'kmpkt-persistence-jdbc', link: '/modules/kmpkt-persistence-jdbc' },
          { text: 'kmpkt-serialization-kotlinx', link: '/modules/kmpkt-serialization-kotlinx' },
          { text: 'kmpkt-clikt-bridge', link: '/modules/kmpkt-clikt-bridge' },
          { text: 'kmpkt-ktor-bridge', link: '/modules/kmpkt-ktor-bridge' },
          { text: 'kmpkt-resilience', link: '/modules/kmpkt-resilience' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Todo CQRS', link: '/examples/todo-cqrs' },
          { text: 'Todo Event Sourced', link: '/examples/todo-event-sourced' },
          { text: 'Messenger', link: '/examples/messenger' },
          { text: 'Modulith', link: '/examples/modulith' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kmpktio/kmpkt' },
    ],

    footer: {
      message:
        'Released under the <a href="https://github.com/kmpktio/kmpkt/blob/main/LICENSE">MIT License</a> · Copyright © 2026 Michael Petri · <a href="/imprint">Imprint &amp; Privacy</a>',
    },
  },
});
