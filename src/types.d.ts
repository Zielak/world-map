type TerrainGenerator = (x: number, y: number) => number
type TerrainLayer = TerrainGenerator[]

// <node id="123" ... />
type OSMNode = {
  id: number
  uid: number
  lat: number
  lon: number
  tags?: OSMTag[]
}

// <tag k="key" v="value" />
type OSMTag = {
  key: string
  value: number | string | boolean
}

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
