import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import * as _ from 'lodash'
import EventEmitter from 'eventemitter3'

const colorMap = [
    '#e41a1c',
    '#377eb8',
    '#4daf4a',
    '#984ea3',
    '#ff7f00',
    '#ffff33',
    '#a65628',
    '#f781bf',
]

export class MainView {
    constructor (parentElement, vpWidth, vpHeight) {
        this.vpWidth = vpWidth
        this.vpHeight = vpHeight
        this.app = new PIXI.Application({width: vpWidth, height: vpHeight})
        this.app.renderer.backgroundAlpha = 0
        parentElement.appendChild(this.app.view)
    }

    async init () {
        this.resources = await new Promise((resolve, reject) => this.app.loader.add('ustmap', 'Academic Building.jpg').load((loader, resources) => resolve(resources)))
        this.ustmapTexture = this.resources.ustmap.texture

        this.viewport = new Viewport({
            screenWidth: this.vpWidth,
            screenHeight: this.vpHeight,
            worldWidth: this.ustmapTexture.width,
            worldHeight: this.ustmapTexture.height,
            backgroundColor: '0xFFFFFF',

            interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        this.app.stage.addChild(this.viewport)

        this.viewport
            .drag()
            .pinch()
            .wheel()
            .decelerate()

        const ustmapSprite = new PIXI.Sprite(this.ustmapTexture)
        this.ustmap = this.viewport.addChild(ustmapSprite)

        this.ratio = Math.min(this.vpHeight / this.ustmapTexture.height, this.vpWidth / this.ustmapTexture.width)
        this.offsetx = 0
        this.offsety = 0
        this.width = this.ustmapTexture.width
        this.height = this.ustmapTexture.height

        const ustmapDimension = this.coorj2c(this.width, this.height)
        this.ustmap.width = ustmapDimension[0]
        this.ustmap.height = ustmapDimension[1]
        this.ustmap.position.set(...this.coorj2c(0, 0));

        this.setNRobot(3)
        // this.drawFindPathButton()
    }

    coorj2c = (x, y) => {
        return [(x - this.offsetx) * this.ratio, (y - this.offsety) * this.ratio]
    }

    coorc2j = (x, y) => {
        return [x / this.ratio + this.offsetx, y / this.ratio + this.offsety]
    }

    setNRobot = (n) => {
        this.nRobot = n
        this.robotCoors = this.robotCoors || []
        this.robotCoors = this.robotCoors.length > n
            ? this.robotCoors.slice(0, n)
            : this.robotCoors.concat(_.range(this.robotCoors.length - n).map(i => [-1, -1]))
        this.drawLegend()
    }

    setRobotCoor = (n, x, y) => {
        console.log(n, x, y)
        this.robotCoors[n] = [x, y]
    }

    drawPlannedPaths = (paths) => {
        this.paths = paths
        this.pathLength = Math.max(...paths.map(p => p.length))
        this.currentT = 0

        this.planLines = this.resetLines(this.planLines, paths.length)
        paths.forEach((p, i) => this.drawPlannedPath(i, p))
    }

    drawPlannedPath = (n, path) => {
        const planLine = this.planLines[n] = this.viewport.addChild(new PIXI.Graphics())
        planLine.lineStyle(1, PIXI.utils.string2hex(colorMap[n]), 0.2)
        planLine.moveTo(...this.coorj2c(...path[0]))
        path.slice(1).forEach(coor => {
            planLine.lineTo(...this.coorj2c(...coor))
        })
    }

    resetLines = (lines, n) => {
        if (lines) lines.forEach(l => l?.destroy?.())
        return _.range(n).map(i => '')
    }

    drawCleanedPaths = (t) => {
        if ((this.currentT > t) || !this.cleanedLines) {
            this.cleanedLines = this.resetLines(this.cleanedLines, this.paths.length)
            this.currentT = 0
        }

        this.paths.forEach((p, i) => this.drawCleanedPath(i, p, t))
        this.currentT = t
    }

    drawCleanedPath = (n, p, t) => {
        let currentT = this.currentT

        if (currentT === 0 || !this.cleanedLines[n]) {
            this.cleanedLines[n] = this.cleanedLines[n] = this.viewport.addChild(new PIXI.Graphics())
            this.cleanedLines[n].lineStyle(1, PIXI.utils.string2hex(colorMap[n]), 0.7);
            this.cleanedLines[n].moveTo(...this.coorj2c(...p[0]))

            // if (n === 0) console.log('init line', n, currentT, t)

            currentT += 1
        }

        t = Math.min(t, p.length)
        currentT = Math.min(currentT, p.length)
        if (currentT > 0 && currentT < t)
            _.range(currentT, t).forEach(i => {
                // if (n === 0) console.log('draw line', n, currentT, t)
                this.cleanedLines[n].moveTo(...this.coorj2c(...p[i-1]))
                this.cleanedLines[n].lineTo(...this.coorj2c(...p[i]))
            })
    }

    drawPath = () => {
        const planLine = this.viewport.addChild(new PIXI.Graphics())
        planLine.lineStyle(1, PIXI.utils.string2hex(colorMap[0]), 0.2);
        planLine.moveTo(...this.coorj2c(...map1n3r1[0]))
        map1n3r1.slice(1).forEach(coor => {
            // console.log(...coorj2c(...coor))
            planLine.lineTo(...coorj2c(...coor))
        })

        const cleanLine = viewport.addChild(new PIXI.Graphics())
        let n = 1
        const onTick = () => {
            console.log('tick')
            cleanLine.lineStyle(1, PIXI.utils.string2hex(colorMap[0]), 1);
            cleanLine.moveTo(...coorj2c(...map1n3r1[n-1]))
            cleanLine.lineTo(...coorj2c(...map1n3r1[n]))
            n += 1
            if (n >= map1n3r1.length) {
                this.app.ticker.remove(onTick)
            }
        }
        this.app.ticker.add(onTick)
    }

    drawFindPathButton = () => {
        const findPathButton = this.app.stage.addChild(new PIXI.Graphics())
        findPathButton.lineStyle(1, 0x000000, 1)
        findPathButton.beginFill(0xFFFFFF, 1)
        findPathButton.drawRect(this.vpWidth - 160, this.vpHeight - 80, 100, 30)
        findPathButton.endFill()
        const findPathButtonText = this.app.stage.addChild(new PIXI.Text('Find Path',{fontFamily : 'Arial', fontSize: 20, fill : 0x000000, align : 'center'}))
        findPathButtonText.position.x = this.vpWidth - 155
        findPathButtonText.position.y = this.vpHeight - 75
        findPathButton.interactive = true
        findPathButton.on('mousedown', (e) => {
            this.drawPath()
        })
    }

    drawLegend = () => {
        if (this.legendItems) this.legendItems.forEach(i => i.destroy())
        this.legendItems = _.range(this.nRobot).map(n => {
            const legendItem = new LegendItem(this, n)
            legendItem.on('coorchange', newPosition => this.setRobotCoor(n, ...this.coorc2j(newPosition.x, newPosition.y)))
            return legendItem
        })
    }
}

class LegendItem extends EventEmitter {
    constructor (mainView, n) {
        super()

        const color = colorMap[n]
        const colorHex = PIXI.utils.string2hex(color)

        const text = this.text = mainView.app.stage.addChild(new PIXI.Text(`Robot ${n + 1}`,{fontFamily : 'Arial', fontSize: 12, fill : color, align : 'center'}))
        text.position.x = mainView.vpWidth - 100 - 60
        text.position.y = mainView.vpHeight - 200 + n * 20 - 6

        const circleGraphics = new PIXI.Graphics()
        const circle = this.circle = mainView.app.stage.addChild(circleGraphics)
        circle.lineStyle(1, 0xFFFFFF, 1);
        circle.beginFill(colorHex, 1);
        circle.drawCircle(mainView.vpWidth - 100, mainView.vpHeight - 200 + n*20, 10);
        circle.endFill();

        const legendItem = this

        function onDragStart(event) {
            this.data = event.data;
            this.dragging = true;

            if (legendItem.targetCircle) legendItem.targetCircle.destroy()
            const targetCircle = legendItem.targetCircle = mainView.viewport.addChild(new PIXI.Graphics())
            // targetCircle.lineStyle(1, 0xFFFFFF, 1);
            targetCircle.beginFill(PIXI.utils.string2hex(color), 1);
            targetCircle.drawCircle(0, 0, 2)
            targetCircle.endFill();
        }

        function onDragEnd() {
            this.dragging = false;
            this.data = null;
        }

        function onDragMove() {
            if (this.dragging) {
                const newPosition = this.data.getLocalPosition(this.parent);
                const newWorldPosition = mainView.viewport.toWorld(newPosition.x, newPosition.y)
                legendItem.emit('coorchange', newWorldPosition)
                // legendItem.robotCoors[n] = [...mainView.coorc2j(newWorldPosition.x, newWorldPosition.y)]
                legendItem.targetCircle.position.set(newWorldPosition.x, newWorldPosition.y)
            }
        }

        circleGraphics.interactive = true;
        circleGraphics
            // events for drag start
            .on('mousedown', onDragStart)
            .on('touchstart', onDragStart)
            // events for drag end
            .on('mouseup', onDragEnd)
            .on('mouseupoutside', onDragEnd)
            .on('touchend', onDragEnd)
            .on('touchendoutside', onDragEnd)
            // events for drag move
            .on('mousemove', onDragMove)
            .on('touchmove', onDragMove);
    }

    destroy () {
        this.text.destroy()
        this.circle.destroy()
        this.targetCircle && this.targetCircle.destroy()
    }
}
