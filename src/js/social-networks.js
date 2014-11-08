var SocialNetwork = require('./social-network')
  , socialNetworks = {
  twitter: new SocialNetwork({
    icon: 'twitter',
    title: 'Twitter',
    profileUrl: 'https://twitter.com/',
    shareUrl: 'share?text=$text$&url=$url$'
  }),

  flattr: new SocialNetwork({
    icon: 'flattr',
    title: 'Flattr',
    profileUrl: 'https://flattr.com/',
    shareUrl: 'share?text=$text$&url=$url$'
  }),

  facebook: new SocialNetwork({
    icon: 'facebook',
    title: 'Facebook',
    profileUrl: 'https://facebook.com/',
    shareUrl: 'share.php?t=$text$&u=$url$'
  }),

  adn: new SocialNetwork({
    icon: 'adn-alpha',
    title: 'App.net',
    profileUrl: 'https://alpha.app.net/',
    shareUrl: 'intent/post?text=$text$'
  }),

  soundcloud: new SocialNetwork({
    icon: 'soundcloud',
    title: 'SoundCloud',
    profileUrl: 'https://soundcloud.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),

  instagram: new SocialNetwork({
    icon: 'instagram',
    title: 'Instagram',
    profileUrl: 'http://instagram.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),

  tumblr: new SocialNetwork({
    icon: 'tumblr',
    title: 'Tumblr',
    profileUrl: 'https://www.tumblr.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),

  email: new SocialNetwork({
    icon: 'mail',
    title: 'E-Mail',
    profileUrl: 'mailto:',
    shareUrl: '?subject=$title$&body=$text$'
  })
/*
  ,googleplus: new SocialNetwork({
    icon: 'google',
    title: 'Google+',
    profileUrl: 'https://plus.google.com/',
    shareUrl: 'share?title=$title$&url=$url$'
  }),
*/
};

/**
 * returns the service registered with the given name
 * @param {string} serviceName
 * @returns {SocialNetwork}
 */
function getService (serviceName) {
  var service = socialNetworks[serviceName];
  if (!service) {
    console.error('Unknown service', serviceName);
  }
  return service;
}

module.exports = {
  get: getService
};
