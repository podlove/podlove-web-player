---
layout: page
title: "Getting Started"
category: guides
date: 2014-12-08 16:18:19
redirect_from:
  - /publisher/shortcodes/
  - /tut/getting-started.html
---

The WordPress Podlove Podcast Publisher is a workflow-oriented solution for serious podcasters that want to save time and get full control over their Podcast publishing process, their feeds and the integrity of their publication.

<a href="http://wordpress.org/extend/plugins/podlove-podcasting-plugin-for-wordpress/" class="btn btn-primary">Download Podlove Publisher</a>

You need [WordPress][1] running on your web server. Download the [Podlove Podcast Publisher][2] plugin, unzip it, put it into the WordPress plugin directory, and activate it. If you are new to WordPress, you may find the [Installing Plugins][3] instructions helpful.

### Configuring Basics

A *Podlove* entry appears in the menu. Go to `Podlove → Podcast Settings` to start the setup. Fill in the *Description* fields (title, subtitle and summary) for your podcast. Then scroll down to the *Media* section. Here you are asked for an *Upload Location*. What is the upload location?

Publishing episodes and serving files are not necessarily connected. The Publisher focuses on the former while you are still responsible for uploading your media files to a server (which may or may not be identical to the server running WordPress). The Publisher has expectations concerning your files:

**Expectation 1: Assets for an episode share the same file name.** Files related to your episodes are called *Assets*. The Publisher needs to keep track of them, so it introduces the convention that all files for one episode must share the same file name. Let's say you publish an episode using mp3, m4a and a cover image. Your files may look like this:

- ep001.mp3
- ep001.m4a
- ep001.jpg

`ep001` is your *file slug*. Its format is up to you. It may be numeric (`001`), text (`my-first-episode`) or mixed (`ep001`). The only requirement is that it is the same for all assets.

**Expectation 2: All files are in the same directory.** If your first episode is available at `http://www.example.com/ep001.mp3` then your second episode should be available at `http://www.example.com/ep002.mp3` and **not** at `http://www.example.com/foo/ep002.mp3` or `http://foo.example.com/ep002.mp3`.

This directory is your Upload Location. Using the example above, it would be `http://www.example.com/`. Enter it in the settings form and make sure that your files are there. You can fill out the rest of the form but you don't have to. You can always come back later.

Go to the next menu entry, `Podlove → Episode Assets`. As mentioned above, assets are all files related to your episodes. Here you define what kind of files you want to publish. That way the Publisher *knows* about your files and can ensure their existence and validity. Click on *Add New* to create one.

Select the *audio* asset type and one of the file formats you are publishing in, like mp3. You can leave the rest of the form and *Save Changes*. If you have more formats, please add them likewise.

The last step of preparation is setting up a feed for your listeners to subscribe. Go to the next menu entry, `Podlove → Podcast Feeds` and click on *Add New*. Select one of the media file assets you just created, assign a title (example: "MP3 Feed") and an url slug (example: "mp3"). You can ignore the rest and *Save Changes*. If you created multiple formats, you may add the other feeds likewise. You are now ready to publish your first episode!

### Publishing the first Episode

You may have noticed already: There is an *Episodes* menu entry below *Posts*. This is where you manage your episodes. Go to `Episodes → Add New`. Enter a title and copy&paste the following two shortcodes into the content field below:

```
[podlove-web-player]
[podlove-episode-downloads]
```

Scroll down to the *Podcast Episode* box. Find the _Episode Media File Slug_ field. Remember this? In the example above, the slug was `ep001`. If you already have files on your upload location, enter your slug.

The table below contains all your assets. If you setup everything correctly, the Publisher will now have found the correct assets and indicate its satisfaction with one or more green checkmarks. Press _Publish_ — Congratulations! You have published your first episode using the Podlove Publisher!

[1]:    http://wordpress.org/
[2]:    http://wordpress.org/plugins/podlove-podcasting-plugin-for-wordpress/
[3]:    http://codex.wordpress.org/Managing_Plugins#Installing_Plugins