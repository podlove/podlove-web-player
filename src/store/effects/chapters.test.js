import test from 'ava'
import sinon from 'sinon'
import chapters from './chapters'

let store, state

test.beforeEach(t => {
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
