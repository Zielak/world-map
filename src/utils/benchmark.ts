/**
 * @param {string} name name of the mark
 */
export const mark = name => {
  performance.mark(`🗺_${name}`)
}

export const measureFrom = name => {
  performance.mark(`🗺_${name}_start`)
}

export const measureTo = name => {
  performance.mark(`🗺_${name}_end`)
  performance.measure(`🗺_${name}`, `🗺_${name}_start`, `🗺_${name}_end`)
}
