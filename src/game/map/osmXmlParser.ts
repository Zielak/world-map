import { parse } from 'fast-xml-parser'

import { measureFrom, measureTo } from '../../utils/benchmark'

import { parseNode, MapNodeList } from './nodes/nodes'
import { parseWay, filterWays, MapWayList, MapWay } from './ways/ways'
import { parseBounds, MapBounds } from './bounds'

export type ParsedMapData = {
  bounds: MapBounds
  nodesMap: MapNodeList
  waysMap: MapWayList
}

export const parseOSMXml = (xml: string): ParsedMapData => {
  measureFrom('parseOSMXml_parser')
  const data = parse(xml, {
    attributeNamePrefix: '$_',
    arrayMode: true,
    ignoreAttributes: false,
    parseAttributeValue: true
  })
  measureTo('parseOSMXml_parser')

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
