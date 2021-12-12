import * as _ from 'lodash'

import { MainView } from './MainView'
import { map } from './map'
import { Playback } from './Playback'

const vpWidth = window.innerWidth - 20
const vpHeight = window.innerHeight - 240
const canvasVp = document.querySelector('#canvas-vp')
canvasVp.style.width = `${vpWidth}px`

const mainView = new MainView(canvasVp, vpWidth, vpHeight)
const mapId = document.location.pathname.split('/').slice(-1)[0].split('.')[0]
mainView.init(`${mapId}.jpg`)
    .then(() => {
        // findPath()
    })

let playback = null
const findPath = async () => {
    const params = {
        map: document.querySelector('#select-region').value,
        algorithm: document.querySelector('#select-algorithm').value,
        nRobot: mainView.nRobot,
        robotCoors: mainView.robotCoors
    }
    findPathBtn.innerText = 'Computing...'
    findPathBtn.disabled = true
    const paths = await map.findPath(params)
    findPathBtn.disabled = false
    findPathBtn.innerText = 'Find Path'
    mainView.drawPlannedPaths(paths)
    playback = playback || new Playback(mainView, document.querySelector('#playback-control'))
    playback.play(0)
    playback.pause()
}

const findPathBtn = document.querySelector('#findpath-btn')
findPathBtn.addEventListener('click', (e) => {
    findPath()
})

// _.range(5).forEach(i => {
_.range(3).forEach(i => {
    const nRobotsRadio = document.querySelector(`#nRobots${i+1}`)
    nRobotsRadio.addEventListener('change', (e) => {
        mainView.setNRobot(+nRobotsRadio.value)
    })
})
