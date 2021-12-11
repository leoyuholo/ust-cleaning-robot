import { map1n3r1path } from './map1-3-0'

// y:0(1566)-52(2551), x:0(6034)-147(8784)
const map1config = {
    jx: 6020,
    jy: 1580,
    jw: 8750 - 6020,
    jh: 2550 - 1580,
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

export const map1n3r1 = coora2j(map1n3r1path, map1config)
