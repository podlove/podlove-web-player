---
layout: page
title: "Shortcodes"
category: reference
date: 2014-12-08 16:30:13
redirect_from:
  - /publisher/shortcodes/
  - /ref/shortcodes.html
---

#### Web Player

`[podlove-episode-web-player]`

#### Feeds

`[podlove-feed-list]`

Lists all discoverable feeds for easy subscription.

#### Episode Archive

`[podlove-episode-list]`

Lists all episodes including their episode image, publication date, title, subtitle and duration chronologically.

#### Downloads

Use these in an episode post:

`[podlove-episode-downloads]`: Display downloads in a dropdown menu.  
`[podlove-episode-downloads style="buttons"]` : Display download buttons for all available formats. 

#### Subscribe Button

`[podlove-podcast-subscribe-button]`

Displays an universal subscribe button for your Podcast.

##### Parameters

- **size:** "small", "medium", "big", "big-logo". Default: "big-logo"
- **width:** "auto" or "". Default: "auto"

#### Contributors

`[podlove-episode-contributor-list]`

Lists all contributors of the current episode. If used on a non-episode page, it lists all existing contributors with at least one contribution to an episode. Requires "Contributors" module.

> **WARNING** `[podlove-contributors]` and `[podlove-contributor-list]` are *deprecated*. Please replace it with a `[podlove-episode-contributor-list]` shortcode if you are using it.

##### Parameters

- **preset:** "table", "list" or "comma separated". Default: "table"
- **title:** Optional table header title. Default: none
- **avatars:** "yes" or "no". Display avatars. Default: "yes"
- **role:** Filter lists by role. Default: "all"
- **roles:** One of "yes", "no". Display role. Default: "no"
- **group:** Filter lists by group. Default: "all"
- **groups:** One of "yes", "no". Display group. Default: "no" 
- **donations** One of "yes", "no". Display donation column. Default: "no"
- **flattr:** "yes" or "no". Display Flattr column. Default: "no"

`[podlove-podcast-contributor-list]`

Lists all contributors configured in `Podlove > Podcast Settings > Contributors`.

`[podlove-global-contributor-list]`

Lists all podcast contributors and shows related episodes.

#### Templates

`[podlove-template template="Template Title"]`

Renders a template. All custom shortcode parameters will be accessible in the template. Please read the [Understanding Templates](/guides/understanding-templates/) for more details.

`[podlove-template template="..." customvariable="foo"]`

##### Parameters

**title:** _(required)_ Title of template to render.  
**autop:** _(optional)_ Wraps blocks of text in p tags. 'yes' or 'no'. Default: 'yes'

