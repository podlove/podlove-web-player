const base = process.env.BASE || ''

module.exports = {
  title: 'VuePress Millidocs',
  base,
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
  }
}
