// <bounds minlat="" ... />
type OSMBounds = {
  $_minlat: number
  $_minlon: number
  $_maxlat: number
  $_maxlon: number
}

// <node id="123" ... />
type OSMNode = {
  $_id: number
  $_lat: number
  $_lon: number
  tag?: OSMTag[]
}

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
