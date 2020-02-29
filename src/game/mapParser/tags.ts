/**
 * Convert all OSM tags to one object with key/values
 * @param tags
 */
export const simplifyTags = (tags: OSMTag[]): MapTags => {
  return tags.reduce((result, tag) => {
    result[tag.$_k] = tag.$_v
    return result
  }, {})
}
