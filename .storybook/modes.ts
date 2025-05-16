export const allModes = {
  default: {
    viewport: 1280,
  },
  iphone16: {
    viewport: 393,
  },
}

/**
 * Gets a subset of the available modes.
 */
export const modes = (modeNames: (keyof typeof allModes)[]) => {
  return modeNames.reduce<Partial<typeof allModes>>((acc, name) => {
    return {
      ...acc,
      [name]: allModes[name],
    }
  }, {})
}
