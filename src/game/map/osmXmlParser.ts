import { parse } from 'fast-xml-parser'
import { parseNode, MapNodeList } from './nodes'
import { parseWay, filterWays, MapWayList, MapWay } from './ways'
import { parseBounds, MapBounds } from './bounds'

export const parseOSMXml = (xml: string) => {
  const data = parse(xml, {
    attributeNamePrefix: '$_',
    arrayMode: true,
    ignoreAttributes: false,
    parseAttributeValue: true
  })

  const bounds: MapBounds = parseBounds(data.osm[0].bounds[0])

  const nodesMap: MapNodeList = new Map(
    data.osm[0].node?.map(node => [node.$_id, parseNode(node)])
  )
  const waysMap: MapWayList = new Map(
    data.osm[0].way
      ?.map(way => parseWay(way, nodesMap))
      .filter(filterWays)
      .map((way: MapWay) => [way.id, way])
  )

  return {
    bounds,
    nodesMap,
    waysMap
  }
}
