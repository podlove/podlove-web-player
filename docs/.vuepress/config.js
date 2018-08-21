const base = process.env.BASE || ''

module.exports = {
  title: 'VuePress Millidocs',
  description: 'Simple documentation theme featuring Milligram CSS framework',
  theme: 'millidocs',
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['script', { type: 'text/javascript', src: `${base}/embed.js` }],
    ['script', { type: 'text/javascript', src: `${base}/extensions/external-events.js` }]
  ],
  markdown: {
    anchor: {
      permalink: false,
      permalinkBefore: false
    }
  },
  // configureWebpack: {
  //   resolve: {
  //     alias: {
  //       '@assets': resolve('blog', 'assets'),
  //       '@theme': resolve('blog', '.vuepress', 'theme'),
  //       '@styles': resolve('blog', '.vuepress', 'theme', 'styles')
  //     }
  //   }
  // },
}
