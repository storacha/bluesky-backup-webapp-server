import { useQueryStates, createParser } from 'nuqs'

// we should have a union of values to expect in the url param so we can be rest-assured
// when wrong ui values are appended in the query
// we'll update this as time goes on
export type UiComponents = 'snapshots' | 'account' | 'keychain' | '' // we need to fallback to an empty string union here to accommodate the default value for the parser

export const uiComponentParser = createParser({
  parse: (value: string) => {
    if (value) return value as UiComponents
    return null
  },
  serialize: (value: UiComponents) => value,
})

export const useUiComponentStore = () => {
  const [uiStore, setUiStore] = useQueryStates({
    ui: uiComponentParser.withDefault(''),
  })

  return {
    store: uiStore,
    updateUiStore: setUiStore,
  }
}
