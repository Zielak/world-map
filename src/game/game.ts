import { Renderer } from './renderer'
import { TerrainController } from './terrain/terrainController'
import { parseOSMXml } from './map/osmXmlParser'
import { MapController } from './map/mapController'
import { Vector3 } from '@babylonjs/core'

const renderer = new Renderer()

// const terrainController = new TerrainController(
//   {
//     sectorSizeX: 200,
//     sectorSizeY: 200,
//     LODDistanceModifiers: [2, 3, 5, 40],
//     initialPlayerPos: renderer.camera.position
//   },
//   renderer.scene
// )
const mapController = new MapController()

window['viewport'] = renderer
// window['terrain'] = terrainController
window['map'] = mapController

fetch((document.location.search.slice(1) || 'pogonKosciol') + '.osm')
  .then(data => data.text())
  .then(function onFetchMapData(string) {
    const mapData = parseOSMXml(string)

    renderer.addNode('test', new Vector3(0, -10, 0))
    renderer.addNode('test', new Vector3(0, 10, 0))

    mapData.nodesMap?.forEach(function addEachNode(node) {
      mapController.addNode(node)
    })

    mapData.waysMap?.forEach(function addEachWay(way) {
      mapController.addWay(way)
    })

    // Put all that data to Renderer, sector by sector
    mapController.bake(
      renderer,
      mapData.bounds.centerLat,
      mapData.bounds.centerLon
    )

    window['mapRaw'] = mapData
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
