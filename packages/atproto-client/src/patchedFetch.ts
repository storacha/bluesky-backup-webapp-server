// From: https://gist.github.com/kaytwo/d5e553a6fce20e28f6d5573a520fb525

// Preserve the original Request constructor
const OriginalRequest = globalThis.Request

// Create a custom Request constructor
class CustomRequest extends OriginalRequest {
  constructor(input: RequestInfo, init?: RequestInit) {
    // Sanitize the `init` object to handle unsupported fields
    const sanitizedInit = CustomRequest.sanitizeRequestInit(init)

    // Call the original constructor with the sanitized init
    super(input, sanitizedInit)
  }

  // Static method to sanitize the RequestInit object
  private static sanitizeRequestInit(
    init: RequestInit | undefined
  ): RequestInit {
    if (!init) {
      return {}
    }

    // Destructure and handle unsupported fields
    const { cache, redirect, ...rest } = init

    // Log warnings for unsupported or adjusted fields
    if (cache) {
      console.debug(
        `The 'cache' field is not supported in Cloudflare Workers and will be ignored.`
      )
    }

    if (redirect === 'error') {
      console.debug(
        `Sanitizing Request constructor: the 'redirect: "error"' option is not supported in Cloudflare Workers. Using 'redirect: "manual"' instead.`
      )
      ;(rest as RequestInit).redirect = 'manual' // Replace with 'manual'
    } else if (redirect) {
      ;(rest as RequestInit).redirect = redirect // Retain other valid redirect options
    }

    return rest // Return sanitized RequestInit object
  }
}
globalThis.Request = CustomRequest as unknown as typeof Request

const originalFetch = globalThis.fetch
globalThis.fetch = async function patchedFetch(
  ...args: Parameters<typeof fetch>
) {
  if (args[1]) {
    if (args[1].redirect === 'error') {
      console.debug(
        `sanitizing fetch: The 'redirect: "error"' option is not supported in Cloudflare Workers. Using 'redirect: "manual"' instead.`
      )
      args[1].redirect = 'manual'
    }
  }

  return originalFetch(...args)
}
