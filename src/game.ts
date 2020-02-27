import { Viewport } from './game/viewport'
import { TerrainController } from './terrain/terrainController'

const viewport = new Viewport()
const terrainController = new TerrainController(
  {
    sectorSizeX: 200,
    sectorSizeY: 200,
    LODDistanceModifiers: [2, 3, 5, 40],
    initialPlayerPos: viewport.webVRCamera.position
  },
  viewport.scene
)

window['viewport'] = viewport
window['terrain'] = terrainController

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
