---
layout: page
title: "Social Profiles"
category: guides
date: 2015-04-23 16:19:19
---

### Modify Your Social Profiles
<figure class="mb">
  <img src="/assets/examples/social-profiles.png" alt="Social Profiles" class="fullwidth-img" />
</figure>

Provide your or your show's social profiles in the info tab of the player.<br>
All social profiles are set in `/src/js/social-networks.js`.<br>

The profile twitter for example is defined like this:

{% highlight html %}
twitter: new SocialNetwork({
  icon: 'twitter',
  title: 'Twitter',
  profileUrl: 'https://twitter.com/',
  shareUrl: 'share?text=$text$&url=$url$'
})
{% endhighlight %}

The complete list of currently available social profiles and their icons:

<dl class="profile-table">
<dl>
  <dt><i class="icon pwp-twitter"></i></dt>
  <dd>twitter</dd>
  <dd>Twitter</dd>
</dl>

<dl>
  <dt><i class="icon pwp-message"></i></dt>
  <dd>message</dd>
  <dd>E-mail</dd>
</dl>

<dl>
  <dt><i class="icon pwp-adn"></i></dt>
  <dd>adn</dd>
  <dd>App.net</dd>
</dl>

<dl>
  <dt><i class="icon pwp-facebook"></i></dt>
  <dd>facebook</dd>
  <dd>Facebook</dd>
</dl>

<dl>
  <dt><i class="icon pwp-google-plus"></i></dt>
  <dd>gplus</dd>
  <dd>Google +</dd>
</dl>

<dl>
  <dt><i class="icon pwp-tumblr"></i></dt>
  <dd>tumblr</dd>
  <dd>Tumblr</dd>
</dl>

<dl>
  <dt><i class="icon pwp-instagram2"></i></dt>
  <dd>instagram</dd>
  <dd>Instagram</dd>
</dl>

<dl>
  <dt><i class="icon pwp-soundcloud"></i></dt>
  <dd>soundcloud</dd>
  <dd>Soundcloud</dd>
</dl>

<dl>
  <dt><i class="icon pwp-flattr"></i></dt>
  <dd>flattr</dd>
  <dd>Flattr</dd>
</dl>
</dl>

#### Metadata

Edit your profile data according to following example and make sure to set the values correctly in single quotation marks.

You will need to edit these two keypairs:<br>
`profile:     'your profile handle goes here'`<br>
`serviceName: 'profile name chosen from available profiles'`

Finally, the profiles are collected in a list with the keyword `profiles` like this:

{% highlight html %}
profiles: [
  {
    serviceName: 'twitter',
    profile: 'podlove_org'
  },
  {
    serviceName: 'flattr',
    profile: 'timpritlove'
  },
  {
    serviceName: 'facebook',
    profile: 'podlove_org'
  },
  {
    serviceName: 'soundcloud',
    profile: 'podlove_org'
  },
  {
    serviceName: 'adn',
    profile: 'podlove'
  },
  {
    serviceName: 'email',
    profile: 'info@podlove.org'
  }
]
{% endhighlight %}
