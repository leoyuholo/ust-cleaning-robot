import * as output from './output'
import { sleep } from './Playback'
import * as _ from 'lodash'

// y:0(1566)-52(2551), x:0(6034)-147(8784)
const mapConfigs = {
    map1: {
        jx: 6034,
        jy: 1566,
        jw: 8784 - 6034,
        jh: 2550 - 1566,
        ax: 0,
        ay: 0,
        aw: 147,
        ah: 52
    },
    map2: {
        jx: 8630,
        jy: 2140,
        jw: 10200 - 8630,
        jh: 2817 - 2140,
        ax: 0,
        ay: 0,
        aw: 82,
        ah: 37
    },
    map3: {
        jx: 1840,
        jy: 700,
        jw: 3170 - 1840,
        jh: 1660 - 700,
        ax: 0,
        ay: 0,
        aw: 143,
        ah: 103
    },
    map4: {
        jx: 5055,
        jy: 727,
        jw: 6660 - 5055,
        jh: 1234 - 727,
        ax: 0,
        ay: 0,
        aw: 171,
        ah: 53
    }
}

_.forEach(mapConfigs, m => {
    m.jxratio = m.jw / m.aw
    m.jyratio = m.jh / m.ah
})

const coora2j = (p, config) => {
    return p.map(([x, y]) => {
        return [x * config.jxratio + config.jx, y * config.jyratio + config.jy]
    })
}

export const map = {
    findPath: async (params) => {
    //     console.log(params)
    //     console.log(output[`map${params.map}`][params.nRobot])
        await sleep(1000)
        return Object.values(output[`map${params.map}`][params.nRobot]).map(a => coora2j(a, mapConfigs[`map${params.map}`]))
    }
}
