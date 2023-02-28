const clipboardy = require('clipboardy')
const yargs = require('yargs')
  .option('OFFSET_LAT', {
    alias: ['offsetLat', 'olat'],
    type: 'number',
    default: 0
  })
  .option('OFFSET_LON', {
    alias: ['offsetLon', 'olon'],
    type: 'number',
    default: 0
  })
  .option('SCALE', {
    alias: ['scale', 's'],
    type: 'number',
    default: 1
  })
  .option('PAD', {
    alias: ['padding', 'p'],
    type: 'number',
    default: 0.0001
  })

const { SCALE, PAD, OFFSET_LAT, OFFSET_LON } = yargs.argv

console.log(yargs)

const [
  minLatSector = -1,
  minLonSector = -1,
  maxLatSector = -1,
  maxLonSector = -1
] = yargs.argv._

// const minLatSector = parseFloat(argv[0]) || -1
// const minLonSector = parseFloat(argv[1]) || -1
// const maxLatSector = parseFloat(argv[2]) || 1
// const maxLonSector = parseFloat(argv[3]) || 1

const SECTOR_SIZE = 0.02197265625
const BOX_SIZE = SECTOR_SIZE * SCALE

const command = [
  `yarn sectorsCreator`,
  `${minLatSector} ${minLonSector} ${maxLatSector} ${maxLonSector}`,
  `-s=${SCALE} -p=${PAD} --olat=${OFFSET_LAT} --olon=${OFFSET_LON}`
].join(' ')

// ====================

const boxes = []
let id = 0

/**
 * @param {number} y sector in latitude
 * @param {number} x sector in longitude
 */
function createBox(y, x) {
  const top = (y + 1) * BOX_SIZE - PAD
  const bottom = y * BOX_SIZE + PAD
  const left = x * BOX_SIZE + PAD
  const right = (x + 1) * BOX_SIZE - PAD

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

for (let lat = minLatSector; lat < maxLatSector; lat++) {
  for (let lon = minLonSector; lon < maxLonSector; lon++) {
    boxes.push(createBox(OFFSET_LAT + lat, OFFSET_LON + lon))
  }
}

function renderNodes(boxes) {
  const uniqueNodes = [
    ...new Set(
      boxes.map(s => s.nodes).reduce((all, nodes) => all.concat(nodes), [])
    )
  ]

  return uniqueNodes.reduce((string, node) => {
    return `${string}  <node id="${node.id}" lat="${node.lat}" lon="${node.lon}"/>\n`
  }, '')
}

function renderWays(boxes) {
  return boxes.reduce((string, { way }) => {
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
  `minlat="${OFFSET_LAT + minLatSector * BOX_SIZE}"`,
  `minlon="${OFFSET_LON + minLonSector * BOX_SIZE}"`,
  `maxlat="${OFFSET_LAT + (maxLatSector + 1) * BOX_SIZE}"`,
  `maxlon="${OFFSET_LON + (maxLonSector + 1) * BOX_SIZE}" />\n`
].join(' ')
const resNodes = renderNodes(boxes)
const resWays = renderWays(boxes)

const map = `
<?xml version="1.0" encoding="UTF-8"?>
<osm version="0.6" generator="${command}">
${resBounds}
${resNodes}
${resWays}
</osm>
`

clipboardy.writeSync(map)
console.log(`Map copied to clipboard. ${boxes.length} boxes.`)
console.log(`Regenerate with:`)
console.log(`${command}`)
