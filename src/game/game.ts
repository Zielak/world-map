import { Renderer } from './renderer'
import { TerrainController } from './terrain/terrainController'
import { parseOSMXml } from './mapParser/osmXmlParser'
import { MapController } from './map/mapController'

const renderer = new Renderer()

const terrainController = new TerrainController(
  {
    sectorSizeX: 200,
    sectorSizeY: 200,
    LODDistanceModifiers: [2, 3, 5, 40],
    initialPlayerPos: renderer.camera.position
  },
  renderer.scene
)
const mapController = new MapController({}, renderer)

window['viewport'] = renderer
window['terrain'] = terrainController

fetch('map.osm')
  .then(data => data.text())
  .then(string => {
    const mapData = parseOSMXml(string)

    mapController.geoConv.setReference(
      mapData.bounds.centerLat,
      mapData.bounds.centerLon,
      0
    )

    renderer.addNode('test', 0, 0, 0)

    // Render every node from every way
    mapData.waysMap.forEach(way => {
      // const material = 'node'
      // way.nodes.forEach(node => {})
      mapController.addWay(way)
    })

    window['map'] = mapData
  })

/*
;(function() {
  // React interface
  // ReactDOM.render(<Gui />, document.getElementById("gui"))
  setInterval(() => {
    const { x, y } = terrainController.getSectorFromVector(
      viewport.webVRCamera.position
    )
    const allSectors = []
    const sectors = terrainController.sectorsMap.sectors
    for (let secColumn in sectors) {
      for (let secRow in sectors[secColumn]) {
        allSectors.push(sectors[secColumn][secRow])
      }
    }
    const data: EUpdateCurrentSector = {
      currentX: x,
      currentY: y,
      minimap: allSectors.map(el => ({
        x: el.x,
        y: el.y,
        current: el.x === x && el.y === y,
        bestLod: el.currentBestLOD,
        terrains: el.terrains.length
      }))
    }
    document.dispatchEvent(
      new CustomEvent(EVENTS.updateCurrentSector, { detail: data })
    )
  }, 500)
})()
*/
