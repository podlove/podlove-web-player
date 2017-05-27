<template>
    <div class="link">
        <h4 class="title">{{ $t('SHARE.LINK') }}</h4>
        <div class="input-row input-group">
            <input type="text" class="input-text" disabled :value="clipboardContent(reference, share.link, playtime)" />
            <ButtonComponent
                class="input-button truncate"
                :data-clipboard-text="clipboardContent(reference, share.link, playtime)"
                v-clipboard
                :style="buttonStyle(theme)">
                {{ $t('SHARE.COPY') }}
            </ButtonComponent>
        </div>
        <div class="input-row">
            <div>
                <label class="input-label"><input type="checkbox" :value="share.link.start" v-on:change="toggleStart(playtime)"/> {{ $t('SHARE.START') }}</label>
                <input type="text" class="input-text" :value="secondsToTime(share.link.starttime)" v-on:input="setStarttime"/>
            </div>
        </div>
    </div>
</template>

<script>
    import { debounce, get } from 'lodash'
    import store from 'store'

    import ButtonComponent from 'shared/Button.vue'

    import { addQueryParameter } from 'utils/url'
    import { secondsToTime, timeToSeconds } from 'utils/time'

    // Link
    const clipboardContent = (reference, link, playtime) => {
        const parameters = {}

        if (link.start) {
            parameters.t = secondsToTime(link.starttime)
        }

        return addQueryParameter(reference.origin, parameters)
    }

    const toggleStart = time => {
        store.dispatch(store.actions.toggleShareLinkStart())
        store.dispatch(store.actions.setShareLinkStarttime(time))
    }

    const setStarttime = debounce(input => {
        const duration = get(store.store.getState(), 'duration')
        let time = timeToSeconds(input.target.value)

        if (!time) {
            return
        }

        if (time > duration) {
            time = duration
        }

        store.dispatch(store.actions.setShareLinkStarttime(time))
    }, 1000)

    const buttonStyle = (theme) => ({
        color: theme.tabs.button.text,
        background: theme.tabs.button.background
    })

    export default {
        data() {
            return {
                share: this.$select('share'),
                reference: this.$select('reference'),
                playtime: this.$select('playtime'),
                duration: this.$select('duration'),
                theme: this.$select('theme'),
                translate: this.$select('l10n')
            }
        },
        methods: {
            secondsToTime,
            buttonStyle,

            clipboardContent,
            toggleStart,
            setStarttime
        },
        components: {
            ButtonComponent
        }
    }
</script>

<style lang="scss">
    @import 'inputs';
</style>
