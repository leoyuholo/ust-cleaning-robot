import { map1n3r0path } from './map1-3-0'
import { map1n3r1path } from './map1-3-1'
import { map1n3r2path } from './map1-3-2'

// y:0(1566)-52(2551), x:0(6034)-147(8784)
const map1config = {
    jx: 6034,
    jy: 1566,
    jw: 8784 - 6034,
    jh: 2550 - 1566,
    ax: 0,
    ay: 0,
    aw: 147,
    ah: 52
}

map1config.jxratio = map1config.jw / map1config.aw
map1config.jyratio = map1config.jh / map1config.ah

const coora2j = (p, config) => {
    return p.map(([y, x]) => {
        return [x * config.jxratio + config.jx, y * config.jyratio + config.jy]
    })
}

const map1n3r0 = coora2j(map1n3r0path, map1config)
const map1n3r1 = coora2j(map1n3r1path, map1config)
const map1n3r2 = coora2j(map1n3r2path, map1config)

export const map = {
    findPath: async (params) => {
        return [
            map1n3r0,
            map1n3r1,
            map1n3r2,
        ]
    }
}
