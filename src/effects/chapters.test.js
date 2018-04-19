import test from 'ava'
import sinon from 'sinon'
import nocker from 'superagent-nock'
import request from 'superagent'

import chapters from './chapters'

let store, state, nock

test.beforeEach(t => {
  nock = nocker(request)

  state = {
    chapters: [{
      start: 0,
      end: 1000
    }, {
      start: 1000,
      end: 2000
    }, {
      start: 2000,
      end: 3000
    }],
    duration: 3000,
    playtime: 2500,
    ghost: {
      active: false
    }
  }

  store = {
    dispatch: sinon.stub(),
    getState: () => (state)
  }
})

test(`chaptersEffects: it exports a effect function`, t => {
  t.is(typeof chapters, 'function')
})

test.cb(`chaptersEffects: it triggers INIT_CHAPTERS inf INIT is dispatched`, t => {
  t.plan(2)

  const dummyChapters = [
    {
        start: '00:00:00.000',
        title: 'chapter 1'
    },
    {
        start: '00:00:43.137',
        title: 'chapter 2'
    },
    {
        start: '00:01:15.911',
        title: 'chapter 3'
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
      },
      {
        active: true,
        end: 75911,
        start: 43137,
        title: 'chapter 2',
      },
      {
        active: false,
        end: 100000,
        start: 75911,
        title: 'chapter 3',
      },
    ])
    t.end()
  }

  chapters(store, { type: 'INIT', payload: { chapters: dummyChapters } })
})

test.cb(`chaptersEffects: it triggers INIT_CHAPTERS if INIT is dispatched`, t => {
  t.plan(2)

  const dummyChapters = [
    {
        start: '00:00:00.000',
        title: 'chapter 1'
    },
    {
        start: '00:00:43.137',
        title: 'chapter 2'
    },
    {
        start: '00:01:15.911',
        title: 'chapter 3'
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
      },
      {
        active: true,
        end: 75911,
        start: 43137,
        title: 'chapter 2',
      },
      {
        active: false,
        end: 100000,
        start: 75911,
        title: 'chapter 3',
      }
    ])
    t.end()
  }

  chapters(store, { type: 'INIT', payload: { chapters: dummyChapters } })
})

test.cb(`chaptersEffects: it triggers INIT_CHAPTERS if INIT is dispatched`, t => {
  t.plan(2)

  state = {
    duration: 100000,
    playtime: 45000
  }

  const dummyChapters = [
    {
      start: '00:00:00.000',
      title: 'chapter 1'
    },
    {
      start: '00:00:43.137',
      title: 'chapter 2'
    },
    {
      start: '00:01:15.911',
      title: 'chapter 3'
    }
  ]

  nock('http://localhost')
    .get('/foo')
    .reply(200, dummyChapters)

  store.dispatch = ({ type, payload }) => {
    t.is(type, 'INIT_CHAPTERS')
    t.deepEqual(payload, [
      {
        active: false,
        end: 43137,
        start: 0,
        title: 'chapter 1',
      },
      {
        active: true,
        end: 75911,
        start: 43137,
        title: 'chapter 2',
      },
      {
        active: false,
        end: 100000,
        start: 75911,
        title: 'chapter 3',
      }
    ])
    t.end()
  }

  chapters(store, { type: 'INIT', payload: { chapters: 'http://localhost/foo' } })
})

test.cb(`chaptersEffects: it triggers INIT_CHAPTERS with an empty list if the request fails`, t => {
  t.plan(2)

  state = {
    duration: 100000,
    playtime: 45000
  }

  nock('http://localhost')
    .get('/foo')
    .reply(400, [])

  store.dispatch = ({ type, payload }) => {
    t.is(type, 'INIT_CHAPTERS')
    t.deepEqual(payload, [])
    t.end()
  }

  chapters(store, { type: 'INIT', payload: { chapters: 'http://localhost/foo' } })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME if PREVIOUS_CHAPTER is dispatched`, t => {
  state.chapters[0].active = true
  chapters(store, {type: 'PREVIOUS_CHAPTER'})

  state.chapters[0].active = false
  state.chapters[2].active = true
  chapters(store, {type: 'PREVIOUS_CHAPTER'})

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 0
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 2000
  })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME if NEXT_CHAPTER is dispatched`, t => {
  state.chapters[2].active = true
  chapters(store, {type: 'NEXT_CHAPTER'})

  state.chapters[2].active = false
  state.chapters[1].active = true
  chapters(store, {type: 'NEXT_CHAPTER'})

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 3000
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 1000
  })
})

test(`chaptersEffects: it triggers UPDATE_PLAYTIME if SET_CHAPTER is dispatched`, t => {
  state.chapters[1].active = true
  chapters(store, {type: 'SET_CHAPTER'})

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_PLAYTIME',
    payload: 1000
  })
})

test(`chaptersEffects: it triggers UPDATE_CHAPTER if SET_PLAYTIME is dispatched`, t => {
  chapters(store, {type: 'SET_PLAYTIME', payload: 1000})
  chapters(store, {type: 'UPDATE_PLAYTIME', payload: 1000})
  state.ghost.active = true

  chapters(store, {type: 'SET_PLAYTIME', payload: 1000})
  chapters(store, {type: 'UPDATE_PLAYTIME', payload: 1000})
  t.is(store.dispatch.getCalls().length, 2)

  t.deepEqual(store.dispatch.getCall(0).args[0], {
    type: 'UPDATE_CHAPTER',
    payload: 1000
  })

  t.deepEqual(store.dispatch.getCall(1).args[0], {
    type: 'UPDATE_CHAPTER',
    payload: 1000
  })
})
