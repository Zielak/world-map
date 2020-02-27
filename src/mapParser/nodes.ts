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

// export const ignoreNode = (node: OSMNode): boolean => {
//   const hasIgnoredTags = node.tags.some(tag => {
//     tag.key
//   })
// }
