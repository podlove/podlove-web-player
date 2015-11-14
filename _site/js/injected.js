var pwp_metadata = {};
pwp_metadata['inject'] = {
    sources: [
        {
            src: "/bower_components/podlove-web-player/dist/examples/which-format/podlove-test-track.mp4",
            type: "audio/mp4"
        },
        {
            src:"/bower_components/podlove-web-player/dist/examples/which-format/podlove-test-track.mp3",
            type:"audio/mpeg"
        },
        {
            src:"/bower_components/podlove-web-player/dist/examples/which-format/podlove-test-track.ogg",
            type:"audio/ogg; codecs=vorbis"
        },
        {
            src:"/bower_components/podlove-web-player/dist/examples/which-format/podlove-test-track.opus",
            type:"audio/ogg; codecs=opus"
        }
    ],
    poster: '/bower_components/podlove-web-player/dist/examples/coverimage.png',
    title: 'PWP001 - Which format plays?',
    permalink: '/bower_components/podlove-web-player/dist/examples/which-format/index.html',
    subtitle: 'The Format your client chooses to play first will be told when you play this track.',
    publicationDate: '2004-02-12T15:19:21+00:00',
    "license": {
        "name": "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Germany License",
        "url": "http:\/\/creativecommons.org\/licenses\/by-nc-sa\/3.0\/de\/deed.en"
    },
    chapters: [
        {
            start: '00:00:00.000',
            title: 'Chapter One'
        },
        {
            start: '00:00:00.500',
            title: 'Chapter Two',
            image: '/bower_components/podlove-web-player/dist/examples/coverimage-red.png'
        },
        {
            start: '00:00:01.500',
            title: 'Chapter Three',
            image: '/bower_components/podlove-web-player/dist/examples/coverimage-green.png',
            href: 'http://wordpress.org/plugins/podlove-podcasting-plugin-for-wordpress/'
        },
        {
            start: '00:00:02.000',
            title: 'Chapter Four',
            href: 'http://metaebene.me/'
        }
    ],
    summary: '<p>Summary and even links <a href="https://github.com/podlove/podlove-web-player">Podlove Web Player</a>Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Maecenas sed diam eget risus varius blandit sit amet non magna. Maecenas sed diam eget risus varius blandit sit amet non magna.</p><p>Nullam id dolor id nibh ultricies vehicula ut id elit. Nulla vitae elit libero, a pharetra augue. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Cras mattis consectetur purus sit amet fermentum. Nullam id dolor id nibh ultricies vehicula ut id elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.</p>',
    downloads: [{
        name: 'MP3', size: 58725,
        url: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.mp3',
        dlurl: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.mp3'
    }, {
        name: 'ogg', size: 50494,
        url: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.ogg',
        dlurl: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.mp3'
    }, {
        name: 'MP4', size: 78328,
        url: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.mp4',
        dlurl: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.mp4'
    }, {
        name: 'opus', size: 37314,
        url: '/bower_components/podlove-web-player/dist/examples/which-format/podlove-test-track.opus',
        dlurl: '/bower_components/podlove-web-player/dist/example/which-format/podlove-test-track.opus'
    }],
    show: {
        title: 'PWP - The Podlove Web Player',
        subtitle: 'HTML5 Goodness for Podcasts',
        summary: 'Even more text about this player and its advantages...',
        poster: '/bower_components/podlove-web-player/dist/examples/coverimage.png',
        url: 'http://docs.podlove.org'
    },
    duration: '00:02.902',
    alwaysShowHours: true,
    width: 'auto'
};
$('audio').podlovewebplayer({staticEmbedPage:'/bower_components/podlove-web-player/dist/static.html'});
