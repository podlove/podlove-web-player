---
layout: page
title: "Podcast Network"
category: guides
date: 2013-12-12 10:14:10
redirect_from:
  - /tutorial/podcast-network/
---

There comes a time in the life of every podcaster when she has to admit that one podcast is not enough. A separate channel would be nice, right? There are basically two ways to achieve podcast networks using Podlove Publisher, both have their advantages.

If you are looking for totally separate podcast channels with their own sites, read _Option 1: WordPress Network_. If, on the other hand, you are looking for a lightweight way of separating feeds in a single site, read _Option 2: Category based Feeds_.

## Option 1: WordPress Network

**Advantages**

- manage multiple podcasts in a WordPress Network
- custom themes, domains etc. for each podcast

**How To**

1. Follow the instructions on [WordPress: Create A Network][1] to turn your WordPress setup into a network.
2. _Network Activate_ the Podlove Publisher at `/wp-admin/network/plugins.php` if you want to host a podcast on _every_ site in the network. Otherwise, activate the Podlove Publisher separately for each site.

Optional: Assign custom domains to network sites using the [Domain Mapping Plugin][4].

**Further Reading**

- [WordPress: Create A Network][1]
- [WordPress: Multisite Network Administration][2]

## Option 2: Category based Feeds

**Advantages**

- does not require a WordPress Network
- separate feeds by category but keep one big feed containing everything

**How To**

1. Activate the _Categories_ Publisher module. Go to `Publisher -> Modules` and find the _Metadata_ section.
2. Assign categories to your episodes using the episode forms. 
3. Announce the category feeds on your website. For example: You have the feed `example.com/feed/mp3` and created the categories "weather" and "plants". Then the feeds `example.com/category/weather/feed/mp3` and `example.com/category/plants/feed/mp3` are available now.

Good to know: There are also feeds for arbitrary search terms. `example.com/search/fnord/feed/mp3` is a dynamic feed for episodes mentioning "Fnord".

**Further Reading**

- [WordPress: Feeds][3]

[1]: http://codex.wordpress.org/Create_A_Network
[2]: http://codex.wordpress.org/Multisite_Network_Administration
[3]: http://codex.wordpress.org/WordPress_Feeds
[4]: https://wordpress.org/plugins/wordpress-mu-domain-mapping/