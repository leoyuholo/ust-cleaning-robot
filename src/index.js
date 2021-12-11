import * as _ from 'lodash'

import { MainView } from './MainView'
import { map } from './map'
import { Playback } from './Playback'

const vpWidth = window.innerWidth - 20
const vpHeight = window.innerHeight - 240
const canvasVp = document.querySelector('#canvas-vp')
canvasVp.style.width = `${vpWidth}px`

const mainView = new MainView(canvasVp, vpWidth, vpHeight)
mainView.init()
    .then(() => {
        // findPath()
    })

const findPath = async () => {
    const params = {
        map: document.querySelector('#select-region').value,
        nRobot: mainView.nRobot,
        robotCoors: mainView.robotCoors
    }
    const paths = await map.findPath(params)
    mainView.drawPlannedPaths(paths)
    const playback = new Playback(mainView, document.querySelector('#playback-control'))
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
        console.log(i, +nRobotsRadio.value)
        mainView.setNRobot(+nRobotsRadio.value)
    })
})