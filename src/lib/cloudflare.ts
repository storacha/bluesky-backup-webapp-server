

export interface ListResult {
  keys: {name: string}[]
}

export interface KVNamespace {
  put: (...p: unknown[]) => unknown
  get: (g: unknown) => string
  delete: (d: unknown) => void
  list: (l: unknown) => Promise<ListResult>
}

function newKvNamespace(): KVNamespace {
  return {
    put: (...args) => {
      console.log(args)
    }, 
    get: (k) => {
      console.log(k)
      return "{}"
    },

    delete: (d) => {
      console.log(d)
    },

    list: async (k) => {
      console.log(k)
      return {keys: []}
    }
  }
}

export function getCloudflareContext () {
  return {
    env: {
      DB: {
        prepare: (p: unknown) => {
          console.log(p)
          return ({
            bind: (...b: unknown[]) => {
              console.log(b)
              return {
                first: async () => {
                  return ({
                    id: 'abc123'
                  })
                },
                all: async <T>(): Promise<{results: T[]}> => {
                  return {results: []}
                }
              }
            }
          })
        }
      },

      BLUESKY_AUTH_SESSION_STORE: newKvNamespace(),
      BLUESKY_AUTH_STATE_STORE: newKvNamespace()
    }
  }
}