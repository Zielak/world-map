type GeodeticCoords = {
  latitude: number
  longitude: number
  altitude: number
}
type EcefCoords = {
  x: number
  y: number
  z: number
}
type NedCoords = {
  north: number
  east: number
  down: number
}
type EnuCoords = {
  east: number
  north: number
  up: number
}

// <bounds minlat="" ... />
type OSMBounds = {
  $_minlat: number
  $_minlon: number
  $_maxlat: number
  $_maxlon: number
}
type MapBounds = {
  minLat: number
  minLon: number
  maxLat: number
  maxLon: number
  centerLat: number
  centerLon: number
}

// <node id="123" ... />
type OSMNode = {
  $_id: number
  $_lat: number
  $_lon: number
  tag?: OSMTag[]
}
type MapNode = {
  id: number
  lat: number
  lon: number
  tags?: MapTags
}
type MapNodeList = Map<number, MapNode>

// <tag k="key" v="value" />
type OSMTag = {
  $_k: string
  $_v: number | string | boolean
}
type MapTags = {
  [k: string]: number | string | boolean
}

// <way id="202038798" ... />
type OSMNodeRef = {
  $_ref: number
}
type OSMWay = {
  $_id: number
  nd: OSMNodeRef[]
  tag?: OSMTag[]
}
type MapWay = {
  id: number
  nodes: MapNode[]
  tags?: MapTags
}
type MapWayList = Map<number, MapWay>

// ===============

type MinimapSectorProps = {
  x: number
  y: number
  bestLod: number
  terrains: number
  current: boolean
}

type EUpdateCurrentSector = {
  currentX: number
  currentY: number
  minimap: MinimapSectorProps[]
}
