import { Vector2 } from '@babylonjs/core'

import { measureFrom, measureTo } from '../utils/benchmark'
import { decimal } from '../utils/numbers'

import { parseOSMXml } from './map/osmXmlParser'
import { MapController, isPolygon } from './map/mapController'
import { MapWay } from './map/ways/ways'
import { MapSectorBottom } from './map/mapSector'
import { Renderer } from './renderer'
import { TerrainController } from './terrain/terrainController'

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

const playerPosition = new Vector2(0, 0)

window['viewport'] = renderer
// window['terrain'] = terrainController
window['map'] = mapController

// TODO: continuous map fetching
fetch((document.location.search.slice(1) || 'pogonKosciol') + '.osm')
  .then(data => data.text())
  .then(parseOSMXml)
  .then(function pushDataToMapController(mapData) {
    window['mapData'] = mapData
    mapController.addNewData(mapData)
    playerPosition.set(mapData.bounds.centerLat, mapData.bounds.centerLon)
    return mapData
  })
  .then(function handleMapData(mapData) {
    measureFrom('getNeighborsByCoords')
    // TODO: This methods picks stuff only from the most bottom sectors
    // TODO: I'm missing ways placed in upper levels!
    const allNeighbors = mapController.getNeighborsByCoords(
      playerPosition.x,
      playerPosition.y
    )
    measureTo('getNeighborsByCoords')
    const [targetSector] = allNeighbors

    // Expand sector selection to grab all nodes of ways,
    // which overflow currently selected sectors
    // We need this, so these sectors get initialized and have their position
    // set in 3D space
    measureFrom(`moreSectors`)
    const moreSectors = allNeighbors.reduce((more, currentSector) => {
      const overflowingWays = currentSector.nodes
        .filter(node => node.inWay)
        .reduce((ways, node) => {
          node.wayRefs.forEach(way => {
            // See if this way's other nodes overflow current sector
            if (way.nodes.some(node => node.sector !== currentSector)) {
              ways.push(way)
            }
          })
          return ways
        }, [] as MapWay[])

      // Get the list of sectors which contain overflowing nodes
      const moreSectors = overflowingWays.reduce(
        (result, way) => result.concat(way.nodes.map(node => node.sector)),
        [] as MapSectorBottom[]
      )

      return more.concat(moreSectors)
    }, [] as MapSectorBottom[])
    measureTo(`moreSectors`)

    allNeighbors.push(
      ...new Set(moreSectors.filter(sec => !allNeighbors.includes(sec)))
    )

    console.debug('sectors to bake:', allNeighbors.length)

    // 1. place these lat/lon sectors in 3D space
    mapController.layDownSectors(targetSector, allNeighbors.slice(1))

    // === Renderer decides if nodes and ways are "worthy" to be put in game space
    // === Proc gen methods are used to determine their "value"
    // === All data regarding nodes and ways are still preserved in mapController

    // 2. For each way, place it whole in 3D space
    allNeighbors.forEach(sector => {
      renderer.debugSector(sector)

      sector.ways.forEach(way => {
        way.renderedRef = renderer.addWay(way, sector)
      })
    })

    // 3. For each standalone node, place it in 3D space
    allNeighbors.forEach(sector => {
      const isTargetSector = sector === targetSector

      sector.nodes.forEach(node => {
        if (node.standalone) {
          node.renderedRef = renderer.addNode(
            node,
            isTargetSector ? 'node' : 'grid' + sector.idx
          )
        }
      })
    })

    // Put all that data to Renderer, sector by sector
    renderer
    // mapController.bake(
    //   renderer,
    //   mapData.bounds.centerLat,
    //   mapData.bounds.centerLon
    // )
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
