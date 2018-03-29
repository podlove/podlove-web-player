export const duration = 400
export const playtime = 100

export const transcripts = [
  {
    start: 0,
    end: 100,
    speaker: 'speaker-1',
    text: 'fooo'
  },
  {
    start: 100,
    end: 200,
    speaker: 'speaker-1',
    text: 'blaa'
  },
  {
    start: 200,
    end: 300,
    speaker: 'speaker-2',
    text: 'bar'
  },
  {
    start: 300,
    end: 400,
    speaker: 'speaker-3',
    text: 'baz'
  }
]

export const contributors = [
  {
    id: 'speaker-1',
    name: 'Speaker One',
    avatar: 'http://avatar/speaker/one',
    group: {
      slug: 'onair'
    }
  },
  {
    id: 'speaker-2',
    name: 'Speaker Two',
    avatar: 'http://avatar/speaker/two',
    group: {
      slug: 'onair'
    }
  },
  {
    id: 'speaker-3',
    name: 'Speaker Three',
    avatar: 'http://avatar/speaker/three',
    group: {
      slug: 'onair'
    }
  },
  {
    id: 'contributor-4',
    name: 'Contributor 5',
    avatar: 'http://avatar/contributor/three',
    group: {
      slug: 'contributor'
    }
  }
]

export const chapters = [
  {
    title: 'Chapter One',
    start: 0
  },
  {
    title: 'Chapter Two',
    start: 200
  },
  {
    title: 'Chapter Three',
    start: 250
  }
]

export const timeline = [
  {
    title: 'Chapter One',
    start: 0,
    type: 'chapter',
    index: 1
  },
  {
    type: 'transcript',
    start: 0,
    end: 200000,
    speaker: {
      id: 'speaker-1',
      name: 'Speaker One',
      avatar: 'http://avatar/speaker/one',
      group: {
        slug: 'onair'
      }
    },
    texts: [
      {
        start: 0,
        end: 100000,
        text: 'fooo'
      },
      {
        start: 100000,
        end: 200000,
        text: 'blaa'
      }
    ]
  },
  {
    title: 'Chapter Two',
    start: 200000,
    type: 'chapter',
    index: 2
  },
  {
    type: 'transcript',
    start: 200000,
    end: 300000,
    speaker: {
      id: 'speaker-2',
      name: 'Speaker Two',
      avatar: 'http://avatar/speaker/two',
      group: {
        slug: 'onair'
      }
    },
    texts: [
      {
        start: 200000,
        end: 300000,
        text: 'bar'
      }
    ]
  },
  {
    title: 'Chapter Three',
    start: 250000,
    type: 'chapter',
    index: 3
  },
  {
    type: 'transcript',
    start: 300000,
    end: 400000,
    speaker: {
      id: 'speaker-3',
      name: 'Speaker Three',
      avatar: 'http://avatar/speaker/three',
      group: {
        slug: 'onair'
      }
    },
    texts: [
      {
        start: 300000,
        end: 400000,
        text: 'baz'
      }
    ]
  }
]

export const state = {
  chapters,
  contributors,
  duration,
  playtime
}
