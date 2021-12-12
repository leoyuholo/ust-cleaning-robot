import EventEmitter from 'eventemitter3'

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class Playback extends EventEmitter {
    constructor (mainView, playbackElement) {
        super()

        this.mainView = mainView

        this.playbackBtn = playbackElement.querySelector('#playback-btn')
        this.playbackText = playbackElement.querySelector('#playback-text')
        this.playbackTime = playbackElement.querySelector('#playback-time')

        this.playbackBtn.disabled = false
        this.playbackTime.disabled = false

        const updatePlaybackText = () => {
            this.playbackText.innerText = `${this.t} / ${this.playbackLength}`
        }
        this.on('playing', (t) => {
            this.playbackTime.value = t
            updatePlaybackText()
            this.playbackTime.disabled = true
        })
        this.on('play', () => {
            this.playbackBtn.innerText = '| |'
            this.playbackTime.max = this.playbackLength
        })
        this.on('paused', () => {
            this.playbackBtn.innerText = '\u25b6'
            this.playbackTime.disabled = false
        })
        this.on('seeked', () => updatePlaybackText())

        this.playbackBtn.addEventListener('click', (e) => {
            this.paused ? this.play(this.t) : this.pause()
        })

        this.playbackTime.addEventListener('change', (e) => {
            console.log('seek', this.t, this.playbackTime.value)
            this.t = +this.playbackTime.value
            this.seek(this.t)
        })
    }

    async play (t = 0) {
        this.t = t
        this.playbackLength = this.mainView.pathLength

        console.log(this.t, this.playbackLength)

        this.paused = false
        this.emit('play')
        while (this.t < this.playbackLength) {
            if (this.paused) break

            this.mainView.drawCleanedPaths(this.t)
            this.t += 1
            this.emit('playing', this.t)

            await sleep(2)
        }
    }

    seek (t = 0) {
        this.t = t

        this.mainView.drawCleanedPaths(this.t)

        this.emit('seeked', this.t)
    }

    pause () {
        this.paused = true
        this.emit('paused')
    }
}
