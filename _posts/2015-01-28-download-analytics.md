---
layout: page
title: "Download Analytics"
category: guides
date: 2013-01-28 18:18:49
---

The Podlove Publisher tracks download intents made by clients. It is only tracked that a download was _started_ but not if it was completed. For brevity, this document will speak of “downloads”. Just be aware that what is tracked are actually only download _intents_. So when you are looking at your data, be aware that the numbers displayed do not represent the actual number of listening users.

## Anatomy of Tracking URLs

The Publisher creates “tracking URLs”. For example, if your media file is this:

`media.example.com/podcast/pod001.m4a`

then a tracking URL might look like that:

`example.com/podlove/file/646/s/feed/c/m4a/pod001.m4a`

Requests on tracking URLs are intercepted by the Publisher, analyzed, and finally redirected to the actual physical file. On to a closer look at the URL components.

**example.com/podlove**`/file/646/s/feed/c/m4a/pod001.m4a`

This is your blog domain and a “podlove” URL prefix so tracking URLs don’t interfere with your blogs pages.

`example.com/podlove`**/file/646**`/s/feed/c/m4a/pod001.m4a`

This identifies the actual file to download.

`example.com/podlove/file/646`**/s/feed/c/m4a**`/pod001.m4a`

These are indicators for the _source_ (s) and _context_ (c) of the Download. This allows you to have separate analytics for downloads from feeds, the web player, etc. 

`example.com/podlove/file/646/s/feed/c/m4a`**/pod001.m4a**

What looks like the file name is purely of decorative nature. It makes the URL easier to read and some command line clients will use that part of the URL to auto-generate a filename. But it is irrelevant for the purpose of tracking.

## Tracking Data

Only real download requests are tracked. In more technical terms: `HEAD` requests are ignored. These are the analyzed and saved values:

### UA (User Agent)

Based on the UA, facts about the client can be derived or guessed; such as: 

- client name (Chrome, Firefox, iTunes, Instacast, …)
- operating system (Android, iOS, Mac, …)
- device (iPhone, Galaxy Nexus, …)

Furthermore, bots can be detected.

### File ID

A reference to the downloaded file is kept. This allows to group tracking data by episode.

### Request ID

The request ID is an artificial compound ID to identify identical requests anonymously. It is a hash from the combined IP address and user agent string.

### Source & Context

Download source & context allows to analyze tracking data by how and where the file was requested. By default, the _sources_ are:

- **download**: a direct download via the website
- **feed**: an automatic download via RSS feeds
- **webplayer**: the episode was played using the player on the website

To further drill down, each source has multiple _contexts_:

- **download**
	- **select-button**: a direct download by clicking a download button
	- **select-show**: the user obtained the URL by revealing it on the website
- for **feed**, the asset is saved (m4a, mp3, ogg, etc.)
- **webplayer**
	- **episode**: the player on the episode page
	- **home**: the player on the home page
	- **website**: the player on any other page

### Geo Location

Based on the IP address and the [GeoLite2 Database by MaxMind](http://www.maxmind.com "GeoLite2 data created by MaxMind") location data is saved.

## Data Cleanup

Before tracking data is presented in the analytics area, it is cleaned up. Cleanup involves the following steps:

- Based on the UA analysis **bots are filtered out**.
- **Duplicate requests are filtered out.** A request is considered a duplicate if it contains
	- the same File ID
	- and the same Request ID
	- and was made within the same hour
- **Pre-Release downloads are filtered out.** They may happen if you test downloads before publishing the episode.