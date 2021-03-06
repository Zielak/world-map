const clipboardy = require('clipboardy')

const argv = process.argv.filter((_, idx) => idx >= 2)
const minLatSector = parseFloat(argv[0]) || -1
const minLonSector = parseFloat(argv[1]) || -1
const maxLatSector = parseFloat(argv[2]) || 1
const maxLonSector = parseFloat(argv[3]) || 1
const SCALE = parseFloat(argv[4]) || 1
const PAD = parseFloat(argv[5]) || 0.0001

const SIZE = 0.02197265625 * SCALE

const command = `yarn sectorsCreator ${minLatSector} ${minLonSector} ${maxLatSector} ${maxLonSector} ${SCALE} ${PAD}`

// ====================

const sectors = []
let id = 0

/**
 * @param {number} y sector in latitude
 * @param {number} x sector in longitude
 */
function createSector(y, x) {
  const top = (y + 1) * SIZE - PAD
  const bottom = y * SIZE + PAD
  const left = x * SIZE + PAD
  const right = (x + 1) * SIZE - PAD

  const topLeftNode = makeNode(top, left)
  const nodes = [
    topLeftNode,
    makeNode(top, right),
    makeNode(bottom, right),
    makeNode(bottom, left),
    topLeftNode
  ]
  const way = makeWay(nodes)

  return {
    nodes,
    way
  }
}

function makeNode(lat, lon) {
  return {
    id: id++,
    lat,
    lon
  }
}

function makeWay(nodes) {
  return {
    id: id++,
    tags: { test: 'yes' },
    nodes
  }
}

// ===========================

for (let latS = minLatSector; latS < maxLatSector; latS++) {
  for (let lonS = minLonSector; lonS < maxLonSector; lonS++) {
    sectors.push(createSector(latS, lonS))
  }
}

function renderNodes(sectors) {
  const uniqueNodes = [
    ...new Set(
      sectors.map(s => s.nodes).reduce((all, nodes) => all.concat(nodes), [])
    )
  ]

  return uniqueNodes.reduce((string, node) => {
    return `${string}  <node id="${node.id}" lat="${node.lat}" lon="${node.lon}"/>\n`
  }, '')
}

function renderWays(sectors) {
  return sectors.reduce((string, { way }) => {
    string += `  <way id="${way.id}">\n`
    const nodes = way.nodes.reduce(
      (s, node) => `${s}    <nd ref="${node.id}"/>\n`,
      ''
    )
    const tags = Object.entries(way.tags).reduce(
      (s, [key, value]) => `${s}    <tag k="${key}" v="${value}"/>\n`,
      ''
    )

    return string + nodes + tags + `  </way>\n`
  }, '')
}

const resBounds = [
  `  <bounds`,
  `minlat="${minLatSector * SIZE}"`,
  `minlon="${minLonSector * SIZE}"`,
  `maxlat="${(maxLatSector + 1) * SIZE}"`,
  `maxlon="${(maxLonSector + 1) * SIZE}" />\n`
].join(' ')
const resNodes = renderNodes(sectors)
const resWays = renderWays(sectors)

const map = `
<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="${command}">
${resBounds}
${resNodes}
${resWays}
</osm>
`

clipboardy.writeSync(map)
console.log(`Map copied to clipboard. ${sectors.length} sectors.`)
