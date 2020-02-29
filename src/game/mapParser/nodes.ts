import { simplifyTags } from './tags'

// Nodes with these tags are very important
const tagsKeepers = {
  amenity: ['parking'],
  barrier: [
    'fence',
    'wall',
    'gate',
    'bollard',
    'retaining_wall',
    'ditch',
    'city_wall'
  ],
  building: [],
  highway: [],
  power: ['tower', 'pole', 'generator', 'line'],
  natural: ['tree', 'water', 'wood', 'scrub', 'wetland', 'grassland', 'peak']
}

// Nodes with these tags should NOT be remembered
const tagsBlacklist = {
  tram: []
}

// Only tags with these key names will be remembered
const tagAmenitiesWhitelist = ['shelter_type']
const tagsWhitelist = [
  'crossing',
  'highway',
  'amenity',
  'barrier',
  'landuse',
  'surface'
]

const filterTags = (tag: OSMTag): boolean => {
  if (tagsWhitelist.includes(tag.$_k)) {
    return true
  }
  return false
}

export const parseNode = (node: OSMNode): MapNode => {
  // Strip useless node attributes
  const parsedNode: MapNode = {
    id: node.$_id,
    lat: node.$_lat,
    lon: node.$_lon
  }

  // Strip useless tags, if any
  if (node.tag) {
    const tags = node.tag.filter(filterTags)
    if (tags.length > 0) {
      parsedNode.tags = simplifyTags(tags)
    }
  }

  return parsedNode
}

/**
 * Filter out uninteresting ways, or without any tags
 * @param way
 */
// export const filterNodes = (node: MapNode): boolean => {
//   if()
// }
