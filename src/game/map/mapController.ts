import { GeodeticConverter } from '../../utils/geodeticConverter'
import { Renderer } from '../renderer'

const isPolygon = (way: MapWay) =>
  way.nodes[0] === way.nodes[way.nodes.length - 1]

class MapController {
  geoConv: GeodeticConverter

  constructor(options: {}, private renderer: Renderer) {
    this.geoConv = new GeodeticConverter()
  }

  addWay(way: MapWay) {
    if (isPolygon(way)) {
      this.addPolygonWay(way)
    }
  }

  addPolygonWay(way: MapWay) {
    // Construct a polygon out of given nodes.

    way.nodes.forEach(node => {
      const { east, north, up } = this.geoConv.geodetic2Enu(
        node.lat,
        node.lon,
        0
      )

      this.renderer.addNode(node.id, east, up, north)
    })
  }
}

export { MapController }
