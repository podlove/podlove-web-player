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
    avatar: 'http://avatar/speaker/one'
  },
  {
    id: 'speaker-2',
    name: 'Speaker Two',
    avatar: 'http://avatar/speaker/two'
  },
  {
    id: 'speaker-3',
    name: 'Speaker Three',
    avatar: 'http://avatar/speaker/three'
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
    end: 200,
    speaker: {
      name: 'Speaker One',
      avatar: 'http://avatar/speaker/one'
    },
    texts: [
      {
        start: 0,
        end: 100,
        text: 'fooo'
      },
      {
        start: 100,
        end: 200,
        text: 'blaa'
      }
    ]
  },
  {
    title: 'Chapter Two',
    start: 200,
    type: 'chapter',
    index: 2
  },
  {
    type: 'transcript',
    start: 200,
    end: 300,
    speaker: {
      name: 'Speaker Two',
      avatar: 'http://avatar/speaker/two'
    },
    texts: [
      {
        start: 200,
        end: 300,
        text: 'bar'
      }
    ]
  },
  {
    title: 'Chapter Three',
    start: 250,
    type: 'chapter',
    index: 3
  },
  {
    type: 'transcript',
    start: 300,
    end: 400,
    speaker: {
      name: 'Speaker Three',
      avatar: 'http://avatar/speaker/three'
    },
    texts: [
      {
        start: 300,
        end: 400,
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
