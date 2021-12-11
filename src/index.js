import * as PIXI from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import * as _ from 'lodash'
import { map1n3r1 } from './map'

// const controlWidth = window.innerWidth
// const control = document.querySelectorAll('#control')[0];
// control.style.width = `${controlWidth}px`

const vpWidth = window.innerWidth - 20
const vpHeight = window.innerHeight - 240
const app = new PIXI.Application({width: vpWidth, height: vpHeight})
app.renderer.backgroundAlpha = 0
const canvasVp = document.querySelectorAll('#canvas-vp')[0];
canvasVp.style.width = `${vpWidth}px`
canvasVp.appendChild(app.view)

const colorMap = [
    '#e41a1c',
    '#377eb8',
    '#4daf4a',
    '#984ea3',
    '#ff7f00',
]

const robotCoors = [
    [-1, -1],
    [-1, -1],
    [-1, -1],
    [-1, -1],
    [-1, -1],
]

app.loader.add('ustmap', 'Academic Building.jpg').load((loader, resources) => {
    const ustmapTexture = resources.ustmap.texture

    // create viewport
    const viewport = new Viewport({
        screenWidth: vpWidth,
        screenHeight: vpHeight,
        worldWidth: ustmapTexture.width,
        worldHeight: ustmapTexture.height,
        backgroundColor: '0xFFFFFF',

        interaction: app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })

    // add the viewport to the stage
    app.stage.addChild(viewport)

    // activate plugins
    viewport
        .drag()
        .pinch()
        .wheel()
        .decelerate()

    const ustmapSprite = new PIXI.Sprite(ustmapTexture)
    const ustmap = viewport.addChild(ustmapSprite)

    const ratio = Math.min(vpHeight / ustmapTexture.height, vpWidth / ustmapTexture.width)
    const offsetx = 0
    const offsety = 0
    const width = ustmapTexture.width
    const height = ustmapTexture.height

    const coorj2c = (x, y) => {
        return [(x - offsetx) * ratio, (y - offsety) * ratio]
    }

    const coorc2j = (x, y) => {
        return [x / ratio + offsetx, y / ratio + offsety]
    }

    console.log('ustmapTexture', [width, height]);
    // console.log(map1n3r1[0], map1n3r1[20]);

    [ustmap.width, ustmap.height] = coorj2c(width, height)
    ustmap.position.set(...coorj2c(0, 0));

    const findPathButtonGraphics = new PIXI.Graphics()
    const findPathButton = app.stage.addChild(findPathButtonGraphics)
    findPathButton.lineStyle(1, 0x000000, 1)
    findPathButton.beginFill(0xFFFFFF, 1)
    findPathButton.drawRect(vpWidth - 160, vpHeight - 80, 100, 30)
    findPathButton.endFill()
    const findPathButtonText = app.stage.addChild(new PIXI.Text('Find Path',{fontFamily : 'Arial', fontSize: 20, fill : 0x000000, align : 'center'}))
    findPathButtonText.position.x = vpWidth - 155
    findPathButtonText.position.y = vpHeight - 75
    findPathButton.interactive = true
    findPathButton.on('mousedown', function (e) {
        const planLineGraphics = new PIXI.Graphics()
        const planLine = viewport.addChild(planLineGraphics)
        planLine.lineStyle(1, PIXI.utils.string2hex(colorMap[0]), 0.2);
        planLine.moveTo(...coorj2c(...map1n3r1[0]))
        map1n3r1.slice(1).forEach(coor => {
            // console.log(...coorj2c(...coor))
            planLine.lineTo(...coorj2c(...coor))
        })

        const cleanLineGraphics = new PIXI.Graphics()
        const cleanLine = viewport.addChild(cleanLineGraphics)
        let n = 1
        const onTick = () => {
            console.log('tick')
            cleanLine.lineStyle(1, PIXI.utils.string2hex(colorMap[0]), 1);
            cleanLine.moveTo(...coorj2c(...map1n3r1[n-1]))
            cleanLine.lineTo(...coorj2c(...map1n3r1[n]))
            n += 1
            if (n >= map1n3r1.length) {
                app.ticker.remove(onTick)
            }
        }
        app.ticker.add(onTick)
    })

    _.range(5).forEach((n) => {
        const color = colorMap[n]
        const colorHex = PIXI.utils.string2hex(color)
        const text = app.stage.addChild(new PIXI.Text(`Robot ${n + 1}`,{fontFamily : 'Arial', fontSize: 12, fill : color, align : 'center'}))
        text.position.x = vpWidth - 100 - 60
        text.position.y = vpHeight - 200 + n*20 - 6
        const circleGraphics = new PIXI.Graphics()
        const circle = app.stage.addChild(circleGraphics)
        circle.lineStyle(1, 0xFFFFFF, 1);
        circle.beginFill(colorHex, 1);
        circle.drawCircle(vpWidth - 100, vpHeight - 200 + n*20, 10);
        circle.endFill();
        // line.endFill()
        // console.log(line)

        function onDragStart(event)
        {
            this.data = event.data;
            this.dragging = true;
            if (this.targetCircle) this.targetCircle.destroy()
            this.targetCircleGraphics = new PIXI.Graphics()
            this.targetCircle = viewport.addChild(this.targetCircleGraphics)
            // this.targetCircle.lineStyle(1, 0xFFFFFF, 1);
            this.targetCircle.beginFill(PIXI.utils.string2hex(color), 1);
            this.targetCircle.drawCircle(0, 0, 2)
            this.targetCircle.endFill();
        }

        function onDragEnd() {
            this.dragging = false;
            this.data = null;
        }

        function onDragMove() {
            if (this.dragging) {
                var newPosition = this.data.getLocalPosition(this.parent);
                // console.log('onDragMove', newPosition, this.position, viewport.toWorld(newPosition.x, newPosition.y))
                const newpos = viewport.toWorld(newPosition.x, newPosition.y)
                robotCoors[n] = [...coorc2j(newpos.x, newpos.y)]
                console.log(robotCoors)
                this.targetCircle.position.set(newpos.x, newpos.y)
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
    })
})
