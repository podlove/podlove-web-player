---
layout: page
title: "Templates"
category: reference
date: 2020-01-27 14:57:06
---

The Publisher comes with existing templates. You can include these in your own templates or use them as inspiration. Embed them by using the Twig `include` keyword, for example: `{% raw %}{% include '@core/shortcode/downloads-select.twig' %}{% endraw %}`

## Core Templates

These templates come with the Podlove Publisher and are always available.

### Downloads (Select)

```jinja
{% raw %}
{# @core/shortcode/downloads-select.twig #}

{% spaceless %}
<form action="#">
 <div class="episode_downloads">
    {% if podcast.setting("tracking", "mode") in ["ptm", "ptm_analytics"] %}
        <input type="hidden" name="ptm_source" value="download" />
        <input type="hidden" name="ptm_context" value="select-button" />
    {% endif %}
    <select name="download_media_file">
    {% for file in episode.files %}
        {% set asset = file.asset %}
        {% if asset.downloadable %}
            <option value="{{ file.id }}" data-raw-url="{{ file.publicUrl("download", "select-show") }}">{{ asset.title }} [{{ file.size|formatBytes }}]</option>
        {% endif %}
    {% endfor %}
    </select>
    <button class="primary">Download</button>
    <button class="secondary">Show URL</button>
 </div>
</form>
{% endspaceless %}
{% endraw %}
```

### Downloads (Buttons)

```jinja
{% raw %}
{# @core/shortcode/downloads-buttons.twig #}

<ul class="episode_download_list">
	{% for file in episode.files %}
	    {% set asset = file.asset %}
	    {% if asset.downloadable %}
			<li>
				<a href="{{ file.publicUrl("download", "buttonlist") }}">{{ asset.title }}<span class="size">{{ file.size|formatBytes }}</span></a>
			</li>
	    {% endif %}
	{% endfor %}
</ul>
{% endraw %}
```

### List of Feeds

```jinja
{% raw %}
{# @core/shortcode/feed-list.twig #}

<table>
	<thead>
    	<tr>
            <th>Feed</th>
        	<th>Enclosure</th>
        </tr>
    </thead>
    <tbody>
    {% for feed in podcast.feeds %}
		{% if feed.discoverable %}
		    <tr>
            	<td>
                    <a href="{{ feed.url }}">{{ feed.title }}</a>
                </td>
                <td>
                    <span title="{{ feed.asset.fileType.mimeType }} ({{ feed.asset.fileType.extension }})">
                        {{ feed.asset.title }}
                    </span>
                </td>
            </tr>
    	{% endif %}
	{% endfor %}
    </tbody>
</table>
{% endraw %}
```

### List of Episodes

```jinja
{% raw %}
{# @core/shortcode/episode-list.twig #}

<table>
    <thead>
        <th></th>
        <th>Date</th>
        <th>Title</th>
        <th>Duration</th>
    </thead>
    <tbody>
    {% for episode in podcast.episodes %}
        <tr class="podcast_archive_element">
            <td class="thumbnail">
                <img src="{{ episode.imageUrlWithFallback }}" width="64" height="64">
            </td>
            <td class="date">
                <span class="release_date">
                    {{ episode.publicationDate }}
                </span>
            </td>
            <td class="title">
                <a href="{{ episode.url }}">
                    <strong>{{ episode.title }}</strong><br>
                    {{ episode.subtitle }}
                </a>
            </td>
            <td class="duration">
                {% set duration = episode.duration %}
                {{ duration.hours }}:{{ duration.minutes|padLeft("0",2) }}:{{ duration.seconds|padLeft("0",2) }}
            </td>
        </tr>
    {% endfor %}
    </tbody>
</table>

<style type="text/css">
.podcast_archive_element .thumbnail {
    width: 64px;
    padding: 5px !important;
}

.podcast_archive_element td {
    vertical-align: top;
}
</style>

{% endraw %}
```

### License

```jinja
{% raw %}
{# @core/license.twig #}

{#
	Include example:
	{% include '@core/license.twig' %}

	You can pass in a license to determine which one is displayed:
	{% include '@core/license.twig' with {'license': podcast.license} %}	
#}
{% if license is not defined %}
	{% if episode is not null and episode.license.valid %}
		{% set license = episode.license %}
	{% else %}
	    {% set license = podcast.license %}
	{% endif %}
{% endif %}

{% if license.valid %}
	{% if license.creativeCommons %}
		<div class="podlove_cc_license">
			<img src="{{ license.imageUrl }}" alt="License" />
			<p>
				This work is licensed under a <a rel="license" href="{{ license.url }}">{{ license.name }}</a>
			</p>
		</div>
	{% else %}
	    This work is licensed under the <a href="{{ license.url }}">{{ license.name }}</a> license.
	{% endif %}
{% else %}
    <div class="podlove_license">
		<p style="color: red;">
			This work is (not yet) licensed, as no license was chosen.
		</p>
    </div>
{% endif %}
{% endraw %}
```

## Contributor Templates

These templates come with the "Contributors" module.

### Avatar

```jinja
{% raw %}
{# @contributors/avatar.twig #}

{#
Display a contributor avatar.

Usage examples:
	{% include '@contributors/avatar.twig' with {'avatar': contributor.avatar} only %}
	{% include '@contributors/avatar.twig' with {'avatar': contributor.avatar, 'size': 150} only %} 
#}
{% set size = size|default(50) %}
<img alt="avatar" src="{{ avatar.url(size) }}" class="avatar avatar-{{ size }} photo" height="{{ size }}" width="{{ size }}" />
{% endraw %}
```

### List of Podcast Contributors

```jinja
{% raw %}
{# @contributors/podcast-contributor-list.twig #}

<table class="podlove-global-contributors">
	{% if title %}
		<thead>
			<tr>
				<th colspan="2">{{ title }}</th>
			</tr>
		</thead>
	{% endif %}
	<tbody>
		{% for contributor in podcast.contributors %}
			{% if contributor.visible %}
				<tr>
					<td rowspan="2" class="avatar-cell" width="60">
						{% include '@contributors/avatar.twig' with {'avatar': contributor.avatar} only %}
					</td>
					<td class="social-cell">
						<strong class="contributor-name">{{ contributor.name }}</strong>
						<div class="social-icons">
							{% for service in contributor.socialServices %}
								<a target="_blank" title="{{ service.title }}" href="{{ service.profileUrl }}">
									<img width="32" height="32" src="{{ service.logoUrl }}" class="podlove-contributor-button" alt="{{ service.title }}" />
								</a>
							{% endfor %}
						</div>
					</td>
				</tr>
				<tr class="episode-row">
					<td class="episodes-cell">
						<ul>
						{% for episode in contributor.episodes %}
							<li>
								<a href="{{ episode.url }}">{{ episode.title }}</a>
							</li>
						{% endfor %}
						</ul>
					</td>
				</tr>
			{% endif %}
		{% endfor %}
	</tbody>
</table>

<script type="text/javascript">
(function ($) {
	$(document).ready(function() {
		$(".podlove-global-contributors .episodes-cell").each(function() {
			var items = $("li", this);


			if (items.length > 5) {
				$("li:gt(4)", this).hide();
				$('<span class="show-all-episodes"><a href="#">… show all episodes</a><span>').insertAfter($("ul", this));
			}
		});

		$(".podlove-global-contributors").on("click", ".show-all-episodes a", function(e) {
			e.preventDefault();

			$(this).closest(".episodes-cell")
				.find("li").show().end()
				.find(".show-all-episodes").hide();
		});
	});
}(jQuery));
</script>

<style type="text/css">
.podlove-global-contributors td {
	vertical-align: top;
	line-height: 1.3em;
}

.podlove-global-contributors .avatar-cell {
	max-width: 100px;
	text-align: center;
}

.podlove-global-contributors td {
	border-top-width: 0px;
}

.podlove-global-contributors .episode-row {
	/*margin-bottom: 10px;*/
}

.podlove-global-contributors td ul {
	margin: 0;
}

.podlove-global-contributors .social-cell li {
	margin: 0;
}

.podlove-global-contributors .episodes-cell {
	padding-top: 0px;
}

.podlove-global-contributors .episodes-cell li {
	display: inline-block;
	margin: 0;
}

.podlove-global-contributors .episodes-cell li a {
	background: #eee;
	padding: 2px 10px;
	line-height: 170%;
	border-radius: 10px;
}

</style>
{% endraw %}
```

### Table of Podcast Contributors

```jinja
{% raw %}
{# @contributors/podcast-contributor-table.twig #}

{% macro iconSrc(icon) %}
	{{ constant("\\Podlove\\PLUGIN_URL") }}/lib/modules/contributors/images/icons/{{ icon }}-128.png
{% endmacro %}

{% macro iconLink(title, icon, href) %}
	<a target="_blank" title="{{ title }}" href="{{ href }}">
		<img width="32" height="32" src="{{ _self.iconSrc(icon) }}" class="podlove-contributor-button" alt="{{ title }}" />
	</a>
{% endmacro %}

<table class="podlove-contributors-table">
	<tbody>
		{% for contributor in podcast.contributors({group: group, role: role, scope: 'podcast'}) %}
			{% if contributor.visible %}
				{% include '@contributors/_contributor-table-row.twig' %}
			{% endif %}
		{% endfor %}
	</tbody>
</table>

{% if flattr == "yes" %}
	{% include '@contributors/_contributor-table-flattr.twig' %}
{% endif %}

{% include '@contributors/_contributor-table-css.twig' %}
{% endraw %}
```

### Episode Contributors (comma separated)

```jinja
{% raw %}
{# @contributors/contributor-comma-separated.twig #}

<span class="podlove-contributors">
	{% for contributor in episode.contributors({group: group, role: role}) %}
		{% if contributor.visible %}
			<span>
				{% if avatars == "yes" %}
					{% include '@contributors/avatar.twig' with {'avatar': contributor.avatar, 'size': 18} only %}
				{% endif %}
				<span class="name">{{ contributor.name }}</span></span>{% if not loop.last %}, {% endif %}
		{% endif %}
	{% endfor %}
</span>
{% endraw %}
```

### Episode Contributors (as list)

```jinja
{% raw %}
{# @contributors/contributor-list.twig #}

<ul class="podlove-contributors">
{% for contributor in episode.contributors({group: group, role: role}) %}
	{% if contributor.visible %}
		<li>
			{% if avatars == "yes" %}
				<span class="avatar">{% include '@contributors/avatar.twig' with {'avatar': contributor.avatar, 'size': 18} only %}</span>
			{% endif %}
			<span class="name">{{ contributor.name }}</span>
		</li>
	{% endif %}
{% endfor %}
</ul>
{% endraw %}
```

### Episode Contributors (as table)

```jinja
{% raw %}
{# @contributors/contributor-table.twig #}

{% set colspan = 2 %}
{% if avatars == "yes"   %}{% set colspan = colspan + 1 %}{% endif %}
{% if groups == "yes"    %}{% set colspan = colspan + 1 %}{% endif %}
{% if roles == "yes"     %}{% set colspan = colspan + 1 %}{% endif %}
{% if donations == "yes" %}{% set colspan = colspan + 1 %}{% endif %}
{% if flattr == "yes"    %}{% set colspan = colspan + 1 %}{% endif %}

<table class="podlove-contributors-table">
	{% if title %}
		<thead>
			<tr>
				<th colspan="{{ colspan }}">{{ title }}</th>
			</tr>
		</thead>
	{% endif %}
	<tbody>
		{% if groupby == "group" %}
			{% for contributorGroup in episode.contributors({groupby: 'group', group: group, role: role}) %}
				<tr>
					<th colspan="{{ colspan }}" class="contributor-group">
						{% if contributorGroup.group %}
							{{ contributorGroup.group.title }}
						{% else %}
							&nbsp;
						{% endif %}
					</th>
				</tr>
				{% for contributor in contributorGroup.contributors %}
					{% if contributor.visible %}
						{% include '@contributors/_contributor-table-row.twig' %}
					{% endif %}
				{% endfor %}
			{% endfor %}
		{% else %}
		    {% for contributor in episode.contributors({group: group, role: role}) %}
		    	{% if contributor.visible %}
		    		{% include '@contributors/_contributor-table-row.twig' %}
		    	{% endif %}
		    {% endfor %}
		{% endif %}
	</tbody>
</table>

{% if flattr == "yes" %}
	{% include '@contributors/_contributor-table-flattr.twig' %}
{% endif %}

{% include '@contributors/_contributor-table-css.twig' %}
{% endraw %}
```

## Social Templates

These templates come with the "Social &amp; Donations" module.

### List of Podcast Donations

```jinja
{% raw %}
{# @social/podcast-donations-list.twig #}

<ul class="podcast_services">
{% for service in podcast.services({category: "donation"}) %}
	<li>
    	<a href="{{ service.profileUrl }}" title="{{ service.description }}">
    		<img src="{{ service.logoUrl }}" width="16" height="16" /> {{ service.title }}
        </a>
    </li>
{% endfor %}
</ul>

<style>
.podcast_services li {
	list-style: none;
}
</style>
{% endraw %}
```

### List of Podcast Social Media Services

```jinja
{% raw %}
{# @social/podcast-social-media-list.twig #}

<ul class="podcast_services">
{% for service in podcast.services({category: "social"}) %}
	<li>
    	<a href="{{ service.profileUrl }}" title="{{ service.description }}">
    		<img src="{{ service.logoUrl }}" width="16" height="16" /> {{ service.title }}
        </a>
    </li>
{% endfor %}
</ul>

<style>
.podcast_services li {
	list-style: none;
}
</style>
{% endraw %}
```
