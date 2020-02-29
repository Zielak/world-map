import { simplifyTags } from './tags'

const tagsWhitelist = [
  'crossing',
  'highway',
  'lanes',
  'amenity',
  'barrier',
  'landuse',
  'surface'
]
const tagsValuesBlacklist = new Map([['highway', ['footway']]])

const filterWhitelistedTags = (tag: OSMTag): boolean => {
  return tagsWhitelist.includes(tag.$_k)
}

const hasBlacklistedTagValues = (way: MapWay): boolean => {
  if (!way.tags) return false

  return Object.keys(way.tags)
    .filter(key => tagsValuesBlacklist.has(key))
    .some(key =>
      tagsValuesBlacklist.get(key).includes(way.tags[key].toString())
    )
}

/**
 * Convert OSM way to the way with references to already parsed Nodes.
 */
export const parseWay = (way: OSMWay, nodes: MapNodeList): MapWay => {
  const parsedWay: MapWay = {
    id: way.$_id,
    nodes: way.nd.map(nd => nodes.get(nd.$_ref))
  }

  // Strip useless tags, if any
  if (way.tag) {
    const tags = way.tag.filter(filterWhitelistedTags)
    if (tags.length > 0) {
      parsedWay.tags = simplifyTags(tags)
    }
  }

  return parsedWay
}

/**
 * Filter out uninteresting ways, or without any tags
 * @param way
 */
export const filterWays = (way: MapWay): boolean => {
  const hasAnyTags = way.tags && Object.keys(way.tags).length > 0
  const hasBlacklistedTags = hasBlacklistedTagValues(way)

  return hasAnyTags && !hasBlacklistedTags
}
