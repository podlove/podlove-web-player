import test from 'ava'
import sinon from 'sinon'
import nocker from 'superagent-nock'
import request from 'superagent'

import chapters from './chapters'

let store, state, nock

test.beforeEach(t => {
  nock = nocker(request)

  state = {
    chapters: {
      list: [{
        start: 0,
        end: 5000,
        active: true,
        index: 1
      },
      {
        start: 5000,
        end: 10000,
        index: 2
      },
      {
        start: 10000,
        end: 15000,
        index: 3
      }],
      current: {
        start: 0,
        end: 5000,
        active: true,
        index: 1
      },
      next: {
        start: 5000,
        end: 10000,
        index: 2
      },
      previous: null
    },
    duration: 15000,
    playtime: 2500,
    ghost: {
      active: false
    }
  }

  store = {
    dispatch: sinon.stub(),
    getState: () => state
  }
})

test(`chaptersEffects: it exports a effect function`, t => {
  t.is(typeof chapters, 'function')
})

test.cb(
  `chaptersEffects: it triggers INIT_CHAPTERS if INIT is dispatched`,
  t => {
    t.plan(2)

    const dummyChapters = [
      {
        start: '00:00:00.000',
        title: 'chapter 1',
        image: 'dummy'
      },
      {
        start: '00:00:43.137',
        title: 'chapter 2'
      },
      {
        start: '00:01:15.911',
        title: 'chapter 3',
        image: 'dummy',
        href: 'https://github.com/podlove/podlove-web-player/blob/development/CONTRIBUTING.md#-git-commit-guidelines'
      }
    ]

    state = {
      duration: 100000,
      playtime: 45000
    }

    store.dispatch = ({ type, payload }) => {
      t.is(type, 'INIT_CHAPTERS')
      t.deepEqual(payload, [
        {
          active: false,
          end: 43137,
          start: 0,
          title: 'chapter 1',
          index: 1,
          image: 'dummy',
          href: null,
          link_title: null
        },
        {
          active: true,
          end: 75911,
          start: 43137,
          title: 'chapter 2',
          index: 2,
          image: undefined,
          href: null,
          link_title: null
        },
        {
          active: false,
          end: 100000,
          start: 75911,
          title: 'chapter 3',
          index: 3,
          image: 'dummy',
          href: 'https://github.com/podlove/podlove-web-player/blob/development/CONTRIBUTING.md#-git-commit-guidelines',
          link_title: 'github.com'
        }
      ])
      t.end()
    }

    chapters(store, { type: 'INIT', payload: { chapters: dummyChapters } })
  }
)

test.cb(
  `chaptersEffects: it triggers INIT_CHAPTERS if INIT is dispatched`,
  t => {
    t.plan(2)

    const dummyChapters = [
      {
        start: '00:00:00.000',
        title: 'chapter 1',
        image: 'dummy'
      },
      {
        start: '00:00:43.137',
        title: 'chapter 2'
      },
      {
        start: '00:01:15.911',
        title: 'chapter 3',
        image: 'dummy'
      }
    ]

    state = {
      duration: 100000,
      playtime: 45000
    }

    store.dispatch = ({ type, payload }) => {
      t.is(type, 'INIT_CHAPTERS')
      t.deepEqual(payload, [
        {
          active: false,
          end: 43137,
          start: 0,
          title: 'chapter 1',
          index: 1,
          image: 'dummy',
          href: null,
          link_title: null
        },
        {
          active: true,
          end: 75911,
          start: 43137,
          title: 'chapter 2',
          index: 2,
          image: undefined,
          href: null,
          link_title: null
        },
        {
          active: false,
          end: 100000,
          start: 75911,
          title: 'chapter 3',
          index: 3,
          image: 'dummy',
          href: null,
          link_title: null
        }
      ])
      t.end()
    }

    chapters(store, { type: 'INIT', payload: { chapters: dummyChapters } })
  }
)

test.cb(
  `chaptersEffects: it triggers INIT_CHAPTERS if INIT is dispatched`,
  t => {
    t.plan(2)

    state = {
      duration: 100000,
      playtime: 45000
    }

    const dummyChapters = [
      {
        start: '00:00:00.000',
        title: 'chapter 1',
        image: 'dummy'
      },
      {
        start: '00:00:43.137',
        title: 'chapter 2'
      },
      {
        start: '00:01:15.911',
        title: 'chapter 3',
        image: 'dummy'
      }
    ]

    nock('http://localhost').get('/foo').reply(200, dummyChapters)

    store.dispatch = ({ type, payload }) => {
      t.is(type, 'INIT_CHAPTERS')
      t.deepEqual(payload, [
        {
          active: false,
          end: 43137,
          start: 0,
          title: 'chapter 1',
          index: 1,
          image: 'dummy',
          href: null,
          link_title: null
        },
        {
          active: true,
          end: 75911,
          start: 43137,
          title: 'chapter 2',
          index: 2,
          image: undefined,
          href: null,
          link_title: null
        },
        {
          active: false,
          end: 100000,
          start: 75911,
          title: 'chapter 3',
          index: 3,
          image: 'dummy',
          href: null,
          link_title: null
        }
      ])
      t.end()
    }

    chapters(store, {
      type: 'INIT',
      payload: { chapters: 'http://localhost/foo' }
    })
  }
)

test.cb(
  `chaptersEffects: it triggers INIT_CHAPTERS with an empty list if the request fails`,
  t => {
    t.plan(2)

    state = {
      duration: 100000,
      playtime: 45000
    }

    nock('http://localhost').get('/foo').reply(400, [])

    store.dispatch = ({ type, payload }) => {
      t.is(type, 'INIT_CHAPTERS')
      t.deepEqual(payload, [])
      t.end()
    }

    chapters(store, {
      type: 'INIT',
      payload: { chapters: 'http://localhost/foo' }
    })
  }
)

test(`chaptersEffects: it triggers SET_PREVIOUS_CHAPTER on PREVIOUS_CHAPTER if it just played less than 2 seconds`, t => {
  state.chapters.list[1].active = true
  state.chapters.current = state.chapters.list[1]
  state.playtime = 5000

  chapters(store, { type: 'PREVIOUS_CHAPTER' })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_PREVIOUS_CHAPTER'
  })
})

test(`chaptersEffects: it triggers SET_CHAPTER on PREVIOUS_CHAPTER if it played more than 2 seconds`, t => {
  state.chapters.list[1].active = true
  state.chapters.current = state.chapters.list[1]
  state.playtime = 7000

  chapters(store, { type: 'PREVIOUS_CHAPTER' })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_CHAPTER',
    payload: 1
  })
})

test(`chaptersEffects: it triggers SET_NEXT_CHAPTER if NEXT_CHAPTER is dispatched`, t => {
  chapters(store, { type: 'NEXT_CHAPTER', payload: 10 })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'SET_NEXT_CHAPTER',
    payload: 10
  })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME with current chapter start time if not last chapter when SET_NEXT_CHAPTER was dispatched`, t => {
  chapters(store, { type: 'SET_NEXT_CHAPTER' })
  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 0
  })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME with duration time if not last chapter when SET_NEXT_CHAPTER was dispatched`, t => {
  state.chapters.current = state.chapters.list[2]
  state.playtime = 11000
  chapters(store, { type: 'SET_NEXT_CHAPTER' })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 15000
  })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME if SET_PREVIOUS_CHAPTER is dispatched`, t => {
  state.chapters.list[2].active = true
  state.chapters.current = state.chapters.list[2]
  chapters(store, { type: 'SET_PREVIOUS_CHAPTER' })

  state.chapters.list[2].active = false
  state.chapters.list[1].active = true
  state.chapters.current = state.chapters.list[1]
  chapters(store, { type: 'SET_PREVIOUS_CHAPTER' })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 10000
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 5000
  })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME if SET_CHAPTER is dispatched`, t => {
  state.chapters.list[1].active = true
  state.chapters.current = state.chapters.list[1]
  chapters(store, { type: 'SET_CHAPTER' })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 5000
  })
})

test(`chaptersEffects: it triggers UPDATE_CHAPTER if SET_PLAYTIME is dispatched`, t => {
  chapters(store, { type: 'SET_PLAYTIME', payload: 1000 })
  chapters(store, { type: 'UPDATE_PLAYTIME', payload: 1000 })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_CHAPTER',
    payload: 1000
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'UPDATE_CHAPTER',
    payload: 1000
  })
})

test(`chapterEffects: it triggers UPDATE_CHAPTER if DISABLE_GHOST_MODE was dispatched`, t => {
  chapters(store, { type: 'DISABLE_GHOST_MODE' })

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_CHAPTER',
    payload: 2500
  })
})
