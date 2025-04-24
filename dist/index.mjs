import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 6129:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

(__nccwpck_require__(3142).config)()


/***/ }),

/***/ 5725:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(6928)

const conventions = __nccwpck_require__(8213)
const dotenvOptionPaths = __nccwpck_require__(6136)
const DeprecationNotice = __nccwpck_require__(3071)

function buildEnvs (options, DOTENV_KEY = undefined) {
  // build envs using user set option.path
  const optionPaths = dotenvOptionPaths(options) // [ '.env' ]

  let envs = []
  if (options.convention) { // handle shorthand conventions
    envs = conventions(options.convention).concat(envs)
  }

  new DeprecationNotice({ DOTENV_KEY }).dotenvKey() // DEPRECATION NOTICE

  for (const optionPath of optionPaths) {
    // if DOTENV_KEY is set then assume we are checking envVaultFile
    if (DOTENV_KEY) {
      envs.push({
        type: 'envVaultFile',
        value: path.join(path.dirname(optionPath), '.env.vault')
      })
    } else {
      envs.push({ type: 'envFile', value: optionPath })
    }
  }

  return envs
}

module.exports = buildEnvs


/***/ }),

/***/ 9548:
/***/ ((module) => {

function chomp (value) {
  return value.replace(/[\r\n]+$/, '')
}

module.exports = chomp


/***/ }),

/***/ 7269:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { WriteStream } = __nccwpck_require__(2018)

const getColorDepth = () => {
  try {
    return WriteStream.prototype.getColorDepth()
  } catch (error) {
    const term = process.env.TERM

    if (term && (term.includes('256color') || term.includes('xterm'))) {
      return 8 // 256 colors
    }

    return 4
  }
}

module.exports = { getColorDepth }


/***/ }),

/***/ 8213:
/***/ ((module) => {

function conventions (convention) {
  const env = process.env.DOTENV_ENV || process.env.NODE_ENV || 'development'

  if (convention === 'nextjs') {
    const canonicalEnv = ['development', 'test', 'production'].includes(env) && env

    return [
      canonicalEnv && { type: 'envFile', value: `.env.${canonicalEnv}.local` },
      canonicalEnv !== 'test' && { type: 'envFile', value: '.env.local' },
      canonicalEnv && { type: 'envFile', value: `.env.${canonicalEnv}` },
      { type: 'envFile', value: '.env' }
    ].filter(Boolean)
  } else if (convention === 'flow') {
    return [
      { type: 'envFile', value: `.env.${env}.local` },
      { type: 'envFile', value: `.env.${env}` },
      { type: 'envFile', value: '.env.local' },
      { type: 'envFile', value: '.env' },
      { type: 'envFile', value: '.env.defaults' }
    ]
  } else {
    throw new Error(`INVALID_CONVENTION: '${convention}'. permitted conventions: ['nextjs', 'flow']`)
  }
}

module.exports = conventions


/***/ }),

/***/ 9780:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const dotenv = __nccwpck_require__(6705)

const parseEncryptionKeyFromDotenvKey = __nccwpck_require__(8523)

function decrypt (ciphertext, dotenvKey) {
  const key = parseEncryptionKeyFromDotenvKey(dotenvKey)

  try {
    return dotenv.decrypt(ciphertext, key)
  } catch (e) {
    if (e.code === 'DECRYPTION_FAILED') {
      const error = new Error('[DECRYPTION_FAILED] Unable to decrypt .env.vault with DOTENV_KEY.')
      error.code = 'DECRYPTION_FAILED'
      error.help = '[DECRYPTION_FAILED] Run with debug flag [dotenvx run --debug -- yourcommand] or manually run [echo $DOTENV_KEY] to compare it to the one in .env.keys.'
      error.debug = `[DECRYPTION_FAILED] DOTENV_KEY is ${dotenvKey}`
      throw error
    }

    if (e.code === 'ERR_CRYPTO_INVALID_AUTH_TAG') {
      const error = new Error('[INVALID_CIPHERTEXT] Unable to decrypt what appears to be invalid ciphertext.')
      error.code = 'INVALID_CIPHERTEXT'
      error.help = '[INVALID_CIPHERTEXT] Run with debug flag [dotenvx run --debug -- yourcommand] or manually check .env.vault.'
      error.debug = `[INVALID_CIPHERTEXT] ciphertext is '${ciphertext}'`
      throw error
    }

    throw e
  }
}

module.exports = decrypt


/***/ }),

/***/ 7652:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { decrypt } = __nccwpck_require__(8162)

const Errors = __nccwpck_require__(5934)

const PREFIX = 'encrypted:'

function decryptKeyValue (key, value, privateKeyName, privateKey) {
  let decryptedValue
  let decryptionError

  if (!value.startsWith(PREFIX)) {
    return value
  }

  privateKey = privateKey || ''
  if (privateKey.length <= 0) {
    decryptionError = new Errors({ key, privateKeyName, privateKey }).missingPrivateKey()
  } else {
    const privateKeys = privateKey.split(',')
    for (const privKey of privateKeys) {
      const secret = Buffer.from(privKey, 'hex')
      const encoded = value.substring(PREFIX.length)
      const ciphertext = Buffer.from(encoded, 'base64')

      try {
        decryptedValue = decrypt(secret, ciphertext).toString()
        decryptionError = null // reset to null error (scenario for multiple private keys)
        break
      } catch (e) {
        if (e.message === 'Invalid private key') {
          decryptionError = new Errors({ key, privateKeyName, privateKey }).invalidPrivateKey()
        } else if (e.message === 'Unsupported state or unable to authenticate data') {
          decryptionError = new Errors({ key, privateKeyName, privateKey }).looksWrongPrivateKey()
        } else if (e.message === 'Point of length 65 was invalid. Expected 33 compressed bytes or 65 uncompressed bytes') {
          decryptionError = new Errors({ key, privateKeyName, privateKey }).malformedEncryptedData()
        } else {
          decryptionError = new Errors({ key, privateKeyName, privateKey, message: e.message }).decryptionFailed()
        }
      }
    }
  }

  if (decryptionError) {
    throw decryptionError
  }

  return decryptedValue
}

module.exports = decryptKeyValue


/***/ }),

/***/ 3071:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { logger } = __nccwpck_require__(7885)

class DeprecationNotice {
  constructor (options = {}) {
    this.DOTENV_KEY = options.DOTENV_KEY || process.env.DOTENV_KEY
  }

  dotenvKey () {
    if (this.DOTENV_KEY) {
      logger.warn('[DEPRECATION NOTICE] Setting DOTENV_KEY with .env.vault is deprecated.')
      logger.warn('[DEPRECATION NOTICE] Run [dotenvx ext vault migrate] for instructions on converting your .env.vault file to encrypted .env files (using public key encryption algorithm secp256k1)')
      logger.warn('[DEPRECATION NOTICE] Read more at [https://github.com/dotenvx/dotenvx/blob/main/CHANGELOG.md#0380]')
    }
  }
}

module.exports = DeprecationNotice


/***/ }),

/***/ 9375:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(9896)

function detectEncoding (filepath) {
  const buffer = fs.readFileSync(filepath)

  // check for UTF-16LE BOM (Byte Order Mark)
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return 'utf16le'
  }

  /* c8 ignore start */
  // check for UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return 'utf8'
  }

  /* c8 ignore stop */

  return 'utf8'
}

module.exports = detectEncoding


/***/ }),

/***/ 580:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const dotenvPrivateKeyNames = __nccwpck_require__(2185)
const guessPrivateKeyFilename = __nccwpck_require__(7635)

const TYPE_ENV_FILE = 'envFile'
const TYPE_ENV_VAULT_FILE = 'envVaultFile'
const DEFAULT_ENVS = [{ type: TYPE_ENV_FILE, value: '.env' }]
const DEFAULT_ENV_VAULTS = [{ type: TYPE_ENV_VAULT_FILE, value: '.env.vault' }]

function determineEnvsFromDotenvPrivateKey (privateKeyNames) {
  const envs = []

  for (const privateKeyName of privateKeyNames) {
    const filename = guessPrivateKeyFilename(privateKeyName)
    envs.push({ type: TYPE_ENV_FILE, value: filename })
  }

  return envs
}

function determineEnvs (envs = [], processEnv, DOTENV_KEY = '') {
  const privateKeyNames = dotenvPrivateKeyNames(processEnv)
  if (!envs || envs.length <= 0) {
    // if process.env.DOTENV_PRIVATE_KEY or process.env.DOTENV_PRIVATE_KEY_${environment} is set, assume inline encryption methodology
    if (privateKeyNames.length > 0) {
      return determineEnvsFromDotenvPrivateKey(privateKeyNames)
    }

    if (DOTENV_KEY.length > 0) {
      // if DOTENV_KEY is set then default to look for .env.vault file
      return DEFAULT_ENV_VAULTS
    } else {
      return DEFAULT_ENVS // default to .env file expectation
    }
  } else {
    let fileAlreadySpecified = false // can be .env or .env.vault type

    for (const env of envs) {
      // if DOTENV_KEY set then we are checking if a .env.vault file is already specified
      if (DOTENV_KEY.length > 0 && env.type === TYPE_ENV_VAULT_FILE) {
        fileAlreadySpecified = true
      }

      // if DOTENV_KEY not set then we are checking if a .env file is already specified
      if (DOTENV_KEY.length <= 0 && env.type === TYPE_ENV_FILE) {
        fileAlreadySpecified = true
      }
    }

    // return early since envs array objects already contain 1 .env.vault or .env file
    if (fileAlreadySpecified) {
      return envs
    }

    // no .env.vault or .env file specified as a flag so we assume either .env.vault (if dotenv key is set) or a .env file
    if (DOTENV_KEY.length > 0) {
      // if DOTENV_KEY is set then default to look for .env.vault file
      return [...DEFAULT_ENV_VAULTS, ...envs]
    } else {
      // if no DOTENV_KEY then default to look for .env file
      return [...DEFAULT_ENVS, ...envs]
    }
  }
}

module.exports = determineEnvs


/***/ }),

/***/ 6136:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const resolveHome = __nccwpck_require__(1262)

function dotenvOptionPaths (options) {
  let optionPaths = []

  if (options && options.path) {
    if (!Array.isArray(options.path)) {
      optionPaths = [resolveHome(options.path)]
    } else {
      optionPaths = [] // reset default

      for (const filepath of options.path) {
        optionPaths.push(resolveHome(filepath))
      }
    }
  }

  return optionPaths
}

module.exports = dotenvOptionPaths


/***/ }),

/***/ 5708:
/***/ ((module) => {

// historical dotenv.parse - https://github.com/motdotla/dotenv)
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

function dotenvParse (src, skipExpandForDoubleQuotes = false, skipConvertingWindowsNewlines = false, collectAllValues = false) {
  const obj = {}

  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  if (!skipConvertingWindowsNewlines) {
    lines = lines.replace(/\r\n?/mg, '\n')
  }

  let match
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"' && !skipExpandForDoubleQuotes) {
      value = value.replace(/\\n/g, '\n') // newline
      value = value.replace(/\\r/g, '\r') // carriage return
      value = value.replace(/\\t/g, '\t') // tabs
    }

    if (collectAllValues) {
      // handle scenario where user mistakenly includes plaintext duplicate in .env:
      //
      // # .env
      // HELLO="World"
      // HELLO="enrypted:1234"
      obj[key] = obj[key] || []
      obj[key].push(value)
    } else {
      // Add to object
      obj[key] = value
    }
  }

  return obj
}

module.exports = dotenvParse


/***/ }),

/***/ 2185:
/***/ ((module) => {

const PRIVATE_KEY_NAME_SCHEMA = 'DOTENV_PRIVATE_KEY'

function dotenvPrivateKeyNames (processEnv) {
  return Object.keys(processEnv).filter(key => key.startsWith(PRIVATE_KEY_NAME_SCHEMA))
}

module.exports = dotenvPrivateKeyNames


/***/ }),

/***/ 7:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { encrypt } = __nccwpck_require__(8162)

const PREFIX = 'encrypted:'

function encryptValue (value, publicKey) {
  const ciphertext = encrypt(publicKey, Buffer.from(value))
  const encoded = Buffer.from(ciphertext, 'hex').toString('base64') // base64 encode ciphertext

  return `${PREFIX}${encoded}`
}

module.exports = encryptValue


/***/ }),

/***/ 5934:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const truncate = __nccwpck_require__(3599)

class Errors {
  constructor (options = {}) {
    this.filepath = options.filepath
    this.envFilepath = options.envFilepath

    this.key = options.key
    this.privateKey = options.privateKey
    this.privateKeyName = options.privateKeyName
    this.command = options.command

    this.message = options.message
  }

  missingEnvFile () {
    const code = 'MISSING_ENV_FILE'
    const message = `[${code}] missing ${this.envFilepath} file (${this.filepath})`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/484`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  missingKey () {
    const code = 'MISSING_KEY'
    const message = `[${code}] missing ${this.key} key`

    const e = new Error(message)
    e.code = code
    return e
  }

  missingPrivateKey () {
    const code = 'MISSING_PRIVATE_KEY'
    const message = `[${code}] could not decrypt ${this.key} using private key '${this.privateKeyName}=${truncate(this.privateKey)}'`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/464`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  invalidPrivateKey () {
    const code = 'INVALID_PRIVATE_KEY'
    const message = `[${code}] could not decrypt ${this.key} using private key '${this.privateKeyName}=${truncate(this.privateKey)}'`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/465`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  looksWrongPrivateKey () {
    const code = 'WRONG_PRIVATE_KEY'
    const message = `[${code}] could not decrypt ${this.key} using private key '${this.privateKeyName}=${truncate(this.privateKey)}'`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/466`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  malformedEncryptedData () {
    const code = 'MALFORMED_ENCRYPTED_DATA'
    const message = `[${code}] could not decrypt ${this.key} because encrypted data appears malformed`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/467`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }

  decryptionFailed () {
    const code = 'DECRYPTION_FAILED'
    const message = this.message

    const e = new Error(message)
    e.code = code
    return e
  }

  commandSubstitutionFailed () {
    const code = 'COMMAND_SUBSTITUTION_FAILED'
    const message = `[${code}] could not eval ${this.key} containing command '${this.command}': ${this.message}`
    const help = `[${code}] https://github.com/dotenvx/dotenvx/issues/532`

    const e = new Error(message)
    e.code = code
    e.help = help
    return e
  }
}

module.exports = Errors


/***/ }),

/***/ 6096:
/***/ ((module) => {

function escapeDollarSigns (str) {
  return str.replace(/\$/g, '$$$$')
}

module.exports = escapeDollarSigns


/***/ }),

/***/ 5404:
/***/ ((module) => {

function escapeForRegex (str) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

module.exports = escapeForRegex


/***/ }),

/***/ 2735:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { execSync } = __nccwpck_require__(5317)
const chomp = __nccwpck_require__(9548)
const Errors = __nccwpck_require__(5934)

function evalKeyValue (key, value, processEnv, runningParsed) {
  // Match everything between the outermost $() using a regex with non-capturing groups
  const matches = value.match(/\$\(([^)]+(?:\)[^(]*)*)\)/g) || []
  return matches.reduce((newValue, match) => {
    const command = match.slice(2, -1) // Extract command by removing $() wrapper
    let result

    try {
      result = execSync(command, { env: { ...processEnv, ...runningParsed } }).toString() // execute command (including runningParsed)
    } catch (e) {
      throw new Errors({ key, command, message: e.message.trim() }).commandSubstitutionFailed()
    }

    result = chomp(result) // chomp it
    return newValue.replace(match, result) // Replace match with result
  }, value)
}

module.exports = evalKeyValue


/***/ }),

/***/ 8232:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)

const RESERVED_ENV_FILES = ['.env.vault', '.env.project', '.env.keys', '.env.me', '.env.x', '.env.example']

function findEnvFiles (directory) {
  try {
    const files = fsx.readdirSync(directory)
    const envFiles = files.filter(file =>
      file.startsWith('.env') &&
      !file.endsWith('.previous') &&
      !RESERVED_ENV_FILES.includes(file)
    )

    return envFiles
  } catch (e) {
    if (e.code === 'ENOENT') {
      const error = new Error(`missing directory (${directory})`)
      error.code = 'MISSING_DIRECTORY'

      throw error
    } else {
      throw e
    }
  }
}

module.exports = findEnvFiles


/***/ }),

/***/ 7968:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// helpers
const guessPrivateKeyName = __nccwpck_require__(9357)
const ProKeypair = __nccwpck_require__(3667)

// services
const Keypair = __nccwpck_require__(1367)

function findPrivateKey (envFilepath, envKeysFilepath = null) {
  // use path/to/.env.${environment} to generate privateKeyName
  const privateKeyName = guessPrivateKeyName(envFilepath)

  const proKeypairs = new ProKeypair(envFilepath).run() // TODO: implement custom envKeysFilepath
  const keypairs = new Keypair(envFilepath, envKeysFilepath).run()

  return proKeypairs[privateKeyName] || keypairs[privateKeyName]
}

module.exports = findPrivateKey


/***/ }),

/***/ 5356:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// helpers
const guessPublicKeyName = __nccwpck_require__(6093)
const ProKeypair = __nccwpck_require__(3667)

// services
const Keypair = __nccwpck_require__(1367)

function findPublicKey (envFilepath) {
  const publicKeyName = guessPublicKeyName(envFilepath)

  const proKeypairs = new ProKeypair(envFilepath).run()
  const keypairs = new Keypair(envFilepath).run()

  return proKeypairs[publicKeyName] || keypairs[publicKeyName]
}

module.exports = findPublicKey


/***/ }),

/***/ 7620:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(9896)

const ENCODING = 'utf8'

function readFileX (filepath, encoding = null) {
  if (!encoding) {
    encoding = ENCODING
  }

  return fs.readFileSync(filepath, encoding) // utf8 default so it returns a string
}

function writeFileX (filepath, str) {
  return fs.writeFileSync(filepath, str, ENCODING) // utf8 always
}

const fsx = {
  chmodSync: fs.chmodSync,
  existsSync: fs.existsSync,
  readdirSync: fs.readdirSync,
  readFileSync: fs.readFileSync,
  writeFileSync: fs.writeFileSync,
  appendFileSync: fs.appendFileSync,

  // fsx special commands
  readFileX,
  writeFileX
}

module.exports = fsx


/***/ }),

/***/ 4943:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(6928)

function guessEnvironment (filepath) {
  const filename = path.basename(filepath)

  const parts = filename.split('.')
  const possibleEnvironmentList = [...parts.slice(2)]

  if (possibleEnvironmentList.length === 0) {
    // handle .env1 -> development1
    const environment = filename.replace('.env', 'development')

    return environment
  }

  if (possibleEnvironmentList.length === 1) {
    return possibleEnvironmentList[0]
  }

  if (
    possibleEnvironmentList.length === 2
  ) {
    return possibleEnvironmentList.join('_')
  }

  return possibleEnvironmentList.slice(0, 2).join('_')
}

module.exports = guessEnvironment


/***/ }),

/***/ 7635:
/***/ ((module) => {

const PREFIX = 'DOTENV_PRIVATE_KEY'

function guessPrivateKeyFilename (privateKeyName) {
  // .env
  if (privateKeyName === PREFIX) {
    return '.env'
  }

  const filenameSuffix = privateKeyName.substring(`${PREFIX}_`.length).split('_').join('.').toLowerCase()
  // .env.ENVIRONMENT

  return `.env.${filenameSuffix}`
}

module.exports = guessPrivateKeyFilename


/***/ }),

/***/ 9357:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(6928)
const guessEnvironment = __nccwpck_require__(4943)

function guessPrivateKeyName (filepath) {
  const filename = path.basename(filepath).toLowerCase()

  // .env
  if (filename === '.env') {
    return 'DOTENV_PRIVATE_KEY'
  }

  // .env.ENVIRONMENT
  const environment = guessEnvironment(filename)

  return `DOTENV_PRIVATE_KEY_${environment.toUpperCase()}`
}

module.exports = guessPrivateKeyName


/***/ }),

/***/ 6093:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(6928)
const guessEnvironment = __nccwpck_require__(4943)

function guessPublicKeyName (filepath) {
  const filename = path.basename(filepath).toLowerCase()

  // .env
  if (filename === '.env') {
    return 'DOTENV_PUBLIC_KEY'
  }

  // .env.ENVIRONMENT
  const environment = guessEnvironment(filename)

  return `DOTENV_PUBLIC_KEY_${environment.toUpperCase()}`
}

module.exports = guessPublicKeyName


/***/ }),

/***/ 4545:
/***/ ((module) => {

const ENCRYPTION_PATTERN = /^encrypted:.+/

function isEncrypted (value) {
  return ENCRYPTION_PATTERN.test(value)
}

module.exports = isEncrypted


/***/ }),

/***/ 4386:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)
const ignore = __nccwpck_require__(2146)

function isIgnoringDotenvKeys () {
  if (!fsx.existsSync('.gitignore')) {
    return false
  }

  const gitignore = fsx.readFileX('.gitignore')
  const ig = ignore(gitignore).add(gitignore)

  if (!ig.ignores('.env.keys')) {
    return false
  }

  return true
}

module.exports = isIgnoringDotenvKeys


/***/ }),

/***/ 9262:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { PrivateKey } = __nccwpck_require__(8162)

function keypair (existingPrivateKey) {
  let kp

  if (existingPrivateKey) {
    kp = new PrivateKey(Buffer.from(existingPrivateKey, 'hex'))
  } else {
    kp = new PrivateKey()
  }

  const publicKey = kp.publicKey.toHex()
  const privateKey = kp.secret.toString('hex')

  return {
    publicKey,
    privateKey
  }
}

module.exports = keypair


/***/ }),

/***/ 9003:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { name, version, description } = __nccwpck_require__(496)

module.exports = { name, version, description }


/***/ }),

/***/ 3502:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const decryptKeyValue = __nccwpck_require__(7652)
const evalKeyValue = __nccwpck_require__(2735)
const resolveEscapeSequences = __nccwpck_require__(8258)

class Parse {
  static LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

  constructor (src, privateKey = null, processEnv = process.env, overload = false, privateKeyName = null) {
    this.src = src
    this.privateKey = privateKey
    this.privateKeyName = privateKeyName
    this.processEnv = processEnv
    this.overload = overload

    this.parsed = {}
    this.preExisted = {}
    this.injected = {}
    this.errors = []

    // for use with progressive expansion
    this.runningParsed = {}
    // for use with stopping expansion for literals
    this.literals = {}
  }

  run () {
    const lines = this.getLines()

    let match
    while ((match = Parse.LINE.exec(lines)) !== null) {
      const key = match[1]
      const value = match[2]
      const quote = this.quote(value) // must be raw match
      this.parsed[key] = this.clean(value, quote) // file value

      if (!this.overload && this.inProcessEnv(key)) {
        this.parsed[key] = this.processEnv[key] // use process.env pre-existing value
      }

      // decrypt
      try {
        this.parsed[key] = this.decrypt(key, this.parsed[key])
      } catch (e) {
        this.errors.push(e)
      }

      // eval empty, double, or backticks
      let evaled = false
      if (quote !== "'" && (!this.inProcessEnv(key) || this.processEnv[key] === this.parsed[key])) {
        const priorEvaled = this.parsed[key]
        // eval
        try {
          this.parsed[key] = this.eval(key, priorEvaled)
        } catch (e) {
          this.errors.push(e)
        }
        if (priorEvaled !== this.parsed[key]) {
          evaled = true
        }
      }

      // expand empty, double, or backticks
      if (!evaled && quote !== "'" && (!this.processEnv[key] || this.overload)) {
        this.parsed[key] = resolveEscapeSequences(this.expand(this.parsed[key]))
      }

      if (quote === "'") {
        this.literals[key] = this.parsed[key]
      }

      // for use with progressive expansion
      this.runningParsed[key] = this.parsed[key]

      if (Object.prototype.hasOwnProperty.call(this.processEnv, key) && !this.overload) {
        this.preExisted[key] = this.processEnv[key] // track preExisted
      } else {
        this.injected[key] = this.parsed[key] // track injected
      }
    }

    return {
      parsed: this.parsed,
      processEnv: this.processEnv,
      injected: this.injected,
      preExisted: this.preExisted,
      errors: this.errors
    }
  }

  trimmer (value) {
    // Default undefined or null to empty string
    return (value || '').trim()
  }

  quote (value) {
    const v = this.trimmer(value)
    const maybeQuote = v[0]
    let q = ''
    switch (maybeQuote) {
      // single
      case "'":
        q = "'"
        break
      // double
      case '"':
        q = '"'
        break
      // backtick
      case '`':
        q = '`'
        break
      // empty
      default:
        q = ''
    }

    return q
  }

  clean (value, _quote) {
    let v = this.trimmer(value)

    // Remove surrounding quotes
    v = v.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    // Expand newlines if double quoted
    if (_quote === '"') {
      v = v.replace(/\\n/g, '\n') // newline
      v = v.replace(/\\r/g, '\r') // carriage return
      v = v.replace(/\\t/g, '\t') // tabs
    }

    return v
  }

  decrypt (key, value) {
    return decryptKeyValue(key, value, this.privateKeyName, this.privateKey)
  }

  eval (key, value) {
    return evalKeyValue(key, value, this.processEnv, this.runningParsed)
  }

  expand (value) {
    let env = { ...this.runningParsed, ...this.processEnv } // typically process.env wins
    if (this.overload) {
      env = { ...this.processEnv, ...this.runningParsed } // parsed wins
    }

    const regex = /(?<!\\)\${([^{}]+)}|(?<!\\)\$([A-Za-z_][A-Za-z0-9_]*)/g

    let result = value
    let match

    while ((match = regex.exec(result)) !== null) {
      const [template, bracedExpression, unbracedExpression] = match
      const expression = bracedExpression || unbracedExpression

      // match the operators `:+`, `+`, `:-`, and `-`
      const opRegex = /(:\+|\+|:-|-)/
      // find first match
      const opMatch = expression.match(opRegex)
      const splitter = opMatch ? opMatch[0] : null

      const r = expression.split(splitter)

      let defaultValue
      let value
      const key = r.shift()

      if ([':+', '+'].includes(splitter)) {
        defaultValue = env[key] ? r.join(splitter) : ''
        value = null
      } else {
        defaultValue = r.join(splitter)
        value = env[key]
      }

      if (value) {
        result = result.replace(template, value)
      } else {
        result = result.replace(template, defaultValue)
      }

      // if the result equaled what was in env then stop expanding - handle self-referential check as well
      if (result === env[key]) {
        break
      }

      // if the result came from what was a literal value then stop expanding
      if (this.literals[key]) {
        break
      }

      regex.lastIndex = 0 // reset regex search position to re-evaluate after each replacement
    }

    return result
  }

  inProcessEnv (key) {
    return Object.prototype.hasOwnProperty.call(this.processEnv, key)
  }

  getLines () {
    return (this.src || '').toString().replace(/\r\n?/mg, '\n') // Convert buffer to string and Convert line breaks to same format
  }
}

module.exports = Parse


/***/ }),

/***/ 8523:
/***/ ((module) => {

function parseEncryptionKeyFromDotenvKey (dotenvKey) {
  // Parse DOTENV_KEY. Format is a URI
  let uri
  try {
    uri = new URL(dotenvKey)
  } catch (e) {
    throw new Error('INVALID_DOTENV_KEY: Incomplete format. It should be a dotenv uri. (dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development)')
  }

  // Get decrypt key
  const key = uri.password
  if (!key) {
    throw new Error('INVALID_DOTENV_KEY: Missing key part')
  }

  return Buffer.from(key.slice(-64), 'hex')
}

module.exports = parseEncryptionKeyFromDotenvKey


/***/ }),

/***/ 1080:
/***/ ((module) => {

function parseEnvironmentFromDotenvKey (dotenvKey) {
  // Parse DOTENV_KEY. Format is a URI
  let uri
  try {
    uri = new URL(dotenvKey)
  } catch (e) {
    throw new Error(`INVALID_DOTENV_KEY: ${e.message}`)
  }

  // Get environment
  const environment = uri.searchParams.get('environment')
  if (!environment) {
    throw new Error('INVALID_DOTENV_KEY: Missing environment part')
  }

  return environment
}

module.exports = parseEnvironmentFromDotenvKey


/***/ }),

/***/ 3667:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(6928)
const childProcess = __nccwpck_require__(5317)

const guessPrivateKeyName = __nccwpck_require__(9357)
const guessPublicKeyName = __nccwpck_require__(6093)

class ProKeypair {
  constructor (envFilepath) {
    this.envFilepath = envFilepath
  }

  run () {
    let result = {}

    try {
      // if installed as sibling module
      const projectRoot = path.resolve(process.cwd())
      const dotenvxProPath = __WEBPACK_EXTERNAL_createRequire(import.meta.url).resolve('@dotenvx/dotenvx-pro', { paths: [projectRoot] })
      const { keypair } = __WEBPACK_EXTERNAL_createRequire(import.meta.url)(dotenvxProPath)

      result = keypair(this.envFilepath)
    } catch (_e) {
      try {
        // if installed as binary cli
        const output = childProcess.execSync(`dotenvx-pro keypair -f ${this.envFilepath}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim()

        result = JSON.parse(output)
      } catch (_e) {
        const privateKeyName = guessPrivateKeyName(this.envFilepath)
        const publicKeyName = guessPublicKeyName(this.envFilepath)

        // match format of dotenvx-pro
        result[privateKeyName] = null
        result[publicKeyName] = null
      }
    }

    return result
  }
}

module.exports = ProKeypair


/***/ }),

/***/ 4764:
/***/ ((module) => {

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

function quotes (src) {
  const obj = {}
  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n')

  let match
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    if (maybeQuote === value[0]) {
      obj[key] = ''
    } else {
      obj[key] = maybeQuote
    }
  }

  return obj
}

module.exports = quotes


/***/ }),

/***/ 2113:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const quotes = __nccwpck_require__(4764)
const dotenvParse = __nccwpck_require__(5708)
const escapeForRegex = __nccwpck_require__(5404)
const escapeDollarSigns = __nccwpck_require__(6096)

function replace (src, key, replaceValue) {
  let output
  let newPart = ''

  const parsed = dotenvParse(src, true, true) // skip expanding \n and skip converting \r\n
  const _quotes = quotes(src)
  if (Object.prototype.hasOwnProperty.call(parsed, key)) {
    const quote = _quotes[key]
    newPart += `${key}=${quote}${replaceValue}${quote}`

    const originalValue = parsed[key]
    const escapedOriginalValue = escapeForRegex(originalValue)

    // conditionally enforce end of line
    let enforceEndOfLine = ''
    if (escapedOriginalValue === '') {
      enforceEndOfLine = '$' // EMPTY scenario

      // if empty quote and consecutive newlines
      const newlineMatch = src.match(new RegExp(`${key}\\s*=\\s*\n\n`, 'm')) // match any consecutive newline scenario for a blank value
      if (quote === '' && newlineMatch) {
        const newlineCount = (newlineMatch[0].match(/\n/g)).length - 1
        for (let i = 0; i < newlineCount; i++) {
          newPart += '\n' // re-append the extra newline to preserve user's format choice
        }
      }
    }

    const currentPart = new RegExp(
      '^' + // start of line
      '(\\s*)?' + // spaces
      '(export\\s+)?' + // export
      key + // KEY
      '\\s*=\\s*' + // spaces (KEY = value)
      '["\'`]?' + // open quote
      escapedOriginalValue + // escaped value
      '["\'`]?' + // close quote
      enforceEndOfLine
      ,
      'gm' // (g)lobal (m)ultiline
    )

    const saferInput = escapeDollarSigns(newPart) // cleanse user inputted capture groups ($1, $2 etc)

    // $1 preserves spaces
    // $2 preserves export
    output = src.replace(currentPart, `$1$2${saferInput}`)
  } else {
    newPart += `${key}="${replaceValue}"`

    // append
    if (src.endsWith('\n')) {
      newPart = newPart + '\n'
    } else {
      newPart = '\n' + newPart
    }

    output = src + newPart
  }

  return output
}

module.exports = replace


/***/ }),

/***/ 8258:
/***/ ((module) => {

function resolveEscapeSequences (value) {
  return value.replace(/\\\$/g, '$')
}

module.exports = resolveEscapeSequences


/***/ }),

/***/ 1262:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const os = __nccwpck_require__(857)
const path = __nccwpck_require__(6928)

function resolveHome (filepath) {
  if (filepath[0] === '~') {
    return path.join(os.homedir(), filepath.slice(1))
  }

  return filepath
}

module.exports = resolveHome


/***/ }),

/***/ 5152:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)
const path = __nccwpck_require__(6928)

const PUBLIC_KEY_SCHEMA = 'DOTENV_PUBLIC_KEY'
const PRIVATE_KEY_SCHEMA = 'DOTENV_PRIVATE_KEY'

const dotenvParse = __nccwpck_require__(5708)
const guessPrivateKeyName = __nccwpck_require__(9357)

function searchProcessEnv (privateKeyName) {
  if (process.env[privateKeyName] && process.env[privateKeyName].length > 0) {
    return process.env[privateKeyName]
  }
}

function searchKeysFile (privateKeyName, envFilepath, envKeysFilepath = null) {
  let keysFilepath = path.resolve(path.dirname(envFilepath), '.env.keys') // typical scenario
  if (envKeysFilepath) { // user specified -fk flag
    keysFilepath = path.resolve(envKeysFilepath)
  }

  if (fsx.existsSync(keysFilepath)) {
    const keysSrc = fsx.readFileX(keysFilepath)
    const keysParsed = dotenvParse(keysSrc)

    if (keysParsed[privateKeyName] && keysParsed[privateKeyName].length > 0) {
      return keysParsed[privateKeyName]
    }
  }
}

function invertForPrivateKeyName (envFilepath) {
  if (!fsx.existsSync(envFilepath)) {
    return null
  }

  const envSrc = fsx.readFileX(envFilepath)
  const envParsed = dotenvParse(envSrc)

  let publicKeyName
  for (const keyName of Object.keys(envParsed)) {
    if (keyName === PUBLIC_KEY_SCHEMA || keyName.startsWith(PUBLIC_KEY_SCHEMA)) {
      publicKeyName = keyName // find DOTENV_PUBLIC_KEY* in filename
    }
  }

  if (publicKeyName) {
    return publicKeyName.replace(PUBLIC_KEY_SCHEMA, PRIVATE_KEY_SCHEMA) // return inverted (DOTENV_PUBLIC_KEY* -> DOTENV_PRIVATE_KEY*) if found
  }

  return null
}

function smartDotenvPrivateKey (envFilepath, envKeysFilepath = null) {
  let privateKey = null
  let privateKeyName = guessPrivateKeyName(envFilepath) // DOTENV_PRIVATE_KEY_${ENVIRONMENT}

  // 1. attempt process.env first
  privateKey = searchProcessEnv(privateKeyName)
  if (privateKey) {
    return privateKey
  }

  // 2. attempt .env.keys second (path/to/.env.keys)
  privateKey = searchKeysFile(privateKeyName, envFilepath, envKeysFilepath)
  if (privateKey) {
    return privateKey
  }

  // 3. attempt inverting `DOTENV_PUBLIC_KEY*` name inside file (unlocks custom filenames not matching .env.${ENVIRONMENT} pattern)
  privateKeyName = invertForPrivateKeyName(envFilepath)
  if (privateKeyName) {
    // 3.1 attempt process.env first
    privateKey = searchProcessEnv(privateKeyName)
    if (privateKey) {
      return privateKey
    }

    // 3.2. attempt .env.keys second (path/to/.env.keys)
    privateKey = searchKeysFile(privateKeyName, envFilepath, envKeysFilepath)
    if (privateKey) {
      return privateKey
    }
  }

  return null
}

module.exports = smartDotenvPrivateKey


/***/ }),

/***/ 1004:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)
const dotenvParse = __nccwpck_require__(5708)

const guessPublicKeyName = __nccwpck_require__(6093)

function searchProcessEnv (publicKeyName) {
  if (process.env[publicKeyName] && process.env[publicKeyName].length > 0) {
    return process.env[publicKeyName]
  }
}

function searchEnvFile (publicKeyName, envFilepath) {
  if (fsx.existsSync(envFilepath)) {
    const keysSrc = fsx.readFileX(envFilepath)
    const keysParsed = dotenvParse(keysSrc)

    if (keysParsed[publicKeyName] && keysParsed[publicKeyName].length > 0) {
      return keysParsed[publicKeyName]
    }
  }
}

function smartDotenvPublicKey (envFilepath) {
  let publicKey = null
  const publicKeyName = guessPublicKeyName(envFilepath) // DOTENV_PUBLIC_KEY_${ENVIRONMENT}

  // 1. attempt process.env first
  publicKey = searchProcessEnv(publicKeyName)
  if (publicKey) {
    return publicKey
  }

  // 2. attempt .env.keys second (path/to/.env.keys)
  publicKey = searchEnvFile(publicKeyName, envFilepath)
  if (publicKey) {
    return publicKey
  }

  return null
}

module.exports = smartDotenvPublicKey


/***/ }),

/***/ 3599:
/***/ ((module) => {

function truncate (str, showChar = 7) {
  if (str && str.length > 0) {
    const visiblePart = str.slice(0, showChar)
    return visiblePart + '…'
  } else {
    return ''
  }
}

module.exports = truncate


/***/ }),

/***/ 3142:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// @ts-check
const path = __nccwpck_require__(6928)

// shared
const { setLogLevel, logger } = __nccwpck_require__(7885)
const { getColor, bold } = __nccwpck_require__(2505)

// services
const Ls = __nccwpck_require__(8119)
const Run = __nccwpck_require__(6541)
const Sets = __nccwpck_require__(2039)
const Get = __nccwpck_require__(5660)
const Keypair = __nccwpck_require__(1367)
const Genexample = __nccwpck_require__(6730)

// helpers
const buildEnvs = __nccwpck_require__(5725)
const Parse = __nccwpck_require__(3502)
const fsx = __nccwpck_require__(7620)
const isIgnoringDotenvKeys = __nccwpck_require__(4386)

/** @type {import('./main').config} */
const config = function (options = {}) {
  // allow user to set processEnv to write to
  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  // overload
  const overload = options.overload || options.override

  // ignore
  const ignore = options.ignore || []

  // strict
  const strict = options.strict

  // envKeysFile
  const envKeysFile = options.envKeysFile

  // DOTENV_KEY (DEPRECATED)
  let DOTENV_KEY = process.env.DOTENV_KEY
  if (options && options.DOTENV_KEY) {
    DOTENV_KEY = options.DOTENV_KEY
  }

  if (options) setLogLevel(options)

  try {
    const envs = buildEnvs(options, DOTENV_KEY)
    const {
      processedEnvs,
      readableFilepaths,
      uniqueInjectedKeys
    } = new Run(envs, overload, DOTENV_KEY, processEnv, envKeysFile).run()

    let lastError
    /** @type {Record<string, string>} */
    const parsedAll = {}
    for (const processedEnv of processedEnvs) {
      if (processedEnv.type === 'envVaultFile') {
        logger.verbose(`loading env from encrypted ${processedEnv.filepath} (${path.resolve(processedEnv.filepath)})`)
        logger.debug(`decrypting encrypted env from ${processedEnv.filepath} (${path.resolve(processedEnv.filepath)})`)
      }

      if (processedEnv.type === 'envFile') {
        logger.verbose(`loading env from ${processedEnv.filepath} (${path.resolve(processedEnv.filepath)})`)
      }

      for (const error of processedEnv.errors || []) {
        if (ignore.includes(error.code)) {
          logger.verbose(`ignored: ${error.message}`)
          continue // ignore error
        }

        if (strict) throw error // throw if strict and not ignored

        lastError = error // surface later in { error }

        if (error.code === 'MISSING_ENV_FILE') {
          if (!options.convention) { // do not output error for conventions (too noisy)
            console.error(error.message)
            if (error.help) {
              console.error(error.help)
            }
          }
        } else {
          console.error(error.message)
          if (error.help) {
            console.error(error.help)
          }
        }
      }

      Object.assign(parsedAll, processedEnv.injected || {})
      Object.assign(parsedAll, processedEnv.preExisted || {}) // preExisted 'wins'

      // debug parsed
      logger.debug(processedEnv.parsed)

      // verbose/debug injected key/value
      for (const [key, value] of Object.entries(processedEnv.injected || {})) {
        logger.verbose(`${key} set`)
        logger.debug(`${key} set to ${value}`)
      }

      // verbose/debug preExisted key/value
      for (const [key, value] of Object.entries(processedEnv.preExisted || {})) {
        logger.verbose(`${key} pre-exists (protip: use --overload to override)`)
        logger.debug(`${key} pre-exists as ${value} (protip: use --overload to override)`)
      }
    }

    let msg = `injecting env (${uniqueInjectedKeys.length})`
    if (readableFilepaths.length > 0) {
      msg += ` from ${readableFilepaths.join(', ')}`
    }
    logger.successv(msg)

    if (lastError) {
      return { parsed: parsedAll, error: lastError }
    } else {
      return { parsed: parsedAll }
    }
  } catch (error) {
    if (strict) throw error // throw immediately if strict

    logger.error(error.message)
    if (error.help) {
      logger.help(error.help)
    }

    return { parsed: {}, error }
  }
}

/** @type {import('./main').parse} */
const parse = function (src, options = {}) {
  // allow user to set processEnv to read from
  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  // private decryption key
  const privateKey = options.privateKey || null

  // overload
  const overload = options.overload || options.override

  const { parsed, errors } = new Parse(src, privateKey, processEnv, overload).run()

  // display any errors
  for (const error of errors) {
    console.error(error.message)
    if (error.help) {
      console.error(error.help)
    }
  }

  return parsed
}

/* @type {import('./main').set} */
const set = function (key, value, options = {}) {
  // encrypt
  let encrypt = true
  if (options.plain) {
    encrypt = false
  } else if (options.encrypt === false) {
    encrypt = false
  }

  const envs = buildEnvs(options)
  const envKeysFilepath = options.envKeysFile

  const {
    processedEnvs,
    changedFilepaths,
    unchangedFilepaths
  } = new Sets(key, value, envs, encrypt, envKeysFilepath).run()

  let withEncryption = ''

  if (encrypt) {
    withEncryption = ' with encryption'
  }

  for (const processedEnv of processedEnvs) {
    logger.verbose(`setting for ${processedEnv.envFilepath}`)

    if (processedEnv.error) {
      if (processedEnv.error.code === 'MISSING_ENV_FILE') {
        logger.warn(processedEnv.error.message)
        logger.help(`? add one with [echo "HELLO=World" > ${processedEnv.envFilepath}] and re-run [dotenvx set]`)
      } else {
        logger.warn(processedEnv.error.message)
        if (processedEnv.error.help) {
          logger.help(processedEnv.error.help)
        }
      }
    } else {
      fsx.writeFileX(processedEnv.filepath, processedEnv.envSrc)

      logger.verbose(`${processedEnv.key} set${withEncryption} (${processedEnv.envFilepath})`)
      logger.debug(`${processedEnv.key} set${withEncryption} to ${processedEnv.value} (${processedEnv.envFilepath})`)
    }
  }

  if (changedFilepaths.length > 0) {
    logger.success(`✔ set ${key}${withEncryption} (${changedFilepaths.join(',')})`)
  } else if (unchangedFilepaths.length > 0) {
    logger.info(`no changes (${unchangedFilepaths})`)
  } else {
    // do nothing
  }

  for (const processedEnv of processedEnvs) {
    if (processedEnv.privateKeyAdded) {
      logger.success(`✔ key added to ${processedEnv.envKeysFilepath} (${processedEnv.privateKeyName})`)

      if (!isIgnoringDotenvKeys()) {
        logger.help('⮕  next run [dotenvx ext gitignore --pattern .env.keys] to gitignore .env.keys')
      }

      logger.help(`⮕  next run [${processedEnv.privateKeyName}='${processedEnv.privateKey}' dotenvx get ${key}] to test decryption locally`)
    }
  }

  return {
    processedEnvs,
    changedFilepaths,
    unchangedFilepaths
  }
}

/* @type {import('./main').get} */
const get = function (key, options = {}) {
  const envs = buildEnvs(options)

  // ignore
  const ignore = options.ignore || []

  const { parsed, errors } = new Get(key, envs, options.overload, process.env.DOTENV_KEY, options.all, options.envKeysFile).run()

  for (const error of errors || []) {
    if (ignore.includes(error.code)) {
      continue // ignore error
    }

    if (options.strict) throw error // throw immediately if strict

    console.error(error.message)
    if (error.help) {
      console.error(error.help)
    }
  }

  if (key) {
    const single = parsed[key]
    if (single === undefined) {
      return undefined
    } else {
      return single
    }
  } else {
    if (options.format === 'eval') {
      let inline = ''
      for (const [key, value] of Object.entries(parsed)) {
        inline += `${key}=${escape(value)}\n`
      }
      inline = inline.trim()

      return inline
    } else if (options.format === 'shell') {
      let inline = ''
      for (const [key, value] of Object.entries(parsed)) {
        inline += `${key}=${value} `
      }
      inline = inline.trim()

      return inline
    } else {
      return parsed
    }
  }
}

/** @type {import('./main').ls} */
const ls = function (directory, envFile, excludeEnvFile) {
  return new Ls(directory, envFile, excludeEnvFile).run()
}

/** @type {import('./main').genexample} */
const genexample = function (directory, envFile) {
  return new Genexample(directory, envFile).run()
}

/** @type {import('./main').keypair} */
const keypair = function (envFile, key, envKeysFile = null) {
  const keypairs = new Keypair(envFile, envKeysFile).run()
  if (key) {
    return keypairs[key]
  } else {
    return keypairs
  }
}

module.exports = {
  // dotenv proxies
  config,
  parse,
  // actions related
  set,
  get,
  ls,
  keypair,
  genexample,
  // expose for libs depending on @dotenvx/dotenvx - like dotenvx-pro
  setLogLevel,
  logger,
  getColor,
  bold
}


/***/ }),

/***/ 6730:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)
const path = __nccwpck_require__(6928)

const Errors = __nccwpck_require__(5934)
const findEnvFiles = __nccwpck_require__(8232)
const replace = __nccwpck_require__(2113)
const dotenvParse = __nccwpck_require__(5708)

class Genexample {
  constructor (directory = '.', envFile) {
    this.directory = directory
    this.envFile = envFile || findEnvFiles(directory)

    this.exampleFilename = '.env.example'
    this.exampleFilepath = path.resolve(this.directory, this.exampleFilename)
  }

  run () {
    if (this.envFile.length < 1) {
      const code = 'MISSING_ENV_FILES'
      const message = 'no .env* files found'
      const help = '? add one with [echo "HELLO=World" > .env] and then run [dotenvx genexample]'

      const error = new Error(message)
      error.code = code
      error.help = help
      throw error
    }

    const keys = new Set()
    const addedKeys = new Set()
    const envFilepaths = this._envFilepaths()
    /** @type {Record<string, string>} */
    const injected = {}
    /** @type {Record<string, string>} */
    const preExisted = {}

    let exampleSrc = `# ${this.exampleFilename} - generated with dotenvx\n`

    for (const envFilepath of envFilepaths) {
      const filepath = path.resolve(this.directory, envFilepath)
      if (!fsx.existsSync(filepath)) {
        const error = new Errors({ envFilepath, filepath }).missingEnvFile()
        error.help = `? add it with [echo "HELLO=World" > ${envFilepath}] and then run [dotenvx genexample]`
        throw error
      }

      // get the original src
      let src = fsx.readFileX(filepath)
      const parsed = dotenvParse(src)
      for (const key in parsed) {
        // used later
        keys.add(key)

        // once newSrc is built write it out
        src = replace(src, key, '') // empty value
      }

      exampleSrc += `\n${src}`
    }

    if (!fsx.existsSync(this.exampleFilepath)) {
      // it doesn't exist so just write this first generated one
      // exampleSrc - already written to from the prior loop
      for (const key of [...keys]) {
        // every key is added since it's the first time generating .env.example
        addedKeys.add(key)

        injected[key] = ''
      }
    } else {
      // it already exists (which means the user might have it modified a way in which they prefer, so replace exampleSrc with their existing .env.example)
      exampleSrc = fsx.readFileX(this.exampleFilepath)

      const parsed = dotenvParse(exampleSrc)
      for (const key of [...keys]) {
        if (key in parsed) {
          preExisted[key] = parsed[key]
        } else {
          exampleSrc += `${key}=''\n`

          addedKeys.add(key)

          injected[key] = ''
        }
      }
    }

    return {
      envExampleFile: exampleSrc,
      envFile: this.envFile,
      exampleFilepath: this.exampleFilepath,
      addedKeys: [...addedKeys],
      injected,
      preExisted
    }
  }

  _envFilepaths () {
    if (!Array.isArray(this.envFile)) {
      return [this.envFile]
    }

    return this.envFile
  }
}

module.exports = Genexample


/***/ }),

/***/ 5660:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const Run = __nccwpck_require__(6541)
const Errors = __nccwpck_require__(5934)

class Get {
  constructor (key, envs = [], overload = false, DOTENV_KEY = '', all = false, envKeysFilepath = null) {
    this.key = key
    this.envs = envs
    this.overload = overload
    this.DOTENV_KEY = DOTENV_KEY
    this.all = all
    this.envKeysFilepath = envKeysFilepath
  }

  run () {
    const processEnv = { ...process.env }
    const { processedEnvs } = new Run(this.envs, this.overload, this.DOTENV_KEY, processEnv, this.envKeysFilepath).run()

    const errors = []
    for (const processedEnv of processedEnvs) {
      for (const error of processedEnv.errors) {
        errors.push(error)
      }
    }

    if (this.key) {
      const parsed = {}
      const value = processEnv[this.key]
      parsed[this.key] = value

      if (value === undefined) {
        errors.push(new Errors({ key: this.key }).missingKey())
      }

      return { parsed, errors }
    } else {
      // if user wants to return ALL envs (even prior set on machine)
      if (this.all) {
        return { parsed: processEnv, errors }
      }

      // typical scenario - return only envs that were identified in the .env file
      // iterate over all processedEnvs.parsed and grab from processEnv
      /** @type {Record<string, string>} */
      const parsed = {}
      for (const processedEnv of processedEnvs) {
        // parsed means we saw the key in a file or --env flag. this effectively filters out any preset machine envs - while still respecting complex evaluating, expansion, and overload. in other words, the value might be the machine value because the key was displayed in a .env file
        if (processedEnv.parsed) {
          for (const key of Object.keys(processedEnv.parsed)) {
            parsed[key] = processEnv[key]
          }
        }
      }

      return { parsed, errors }
    }
  }
}

module.exports = Get


/***/ }),

/***/ 1367:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const guessPublicKeyName = __nccwpck_require__(6093)
const smartDotenvPublicKey = __nccwpck_require__(1004)
const guessPrivateKeyName = __nccwpck_require__(9357)
const smartDotenvPrivateKey = __nccwpck_require__(5152)

class Keypair {
  constructor (envFile = '.env', envKeysFilepath = null) {
    this.envFile = envFile
    this.envKeysFilepath = envKeysFilepath
  }

  run () {
    const out = {}

    const envFilepaths = this._envFilepaths()
    for (const envFilepath of envFilepaths) {
      // public key
      const publicKeyName = guessPublicKeyName(envFilepath)
      const publicKeyValue = smartDotenvPublicKey(envFilepath)
      out[publicKeyName] = publicKeyValue

      // private key
      const privateKeyName = guessPrivateKeyName(envFilepath)
      const privateKeyValue = smartDotenvPrivateKey(envFilepath, this.envKeysFilepath)

      out[privateKeyName] = privateKeyValue
    }

    return out
  }

  _envFilepaths () {
    if (!Array.isArray(this.envFile)) {
      return [this.envFile]
    }

    return this.envFile
  }
}

module.exports = Keypair


/***/ }),

/***/ 8119:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { fdir: Fdir } = __nccwpck_require__(9991)
const path = __nccwpck_require__(6928)
const picomatch = __nccwpck_require__(2324)

class Ls {
  constructor (directory = './', envFile = ['.env*'], excludeEnvFile = []) {
    this.ignore = ['node_modules/**', '.git/**']

    this.cwd = path.resolve(directory)
    this.envFile = envFile
    this.excludeEnvFile = excludeEnvFile
  }

  run () {
    return this._filepaths()
  }

  _filepaths () {
    const exclude = picomatch(this._exclude())
    const include = picomatch(this._patterns(), {
      ignore: this._exclude()
    })

    return new Fdir()
      .withRelativePaths()
      .exclude((dir, path) => exclude(path))
      .filter((path) => include(path))
      .crawl(this.cwd)
      .sync()
  }

  _patterns () {
    if (!Array.isArray(this.envFile)) {
      return [`**/${this.envFile}`]
    }

    return this.envFile.map(part => `**/${part}`)
  }

  _excludePatterns () {
    if (!Array.isArray(this.excludeEnvFile)) {
      return [`**/${this.excludeEnvFile}`]
    }

    return this.excludeEnvFile.map(part => `**/${part}`)
  }

  _exclude () {
    if (this._excludePatterns().length > 0) {
      return this.ignore.concat(this._excludePatterns())
    } else {
      return this.ignore
    }
  }
}

module.exports = Ls


/***/ }),

/***/ 6541:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)
const path = __nccwpck_require__(6928)

const TYPE_ENV = 'env'
const TYPE_ENV_FILE = 'envFile'
const TYPE_ENV_VAULT_FILE = 'envVaultFile'

const decrypt = __nccwpck_require__(9780)
const Parse = __nccwpck_require__(3502)
const Errors = __nccwpck_require__(5934)
const dotenvParse = __nccwpck_require__(5708)
const parseEnvironmentFromDotenvKey = __nccwpck_require__(1080)
const detectEncoding = __nccwpck_require__(9375)
const findPrivateKey = __nccwpck_require__(7968)
const guessPrivateKeyName = __nccwpck_require__(9357)
const determineEnvs = __nccwpck_require__(580)

class Run {
  constructor (envs = [], overload = false, DOTENV_KEY = '', processEnv = process.env, envKeysFilepath = null) {
    this.envs = determineEnvs(envs, processEnv, DOTENV_KEY)
    this.overload = overload
    this.DOTENV_KEY = DOTENV_KEY
    this.processEnv = processEnv
    this.envKeysFilepath = envKeysFilepath

    this.processedEnvs = []
    this.readableFilepaths = new Set()
    this.readableStrings = new Set()
    this.uniqueInjectedKeys = new Set()
  }

  run () {
    // example
    // envs [
    //   { type: 'envVaultFile', value: '.env.vault' },
    //   { type: 'env', value: 'HELLO=one' },
    //   { type: 'envFile', value: '.env' },
    //   { type: 'env', value: 'HELLO=three' }
    // ]

    for (const env of this.envs) {
      if (env.type === TYPE_ENV_VAULT_FILE) { // deprecate someday - for deprecated .env.vault files
        this._injectEnvVaultFile(env.value)
      } else if (env.type === TYPE_ENV_FILE) {
        this._injectEnvFile(env.value)
      } else if (env.type === TYPE_ENV) {
        this._injectEnv(env.value)
      }
    }

    return {
      processedEnvs: this.processedEnvs,
      readableStrings: [...this.readableStrings],
      readableFilepaths: [...this.readableFilepaths],
      uniqueInjectedKeys: [...this.uniqueInjectedKeys]
    }
  }

  _injectEnv (env) {
    const row = {}
    row.type = TYPE_ENV
    row.string = env

    try {
      const { parsed, errors, injected, preExisted } = new Parse(env, null, this.processEnv, this.overload).run()
      row.parsed = parsed
      row.errors = errors
      row.injected = injected
      row.preExisted = preExisted

      this.inject(row.parsed) // inject

      this.readableStrings.add(env)

      for (const key of Object.keys(injected)) {
        this.uniqueInjectedKeys.add(key) // track uniqueInjectedKeys across multiple files
      }
    } catch (e) {
      row.errors = [e]
    }

    this.processedEnvs.push(row)
  }

  _injectEnvFile (envFilepath) {
    const row = {}
    row.type = TYPE_ENV_FILE
    row.filepath = envFilepath

    const filepath = path.resolve(envFilepath)
    try {
      const encoding = detectEncoding(filepath)
      const src = fsx.readFileX(filepath, { encoding })
      this.readableFilepaths.add(envFilepath)

      const privateKey = findPrivateKey(envFilepath, this.envKeysFilepath)
      const privateKeyName = guessPrivateKeyName(envFilepath)
      const { parsed, errors, injected, preExisted } = new Parse(src, privateKey, this.processEnv, this.overload, privateKeyName).run()

      row.parsed = parsed
      row.errors = errors
      row.injected = injected
      row.preExisted = preExisted

      this.inject(row.parsed) // inject

      for (const key of Object.keys(injected)) {
        this.uniqueInjectedKeys.add(key) // track uniqueInjectedKeys across multiple files
      }
    } catch (e) {
      if (e.code === 'ENOENT' || e.code === 'EISDIR') {
        row.errors = [new Errors({ envFilepath, filepath }).missingEnvFile()]
      } else {
        row.errors = [e]
      }
    }

    this.processedEnvs.push(row)
  }

  _injectEnvVaultFile (envVaultFilepath) {
    const row = {}
    row.type = TYPE_ENV_VAULT_FILE
    row.filepath = envVaultFilepath

    const filepath = path.resolve(envVaultFilepath)
    this.readableFilepaths.add(envVaultFilepath)

    if (!fsx.existsSync(filepath)) {
      const code = 'MISSING_ENV_VAULT_FILE'
      const message = `you set DOTENV_KEY but your .env.vault file is missing: ${filepath}`
      const error = new Error(message)
      error.code = code
      throw error
    }

    if (this.DOTENV_KEY.length < 1) {
      const code = 'MISSING_DOTENV_KEY'
      const message = `your DOTENV_KEY appears to be blank: '${this.DOTENV_KEY}'`
      const error = new Error(message)
      error.code = code
      throw error
    }

    let decrypted
    const dotenvKeys = this._dotenvKeys()
    const parsedVault = this._parsedVault(filepath)
    for (let i = 0; i < dotenvKeys.length; i++) {
      try {
        const dotenvKey = dotenvKeys[i].trim() // dotenv://key_1234@...?environment=prod

        decrypted = this._decrypted(dotenvKey, parsedVault)

        break
      } catch (error) {
        // last key
        if (i + 1 >= dotenvKeys.length) {
          throw error
        }
        // try next key
      }
    }

    try {
      // parse this. it's the equivalent of the .env file
      const { parsed, errors, injected, preExisted } = new Parse(decrypted, null, this.processEnv, this.overload).run()
      row.parsed = parsed
      row.errors = errors
      row.injected = injected
      row.preExisted = preExisted

      this.inject(row.parsed) // inject

      for (const key of Object.keys(injected)) {
        this.uniqueInjectedKeys.add(key) // track uniqueInjectedKeys across multiple files
      }
    } catch (e) {
      row.errors = [e]
    }

    this.processedEnvs.push(row)
  }

  inject (parsed) {
    for (const key of Object.keys(parsed)) {
      this.processEnv[key] = parsed[key] // inject to process.env
    }
  }

  // handle scenario for comma separated keys - for use with key rotation
  // example: DOTENV_KEY="dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenvx.com/vault/.env.vault?environment=prod"
  _dotenvKeys () {
    return this.DOTENV_KEY.split(',')
  }

  // { "DOTENV_VAULT_DEVELOPMENT": "<ciphertext>" }
  _parsedVault (filepath) {
    const src = fsx.readFileX(filepath)
    return dotenvParse(src)
  }

  _decrypted (dotenvKey, parsedVault) {
    const environment = parseEnvironmentFromDotenvKey(dotenvKey)

    // DOTENV_KEY_PRODUCTION
    const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`
    const ciphertext = parsedVault[environmentKey]
    if (!ciphertext) {
      const error = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: cannot locate environment ${environmentKey} in your .env.vault file`)
      error.code = 'NOT_FOUND_DOTENV_ENVIRONMENT'

      throw error
    }

    return decrypt(ciphertext, dotenvKey)
  }
}

module.exports = Run


/***/ }),

/***/ 2039:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fsx = __nccwpck_require__(7620)
const path = __nccwpck_require__(6928)

const TYPE_ENV_FILE = 'envFile'

const Errors = __nccwpck_require__(5934)
const guessPrivateKeyName = __nccwpck_require__(9357)
const guessPublicKeyName = __nccwpck_require__(6093)
const encryptValue = __nccwpck_require__(7)
const decryptKeyValue = __nccwpck_require__(7652)
const replace = __nccwpck_require__(2113)
const dotenvParse = __nccwpck_require__(5708)
const detectEncoding = __nccwpck_require__(9375)
const determineEnvs = __nccwpck_require__(580)
const findPrivateKey = __nccwpck_require__(7968)
const findPublicKey = __nccwpck_require__(5356)
const keypair = __nccwpck_require__(9262)
const truncate = __nccwpck_require__(3599)
const isEncrypted = __nccwpck_require__(4545)

class Sets {
  constructor (key, value, envs = [], encrypt = true, envKeysFilepath = null) {
    this.envs = determineEnvs(envs, process.env)
    this.key = key
    this.value = value
    this.encrypt = encrypt
    this.envKeysFilepath = envKeysFilepath

    this.processedEnvs = []
    this.changedFilepaths = new Set()
    this.unchangedFilepaths = new Set()
    this.readableFilepaths = new Set()
  }

  run () {
    // example
    // envs [
    //   { type: 'envFile', value: '.env' }
    // ]

    for (const env of this.envs) {
      if (env.type === TYPE_ENV_FILE) {
        this._setEnvFile(env.value)
      }
    }

    return {
      processedEnvs: this.processedEnvs,
      changedFilepaths: [...this.changedFilepaths],
      unchangedFilepaths: [...this.unchangedFilepaths]
    }
  }

  _setEnvFile (envFilepath) {
    const row = {}
    row.key = this.key || null
    row.value = this.value || null
    row.type = TYPE_ENV_FILE

    const filename = path.basename(envFilepath)
    const filepath = path.resolve(envFilepath)
    row.filepath = filepath
    row.envFilepath = envFilepath
    row.changed = false

    try {
      const encoding = this._detectEncoding(filepath)
      let envSrc = fsx.readFileX(filepath, { encoding })
      const envParsed = dotenvParse(envSrc)
      row.originalValue = envParsed[row.key] || null
      const wasPlainText = !isEncrypted(row.originalValue)
      this.readableFilepaths.add(envFilepath)

      if (this.encrypt) {
        let publicKey
        let privateKey

        const publicKeyName = guessPublicKeyName(envFilepath)
        const privateKeyName = guessPrivateKeyName(envFilepath)
        const existingPrivateKey = findPrivateKey(envFilepath, this.envKeysFilepath)
        const existingPublicKey = findPublicKey(envFilepath)

        let envKeysFilepath = path.join(path.dirname(filepath), '.env.keys')
        if (this.envKeysFilepath) {
          envKeysFilepath = path.resolve(this.envKeysFilepath)
        }
        const relativeFilepath = path.relative(path.dirname(filepath), envKeysFilepath)

        if (existingPrivateKey) {
          const kp = keypair(existingPrivateKey)
          publicKey = kp.publicKey
          privateKey = kp.privateKey

          if (row.originalValue) {
            row.originalValue = decryptKeyValue(row.key, row.originalValue, privateKeyName, privateKey)
          }

          // if derivation doesn't match what's in the file (or preset in env)
          if (existingPublicKey && existingPublicKey !== publicKey) {
            const error = new Error(`derived public key (${truncate(publicKey)}) does not match the existing public key (${truncate(existingPublicKey)})`)
            error.code = 'INVALID_DOTENV_PRIVATE_KEY'
            error.help = `debug info: ${privateKeyName}=${truncate(existingPrivateKey)} (derived ${publicKeyName}=${truncate(publicKey)} vs existing ${publicKeyName}=${truncate(existingPublicKey)})`
            throw error
          }

          // typical scenario when encrypting a monorepo second .env file from a prior generated -fk .env.keys file
          if (!existingPublicKey) {
            const ps = this._preserveShebang(envSrc)
            const firstLinePreserved = ps.firstLinePreserved
            envSrc = ps.envSrc

            const prependPublicKey = this._prependPublicKey(publicKeyName, publicKey, filename, relativeFilepath)

            envSrc = `${firstLinePreserved}${prependPublicKey}\n${envSrc}`
          }
        } else if (existingPublicKey) {
          publicKey = existingPublicKey
        } else {
          // .env.keys
          let keysSrc = ''
          if (fsx.existsSync(envKeysFilepath)) {
            keysSrc = fsx.readFileX(envKeysFilepath)
          }

          const ps = this._preserveShebang(envSrc)
          const firstLinePreserved = ps.firstLinePreserved
          envSrc = ps.envSrc

          const kp = keypair() // generates a fresh keypair in memory
          publicKey = kp.publicKey
          privateKey = kp.privateKey

          const prependPublicKey = this._prependPublicKey(publicKeyName, publicKey, filename, relativeFilepath)

          // privateKey
          const firstTimeKeysSrc = [
            '#/------------------!DOTENV_PRIVATE_KEYS!-------------------/',
            '#/ private decryption keys. DO NOT commit to source control /',
            '#/     [how it works](https://dotenvx.com/encryption)       /',
            '#/----------------------------------------------------------/'
          ].join('\n')
          const appendPrivateKey = [
            `# ${filename}`,
            `${privateKeyName}=${privateKey}`,
            ''
          ].join('\n')

          envSrc = `${firstLinePreserved}${prependPublicKey}\n${envSrc}`
          keysSrc = keysSrc.length > 1 ? keysSrc : `${firstTimeKeysSrc}\n`
          keysSrc = `${keysSrc}\n${appendPrivateKey}`

          // write to .env.keys
          fsx.writeFileX(envKeysFilepath, keysSrc)

          row.privateKeyAdded = true
          row.envKeysFilepath = this.envKeysFilepath || path.join(path.dirname(envFilepath), path.basename(envKeysFilepath))
        }

        row.publicKey = publicKey
        row.privateKey = privateKey
        row.encryptedValue = encryptValue(this.value, publicKey)
        row.privateKeyName = privateKeyName
      }

      const goingFromPlainTextToEncrypted = wasPlainText && this.encrypt
      const valueChanged = this.value !== row.originalValue
      if (goingFromPlainTextToEncrypted || valueChanged) {
        row.envSrc = replace(envSrc, this.key, row.encryptedValue || this.value)
        this.changedFilepaths.add(envFilepath)
        row.changed = true
      } else {
        row.envSrc = envSrc
        this.unchangedFilepaths.add(envFilepath)
        row.changed = false
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        row.error = new Errors({ envFilepath, filepath }).missingEnvFile()
      } else {
        row.error = e
      }
    }

    this.processedEnvs.push(row)
  }

  _detectEncoding (filepath) {
    return detectEncoding(filepath)
  }

  _prependPublicKey (publicKeyName, publicKey, filename, relativeFilepath = '.env.keys') {
    const comment = relativeFilepath === '.env.keys' ? '' : ` # -fk ${relativeFilepath}`

    return [
      '#/-------------------[DOTENV_PUBLIC_KEY]--------------------/',
      '#/            public-key encryption for .env files          /',
      '#/       [how it works](https://dotenvx.com/encryption)     /',
      '#/----------------------------------------------------------/',
      `${publicKeyName}="${publicKey}"${comment}`,
      '',
      `# ${filename}`
    ].join('\n')
  }

  _preserveShebang (envSrc) {
    // preserve shebang
    const [firstLine, ...remainingLines] = envSrc.split('\n')
    let firstLinePreserved = ''

    if (firstLine.startsWith('#!')) {
      firstLinePreserved = firstLine + '\n'
      envSrc = remainingLines.join('\n')
    }

    return {
      firstLinePreserved,
      envSrc
    }
  }
}

module.exports = Sets


/***/ }),

/***/ 2505:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const depth = __nccwpck_require__(7269)

const colors16 = new Map([
  ['blue', 34],
  ['gray', 37],
  ['green', 32],
  ['olive', 33],
  ['orangered', 31], // mapped to red
  ['plum', 35], // mapped to magenta
  ['red', 31],
  ['electricblue', 36],
  ['dodgerblue', 36]
])

const colors256 = new Map([
  ['blue', 21],
  ['gray', 244],
  ['green', 34],
  ['olive', 142],
  ['orangered', 202],
  ['plum', 182],
  ['red', 196],
  ['electricblue', 45],
  ['dodgerblue', 33]
])

function getColor (color) {
  const colorDepth = depth.getColorDepth()
  if (!colors256.has(color)) {
    throw new Error(`Invalid color ${color}`)
  }
  if (colorDepth >= 8) {
    const code = colors256.get(color)
    return (message) => `\x1b[38;5;${code}m${message}\x1b[39m`
  }
  if (colorDepth >= 4) {
    const code = colors16.get(color)
    return (message) => `\x1b[${code}m${message}\x1b[39m`
  }
  return (message) => message
}

function bold (message) {
  if (depth.getColorDepth() >= 4) {
    return `\x1b[1m${message}\x1b[22m`
  }

  return message
}

module.exports = {
  getColor,
  bold
}


/***/ }),

/***/ 7885:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const packageJson = __nccwpck_require__(9003)
const { getColor, bold } = __nccwpck_require__(2505)

const levels = {
  error: 0,
  errorv: 0,
  errornocolor: 0,
  warn: 1,
  success: 2,
  successv: 2,
  info: 2,
  help: 2,
  blank: 2,
  verbose: 4,
  debug: 5,
  silly: 6
}

const error = (m) => bold(getColor('red')(m))
const warn = getColor('orangered')
const success = getColor('green')
const successv = getColor('olive') // yellow-ish tint that 'looks' like dotenv
const help = getColor('dodgerblue')
const verbose = getColor('plum')
const debug = getColor('plum')

let currentLevel = levels.info // default log level

function log (level, message) {
  if (levels[level] === undefined) {
    throw new Error(`MISSING_LOG_LEVEL: '${level}'. implement in logger.`)
  }

  if (levels[level] <= currentLevel) {
    const formattedMessage = formatMessage(level, message)
    console.log(formattedMessage)
  }
}

function formatMessage (level, message) {
  const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message

  switch (level.toLowerCase()) {
    // errors
    case 'error':
      return error(formattedMessage)
    case 'errorv':
      return error(`[dotenvx@${packageJson.version}] ${formattedMessage}`)
    case 'errornocolor':
      return formattedMessage
    // warns
    case 'warn':
      return warn(formattedMessage)
    // successes
    case 'success':
      return success(formattedMessage)
    case 'successv': // success with 'version'
      return successv(`[dotenvx@${packageJson.version}] ${formattedMessage}`)
    // info
    case 'info':
      return formattedMessage
    // help
    case 'help':
      return help(formattedMessage)
    // verbose
    case 'verbose':
      return verbose(formattedMessage)
    // debug
    case 'debug':
      return debug(formattedMessage)
    // blank
    case 'blank': // custom
      return formattedMessage
  }
}

const logger = {
  // track level
  level: 'info',

  // errors
  error: (msg) => log('error', msg),
  errorv: (msg) => log('errorv', msg),
  errornocolor: (msg) => log('errornocolor', msg),
  // warns
  warn: (msg) => log('warn', msg),
  // success
  success: (msg) => log('success', msg),
  successv: (msg) => log('successv', msg),
  // info
  info: (msg) => log('info', msg),
  // help
  help: (msg) => log('help', msg),
  // verbose
  verbose: (msg) => log('verbose', msg),
  // debug
  debug: (msg) => log('debug', msg),
  // blank
  blank: (msg) => log('blank', msg),
  setLevel: (level) => {
    if (levels[level] !== undefined) {
      currentLevel = levels[level]
      logger.level = level
    }
  }
}

function setLogLevel (options) {
  const logLevel = options.debug
    ? 'debug'
    : options.verbose
      ? 'verbose'
      : options.quiet
        ? 'error'
        : options.logLevel

  if (!logLevel) return
  logger.setLevel(logLevel)
  // Only log which level it's setting if it's not set to quiet mode
  if (!options.quiet || (options.quiet && logLevel !== 'error')) {
    logger.debug(`Setting log level to ${logLevel}`)
  }
}

module.exports = {
  logger,
  getColor,
  setLogLevel,
  levels
}


/***/ }),

/***/ 6114:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._compat = void 0;
var utils_1 = __nccwpck_require__(4621);
var node_crypto_1 = __nccwpck_require__(7598);
var AEAD_TAG_LENGTH = 16;
// @ts-ignore: only necessary for deno
var IS_DENO = globalThis.Deno !== undefined;
/**
 * make `node:crypto`'s ciphers compatible with `@noble/ciphers`.
 *
 * `Cipher`'s interface is the same for both `aes-256-gcm` and `chacha20-poly1305`,
 * albeit the latter is one of `CipherCCMTypes`.
 * Interestingly, whether to set `plaintextLength` or not, or which value to set, has no actual effect.
 */
var _compat = function (algorithm, key, nonce, AAD) {
    var isAEAD = algorithm === "aes-256-gcm" || algorithm === "chacha20-poly1305";
    var authTagLength = isAEAD ? AEAD_TAG_LENGTH : 0;
    // authTagLength is necessary for `chacha20-poly1305` before Node v16.17
    var options = isAEAD ? { authTagLength: authTagLength } : undefined;
    var encrypt = function (plainText) {
        var cipher = (0, node_crypto_1.createCipheriv)(algorithm, key, nonce, options);
        if (isAEAD && AAD !== undefined) {
            cipher.setAAD(AAD);
        }
        var updated = cipher.update(plainText);
        var finalized = cipher.final();
        var tag = isAEAD ? cipher.getAuthTag() : new Uint8Array(0);
        return (0, utils_1.concatBytes)(updated, finalized, tag);
    };
    var decrypt = function (cipherText) {
        var rawCipherText = cipherText.subarray(0, cipherText.length - authTagLength);
        var tag = cipherText.subarray(cipherText.length - authTagLength);
        var decipher = (0, node_crypto_1.createDecipheriv)(algorithm, key, nonce, options);
        if (isAEAD) {
            if (AAD !== undefined) {
                decipher.setAAD(AAD);
            }
            decipher.setAuthTag(tag);
        }
        /* v8 ignore next 3 */
        if (!isAEAD && IS_DENO) {
            decipher.setAutoPadding(false); // See: https://github.com/denoland/deno/issues/28381
        }
        var updated = decipher.update(rawCipherText);
        var finalized = decipher.final();
        return (0, utils_1.concatBytes)(updated, finalized);
    };
    return {
        encrypt: encrypt,
        decrypt: decrypt,
    };
};
exports._compat = _compat;


/***/ }),

/***/ 1334:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._hchacha20 = void 0;
/**
 * Copied from `@noble/ciphers/chacha`
 */
// prettier-ignore
var _hchacha20 = function (s, k, i, o32) {
    var x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
    for (var r = 0; r < 20; r += 2) {
        x00 = (x00 + x04) | 0;
        x12 = rotl(x12 ^ x00, 16);
        x08 = (x08 + x12) | 0;
        x04 = rotl(x04 ^ x08, 12);
        x00 = (x00 + x04) | 0;
        x12 = rotl(x12 ^ x00, 8);
        x08 = (x08 + x12) | 0;
        x04 = rotl(x04 ^ x08, 7);
        x01 = (x01 + x05) | 0;
        x13 = rotl(x13 ^ x01, 16);
        x09 = (x09 + x13) | 0;
        x05 = rotl(x05 ^ x09, 12);
        x01 = (x01 + x05) | 0;
        x13 = rotl(x13 ^ x01, 8);
        x09 = (x09 + x13) | 0;
        x05 = rotl(x05 ^ x09, 7);
        x02 = (x02 + x06) | 0;
        x14 = rotl(x14 ^ x02, 16);
        x10 = (x10 + x14) | 0;
        x06 = rotl(x06 ^ x10, 12);
        x02 = (x02 + x06) | 0;
        x14 = rotl(x14 ^ x02, 8);
        x10 = (x10 + x14) | 0;
        x06 = rotl(x06 ^ x10, 7);
        x03 = (x03 + x07) | 0;
        x15 = rotl(x15 ^ x03, 16);
        x11 = (x11 + x15) | 0;
        x07 = rotl(x07 ^ x11, 12);
        x03 = (x03 + x07) | 0;
        x15 = rotl(x15 ^ x03, 8);
        x11 = (x11 + x15) | 0;
        x07 = rotl(x07 ^ x11, 7);
        x00 = (x00 + x05) | 0;
        x15 = rotl(x15 ^ x00, 16);
        x10 = (x10 + x15) | 0;
        x05 = rotl(x05 ^ x10, 12);
        x00 = (x00 + x05) | 0;
        x15 = rotl(x15 ^ x00, 8);
        x10 = (x10 + x15) | 0;
        x05 = rotl(x05 ^ x10, 7);
        x01 = (x01 + x06) | 0;
        x12 = rotl(x12 ^ x01, 16);
        x11 = (x11 + x12) | 0;
        x06 = rotl(x06 ^ x11, 12);
        x01 = (x01 + x06) | 0;
        x12 = rotl(x12 ^ x01, 8);
        x11 = (x11 + x12) | 0;
        x06 = rotl(x06 ^ x11, 7);
        x02 = (x02 + x07) | 0;
        x13 = rotl(x13 ^ x02, 16);
        x08 = (x08 + x13) | 0;
        x07 = rotl(x07 ^ x08, 12);
        x02 = (x02 + x07) | 0;
        x13 = rotl(x13 ^ x02, 8);
        x08 = (x08 + x13) | 0;
        x07 = rotl(x07 ^ x08, 7);
        x03 = (x03 + x04) | 0;
        x14 = rotl(x14 ^ x03, 16);
        x09 = (x09 + x14) | 0;
        x04 = rotl(x04 ^ x09, 12);
        x03 = (x03 + x04) | 0;
        x14 = rotl(x14 ^ x03, 8);
        x09 = (x09 + x14) | 0;
        x04 = rotl(x04 ^ x09, 7);
    }
    var oi = 0;
    o32[oi++] = x00;
    o32[oi++] = x01;
    o32[oi++] = x02;
    o32[oi++] = x03;
    o32[oi++] = x12;
    o32[oi++] = x13;
    o32[oi++] = x14;
    o32[oi++] = x15;
};
exports._hchacha20 = _hchacha20;
var rotl = function (a, b) {
    return (a << b) | (a >>> (32 - b));
};


/***/ }),

/***/ 9398:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.aes256cbc = exports.aes256gcm = void 0;
var compat_1 = __nccwpck_require__(6114);
var aes256gcm = function (key, nonce, AAD) {
    return (0, compat_1._compat)("aes-256-gcm", key, nonce, AAD);
};
exports.aes256gcm = aes256gcm;
var aes256cbc = function (key, nonce, AAD) {
    return (0, compat_1._compat)("aes-256-cbc", key, nonce);
};
exports.aes256cbc = aes256cbc;


/***/ }),

/***/ 149:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.chacha20 = exports.xchacha20 = void 0;
var utils_1 = __nccwpck_require__(4621);
var compat_1 = __nccwpck_require__(6114);
var hchacha_1 = __nccwpck_require__(1334);
var xchacha20 = function (key, nonce, AAD) {
    if (nonce.length !== 24) {
        throw new Error("xchacha20's nonce must be 24 bytes");
    }
    var constants = new Uint32Array([0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]); // "expand 32-byte k"
    var subKey = new Uint32Array(8);
    (0, hchacha_1._hchacha20)(constants, (0, utils_1.u32)(key), (0, utils_1.u32)(nonce.subarray(0, 16)), subKey);
    var subNonce = new Uint8Array(12);
    subNonce.set([0, 0, 0, 0]);
    subNonce.set(nonce.subarray(16), 4);
    return (0, compat_1._compat)("chacha20-poly1305", (0, utils_1.u8)(subKey), subNonce, AAD);
};
exports.xchacha20 = xchacha20;
var chacha20 = function (key, nonce, AAD) {
    if (nonce.length !== 12) {
        throw new Error("chacha20's nonce must be 12 bytes");
    }
    return (0, compat_1._compat)("chacha20-poly1305", key, nonce, AAD);
};
exports.chacha20 = chacha20;


/***/ }),

/***/ 8479:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Internal assertion helpers.
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.abool = abool;
exports.abytes = abytes;
exports.aexists = aexists;
exports.ahash = ahash;
exports.anumber = anumber;
exports.aoutput = aoutput;
exports.isBytes = isBytes;
function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
        throw new Error('positive integer expected, got ' + n);
}
// copied from utils
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
function abytes(b, ...lengths) {
    if (!isBytes(b))
        throw new Error('Uint8Array expected');
    if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error('Uint8Array expected of length ' + lengths + ', got length=' + b.length);
}
function ahash(h) {
    if (typeof h !== 'function' || typeof h.create !== 'function')
        throw new Error('Hash should be wrapped by utils.wrapConstructor');
    anumber(h.outputLen);
    anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
        throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished)
        throw new Error('Hash#digest() has already been called');
}
function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error('digestInto() expects output buffer of length at least ' + min);
    }
}
function abool(b) {
    if (typeof b !== 'boolean')
        throw new Error(`boolean expected, not ${b}`);
}
//# sourceMappingURL=_assert.js.map

/***/ }),

/***/ 2183:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.crypto = void 0;
/**
 * Internal webcrypto alias.
 * We prefer WebCrypto aka globalThis.crypto, which exists in node.js 16+.
 * Falls back to Node.js built-in crypto for Node.js <=v14.
 * See utils.ts for details.
 * @module
 */
// @ts-ignore
const nc = __nccwpck_require__(7598);
exports.crypto = nc && typeof nc === 'object' && 'webcrypto' in nc
    ? nc.webcrypto
    : nc && typeof nc === 'object' && 'randomBytes' in nc
        ? nc
        : undefined;
//# sourceMappingURL=cryptoNode.js.map

/***/ }),

/***/ 4621:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.wrapCipher = exports.Hash = exports.nextTick = exports.isLE = exports.createView = exports.u32 = exports.u8 = void 0;
exports.bytesToHex = bytesToHex;
exports.hexToBytes = hexToBytes;
exports.hexToNumber = hexToNumber;
exports.bytesToNumberBE = bytesToNumberBE;
exports.numberToBytesBE = numberToBytesBE;
exports.utf8ToBytes = utf8ToBytes;
exports.bytesToUtf8 = bytesToUtf8;
exports.toBytes = toBytes;
exports.overlapBytes = overlapBytes;
exports.complexOverlapBytes = complexOverlapBytes;
exports.concatBytes = concatBytes;
exports.checkOpts = checkOpts;
exports.equalBytes = equalBytes;
exports.getOutput = getOutput;
exports.setBigUint64 = setBigUint64;
exports.u64Lengths = u64Lengths;
exports.isAligned32 = isAligned32;
exports.copyBytes = copyBytes;
exports.clean = clean;
/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
const _assert_js_1 = __nccwpck_require__(8479);
// Cast array to different type
const u8 = (arr) => new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
exports.u8 = u8;
const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
exports.u32 = u32;
// Cast array to view
const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
exports.createView = createView;
// big-endian hardware is rare. Just in case someone still decides to run ciphers:
// early-throw an error because we don't support BE yet.
exports.isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
if (!exports.isLE)
    throw new Error('Non little-endian hardware is not supported');
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    (0, _assert_js_1.abytes)(bytes);
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
        return ch - asciis._0; // '2' => 50-48
    if (ch >= asciis.A && ch <= asciis.F)
        return ch - (asciis.A - 10); // 'B' => 66-(65-10)
    if (ch >= asciis.a && ch <= asciis.f)
        return ch - (asciis.a - 10); // 'b' => 98-(97-10)
    return;
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
        throw new Error('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
    }
    return array;
}
function hexToNumber(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    return BigInt(hex === '' ? '0' : '0x' + hex); // Big Endian
}
// BE: Big Endian, LE: Little Endian
function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
}
function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, '0'));
}
// There is no setImmediate in browser and setTimeout is slow.
// call of async fn will return Promise, which will be fullfiled only on
// next scheduler queue processing step and this is exactly what we need.
const nextTick = async () => { };
exports.nextTick = nextTick;
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error('string expected');
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * @example bytesToUtf8(new Uint8Array([97, 98, 99])) // 'abc'
 */
function bytesToUtf8(bytes) {
    return new TextDecoder().decode(bytes);
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    else if ((0, _assert_js_1.isBytes)(data))
        data = copyBytes(data);
    else
        throw new Error('Uint8Array expected, got ' + typeof data);
    return data;
}
/**
 * Checks if two U8A use same underlying buffer and overlaps (will corrupt and break if input and output same)
 */
function overlapBytes(a, b) {
    return (a.buffer === b.buffer && // probably will fail with some obscure proxies, but this is best we can do
        a.byteOffset < b.byteOffset + b.byteLength && // a starts before b end
        b.byteOffset < a.byteOffset + a.byteLength // b starts before a end
    );
}
/**
 * If input and output overlap and input starts before output, we will overwrite end of input before
 * we start processing it, so this is not supported for most ciphers (except chacha/salse, which designed with this)
 */
function complexOverlapBytes(input, output) {
    // This is very cursed. It works somehow, but I'm completely unsure,
    // reasoning about overlapping aligned windows is very hard.
    if (overlapBytes(input, output) && input.byteOffset < output.byteOffset)
        throw new Error('complex overlap of input and output is not supported');
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        (0, _assert_js_1.abytes)(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
function checkOpts(defaults, opts) {
    if (opts == null || typeof opts !== 'object')
        throw new Error('options must be defined');
    const merged = Object.assign(defaults, opts);
    return merged;
}
// Compares 2 u8a-s in kinda constant time
function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
    return diff === 0;
}
// For runtime check if class implements interface
class Hash {
}
exports.Hash = Hash;
/**
 * @__NO_SIDE_EFFECTS__
 */
const wrapCipher = (params, constructor) => {
    function wrappedCipher(key, ...args) {
        // Validate key
        (0, _assert_js_1.abytes)(key);
        // Validate nonce if nonceLength is present
        if (params.nonceLength !== undefined) {
            const nonce = args[0];
            if (!nonce)
                throw new Error('nonce / iv required');
            if (params.varSizeNonce)
                (0, _assert_js_1.abytes)(nonce);
            else
                (0, _assert_js_1.abytes)(nonce, params.nonceLength);
        }
        // Validate AAD if tagLength present
        const tagl = params.tagLength;
        if (tagl && args[1] !== undefined) {
            (0, _assert_js_1.abytes)(args[1]);
        }
        const cipher = constructor(key, ...args);
        const checkOutput = (fnLength, output) => {
            if (output !== undefined) {
                if (fnLength !== 2)
                    throw new Error('cipher output not supported');
                (0, _assert_js_1.abytes)(output);
            }
        };
        // Create wrapped cipher with validation and single-use encryption
        let called = false;
        const wrCipher = {
            encrypt(data, output) {
                if (called)
                    throw new Error('cannot encrypt() twice with same key + nonce');
                called = true;
                (0, _assert_js_1.abytes)(data);
                checkOutput(cipher.encrypt.length, output);
                return cipher.encrypt(data, output);
            },
            decrypt(data, output) {
                (0, _assert_js_1.abytes)(data);
                if (tagl && data.length < tagl)
                    throw new Error('invalid ciphertext length: smaller than tagLength=' + tagl);
                checkOutput(cipher.decrypt.length, output);
                return cipher.decrypt(data, output);
            },
        };
        return wrCipher;
    }
    Object.assign(wrappedCipher, params);
    return wrappedCipher;
};
exports.wrapCipher = wrapCipher;
function getOutput(expectedLength, out, onlyAligned = true) {
    if (out === undefined)
        return new Uint8Array(expectedLength);
    if (out.length !== expectedLength)
        throw new Error('invalid output length, expected ' + expectedLength + ', got: ' + out.length);
    if (onlyAligned && !isAligned32(out))
        throw new Error('invalid output, must be aligned');
    return out;
}
// Polyfill for Safari 14
function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === 'function')
        return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(0xffffffff);
    const wh = Number((value >> _32n) & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
}
function u64Lengths(ciphertext, AAD) {
    const num = new Uint8Array(16);
    const view = (0, exports.createView)(num);
    setBigUint64(view, 0, BigInt(AAD ? AAD.length : 0), true);
    setBigUint64(view, 8, BigInt(ciphertext.length), true);
    return num;
}
// Is byte array aligned to 4 byte offset (u32)?
function isAligned32(bytes) {
    return bytes.byteOffset % 4 === 0;
}
// copy bytes to new u8a (aligned). Because Buffer.slice is broken.
function copyBytes(bytes) {
    return Uint8Array.from(bytes);
}
function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
        arrays[i].fill(0);
    }
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 1287:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gcm = exports.ctr = exports.cbc = exports.utils = void 0;
exports.randomBytes = randomBytes;
exports.getWebcryptoSubtle = getWebcryptoSubtle;
exports.managedNonce = managedNonce;
/**
 * WebCrypto-based AES gcm/ctr/cbc, `managedNonce` and `randomBytes`.
 * We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
 * node.js versions earlier than v19 don't declare it in global scope.
 * For node.js, package.js on#exports field mapping rewrites import
 * from `crypto` to `cryptoNode`, which imports native module.
 * Makes the utils un-importable in browsers without a bundler.
 * Once node.js 18 is deprecated, we can just drop the import.
 * @module
 */
// Use full path so that Node.js can rewrite it to `cryptoNode.js`.
const crypto_1 = __nccwpck_require__(2183);
const _assert_js_1 = __nccwpck_require__(8479);
const utils_js_1 = __nccwpck_require__(4621);
/**
 * Secure PRNG. Uses `crypto.getRandomValues`, which defers to OS.
 */
function randomBytes(bytesLength = 32) {
    if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === 'function') {
        return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    // Legacy Node.js compatibility
    if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === 'function') {
        return crypto_1.crypto.randomBytes(bytesLength);
    }
    throw new Error('crypto.getRandomValues must be defined');
}
function getWebcryptoSubtle() {
    if (crypto_1.crypto && typeof crypto_1.crypto.subtle === 'object' && crypto_1.crypto.subtle != null)
        return crypto_1.crypto.subtle;
    throw new Error('crypto.subtle must be defined');
}
/**
 * Uses CSPRG for nonce, nonce injected in ciphertext.
 * @example
 * const gcm = managedNonce(aes.gcm);
 * const ciphr = gcm(key).encrypt(data);
 * const plain = gcm(key).decrypt(ciph);
 */
function managedNonce(fn) {
    const { nonceLength } = fn;
    (0, _assert_js_1.anumber)(nonceLength);
    return ((key, ...args) => ({
        encrypt(plaintext, ...argsEnc) {
            const nonce = randomBytes(nonceLength);
            const ciphertext = fn(key, nonce, ...args).encrypt(plaintext, ...argsEnc);
            const out = (0, utils_js_1.concatBytes)(nonce, ciphertext);
            ciphertext.fill(0);
            return out;
        },
        decrypt(ciphertext, ...argsDec) {
            const nonce = ciphertext.subarray(0, nonceLength);
            const data = ciphertext.subarray(nonceLength);
            return fn(key, nonce, ...args).decrypt(data, ...argsDec);
        },
    }));
}
// Overridable
// @TODO
exports.utils = {
    async encrypt(key, keyParams, cryptParams, plaintext) {
        const cr = getWebcryptoSubtle();
        const iKey = await cr.importKey('raw', key, keyParams, true, ['encrypt']);
        const ciphertext = await cr.encrypt(cryptParams, iKey, plaintext);
        return new Uint8Array(ciphertext);
    },
    async decrypt(key, keyParams, cryptParams, ciphertext) {
        const cr = getWebcryptoSubtle();
        const iKey = await cr.importKey('raw', key, keyParams, true, ['decrypt']);
        const plaintext = await cr.decrypt(cryptParams, iKey, ciphertext);
        return new Uint8Array(plaintext);
    },
};
const mode = {
    CBC: 'AES-CBC',
    CTR: 'AES-CTR',
    GCM: 'AES-GCM',
};
function getCryptParams(algo, nonce, AAD) {
    if (algo === mode.CBC)
        return { name: mode.CBC, iv: nonce };
    if (algo === mode.CTR)
        return { name: mode.CTR, counter: nonce, length: 64 };
    if (algo === mode.GCM) {
        if (AAD)
            return { name: mode.GCM, iv: nonce, additionalData: AAD };
        else
            return { name: mode.GCM, iv: nonce };
    }
    throw new Error('unknown aes block mode');
}
function generate(algo) {
    return (key, nonce, AAD) => {
        (0, _assert_js_1.abytes)(key);
        (0, _assert_js_1.abytes)(nonce);
        const keyParams = { name: algo, length: key.length * 8 };
        const cryptParams = getCryptParams(algo, nonce, AAD);
        let consumed = false;
        return {
            // keyLength,
            encrypt(plaintext) {
                (0, _assert_js_1.abytes)(plaintext);
                if (consumed)
                    throw new Error('Cannot encrypt() twice with same key / nonce');
                consumed = true;
                return exports.utils.encrypt(key, keyParams, cryptParams, plaintext);
            },
            decrypt(ciphertext) {
                (0, _assert_js_1.abytes)(ciphertext);
                return exports.utils.decrypt(key, keyParams, cryptParams, ciphertext);
            },
        };
    };
}
/** AES-CBC, native webcrypto version */
exports.cbc = (() => generate(mode.CBC))();
/** AES-CTR, native webcrypto version */
exports.ctr = (() => generate(mode.CTR))();
/** AES-GCM, native webcrypto version */
exports.gcm = 
/* @__PURE__ */ (() => generate(mode.GCM))();
// // Type tests
// import { siv, gcm, ctr, ecb, cbc } from '../aes.js';
// import { xsalsa20poly1305 } from '../salsa.js';
// import { chacha20poly1305, xchacha20poly1305 } from '../chacha.js';
// const wsiv = managedNonce(siv);
// const wgcm = managedNonce(gcm);
// const wctr = managedNonce(ctr);
// const wcbc = managedNonce(cbc);
// const wsalsapoly = managedNonce(xsalsa20poly1305);
// const wchacha = managedNonce(chacha20poly1305);
// const wxchacha = managedNonce(xchacha20poly1305);
// // should fail
// const wcbc2 = managedNonce(managedNonce(cbc));
// const wctr = managedNonce(ctr);
//# sourceMappingURL=webcrypto.js.map

/***/ }),

/***/ 7512:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getHash = getHash;
exports.createCurve = createCurve;
/**
 * Utilities for short weierstrass curves, combined with noble-hashes.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const hmac_1 = __nccwpck_require__(8024);
const utils_1 = __nccwpck_require__(9342);
const weierstrass_js_1 = __nccwpck_require__(7859);
/** connects noble-curves to noble-hashes */
function getHash(hash) {
    return {
        hash,
        hmac: (key, ...msgs) => (0, hmac_1.hmac)(hash, key, (0, utils_1.concatBytes)(...msgs)),
        randomBytes: utils_1.randomBytes,
    };
}
function createCurve(curveDef, defHash) {
    const create = (hash) => (0, weierstrass_js_1.weierstrass)({ ...curveDef, ...getHash(hash) });
    return { ...create(defHash), create };
}
//# sourceMappingURL=_shortw_utils.js.map

/***/ }),

/***/ 9460:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.wNAF = wNAF;
exports.pippenger = pippenger;
exports.precomputeMSMUnsafe = precomputeMSMUnsafe;
exports.validateBasic = validateBasic;
/**
 * Methods for elliptic curve multiplication by scalars.
 * Contains wNAF, pippenger
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const modular_js_1 = __nccwpck_require__(5705);
const utils_js_1 = __nccwpck_require__(7442);
const _0n = BigInt(0);
const _1n = BigInt(1);
function constTimeNegate(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
}
function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
        throw new Error('invalid window size, expected [1..' + bits + '], got W=' + W);
}
function calcWOpts(W, bits) {
    validateW(W, bits);
    const windows = Math.ceil(bits / W) + 1; // +1, because
    const windowSize = 2 ** (W - 1); // -1 because we skip zero
    return { windows, windowSize };
}
function validateMSMPoints(points, c) {
    if (!Array.isArray(points))
        throw new Error('array expected');
    points.forEach((p, i) => {
        if (!(p instanceof c))
            throw new Error('invalid point at index ' + i);
    });
}
function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars))
        throw new Error('array of scalars expected');
    scalars.forEach((s, i) => {
        if (!field.isValid(s))
            throw new Error('invalid scalar at index ' + i);
    });
}
// Since points in different groups cannot be equal (different object constructor),
// we can have single place to store precomputes
const pointPrecomputes = new WeakMap();
const pointWindowSizes = new WeakMap(); // This allows use make points immutable (nothing changes inside)
function getW(P) {
    return pointWindowSizes.get(P) || 1;
}
/**
 * Elliptic curve multiplication of Point by scalar. Fragile.
 * Scalars should always be less than curve order: this should be checked inside of a curve itself.
 * Creates precomputation tables for fast multiplication:
 * - private scalar is split by fixed size windows of W bits
 * - every window point is collected from window's table & added to accumulator
 * - since windows are different, same point inside tables won't be accessed more than once per calc
 * - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
 * - +1 window is neccessary for wNAF
 * - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
 *
 * @todo Research returning 2d JS array of windows, instead of a single window.
 * This would allow windows to be in different memory locations
 */
function wNAF(c, bits) {
    return {
        constTimeNegate,
        hasPrecomputes(elm) {
            return getW(elm) !== 1;
        },
        // non-const time multiplication ladder
        unsafeLadder(elm, n, p = c.ZERO) {
            let d = elm;
            while (n > _0n) {
                if (n & _1n)
                    p = p.add(d);
                d = d.double();
                n >>= _1n;
            }
            return p;
        },
        /**
         * Creates a wNAF precomputation window. Used for caching.
         * Default window size is set by `utils.precompute()` and is equal to 8.
         * Number of precomputed points depends on the curve size:
         * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
         * - 𝑊 is the window size
         * - 𝑛 is the bitlength of the curve order.
         * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
         * @param elm Point instance
         * @param W window size
         * @returns precomputed point tables flattened to a single array
         */
        precomputeWindow(elm, W) {
            const { windows, windowSize } = calcWOpts(W, bits);
            const points = [];
            let p = elm;
            let base = p;
            for (let window = 0; window < windows; window++) {
                base = p;
                points.push(base);
                // =1, because we skip zero
                for (let i = 1; i < windowSize; i++) {
                    base = base.add(p);
                    points.push(base);
                }
                p = base.double();
            }
            return points;
        },
        /**
         * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
         * @param W window size
         * @param precomputes precomputed tables
         * @param n scalar (we don't check here, but should be less than curve order)
         * @returns real and fake (for const-time) points
         */
        wNAF(W, precomputes, n) {
            // TODO: maybe check that scalar is less than group order? wNAF behavious is undefined otherwise
            // But need to carefully remove other checks before wNAF. ORDER == bits here
            const { windows, windowSize } = calcWOpts(W, bits);
            let p = c.ZERO;
            let f = c.BASE;
            const mask = BigInt(2 ** W - 1); // Create mask with W ones: 0b1111 for W=4 etc.
            const maxNumber = 2 ** W;
            const shiftBy = BigInt(W);
            for (let window = 0; window < windows; window++) {
                const offset = window * windowSize;
                // Extract W bits.
                let wbits = Number(n & mask);
                // Shift number by W bits.
                n >>= shiftBy;
                // If the bits are bigger than max size, we'll split those.
                // +224 => 256 - 32
                if (wbits > windowSize) {
                    wbits -= maxNumber;
                    n += _1n;
                }
                // This code was first written with assumption that 'f' and 'p' will never be infinity point:
                // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
                // there is negate now: it is possible that negated element from low value
                // would be the same as high element, which will create carry into next window.
                // It's not obvious how this can fail, but still worth investigating later.
                // Check if we're onto Zero point.
                // Add random point inside current window to f.
                const offset1 = offset;
                const offset2 = offset + Math.abs(wbits) - 1; // -1 because we skip zero
                const cond1 = window % 2 !== 0;
                const cond2 = wbits < 0;
                if (wbits === 0) {
                    // The most important part for const-time getPublicKey
                    f = f.add(constTimeNegate(cond1, precomputes[offset1]));
                }
                else {
                    p = p.add(constTimeNegate(cond2, precomputes[offset2]));
                }
            }
            // JIT-compiler should not eliminate f here, since it will later be used in normalizeZ()
            // Even if the variable is still unused, there are some checks which will
            // throw an exception, so compiler needs to prove they won't happen, which is hard.
            // At this point there is a way to F be infinity-point even if p is not,
            // which makes it less const-time: around 1 bigint multiply.
            return { p, f };
        },
        /**
         * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
         * @param W window size
         * @param precomputes precomputed tables
         * @param n scalar (we don't check here, but should be less than curve order)
         * @param acc accumulator point to add result of multiplication
         * @returns point
         */
        wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
            const { windows, windowSize } = calcWOpts(W, bits);
            const mask = BigInt(2 ** W - 1); // Create mask with W ones: 0b1111 for W=4 etc.
            const maxNumber = 2 ** W;
            const shiftBy = BigInt(W);
            for (let window = 0; window < windows; window++) {
                const offset = window * windowSize;
                if (n === _0n)
                    break; // No need to go over empty scalar
                // Extract W bits.
                let wbits = Number(n & mask);
                // Shift number by W bits.
                n >>= shiftBy;
                // If the bits are bigger than max size, we'll split those.
                // +224 => 256 - 32
                if (wbits > windowSize) {
                    wbits -= maxNumber;
                    n += _1n;
                }
                if (wbits === 0)
                    continue;
                let curr = precomputes[offset + Math.abs(wbits) - 1]; // -1 because we skip zero
                if (wbits < 0)
                    curr = curr.negate();
                // NOTE: by re-using acc, we can save a lot of additions in case of MSM
                acc = acc.add(curr);
            }
            return acc;
        },
        getPrecomputes(W, P, transform) {
            // Calculate precomputes on a first run, reuse them after
            let comp = pointPrecomputes.get(P);
            if (!comp) {
                comp = this.precomputeWindow(P, W);
                if (W !== 1)
                    pointPrecomputes.set(P, transform(comp));
            }
            return comp;
        },
        wNAFCached(P, n, transform) {
            const W = getW(P);
            return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
        },
        wNAFCachedUnsafe(P, n, transform, prev) {
            const W = getW(P);
            if (W === 1)
                return this.unsafeLadder(P, n, prev); // For W=1 ladder is ~x2 faster
            return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
        },
        // We calculate precomputes for elliptic curve point multiplication
        // using windowed method. This specifies window size and
        // stores precomputed values. Usually only base point would be precomputed.
        setWindowSize(P, W) {
            validateW(W, bits);
            pointWindowSizes.set(P, W);
            pointPrecomputes.delete(P);
        },
    };
}
/**
 * Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
 * 30x faster vs naive addition on L=4096, 10x faster with precomputes.
 * For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
 * Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
 * @param c Curve Point constructor
 * @param fieldN field over CURVE.N - important that it's not over CURVE.P
 * @param points array of L curve points
 * @param scalars array of L scalars (aka private keys / bigints)
 */
function pippenger(c, fieldN, points, scalars) {
    // If we split scalars by some window (let's say 8 bits), every chunk will only
    // take 256 buckets even if there are 4096 scalars, also re-uses double.
    // TODO:
    // - https://eprint.iacr.org/2024/750.pdf
    // - https://tches.iacr.org/index.php/TCHES/article/view/10287
    // 0 is accepted in scalars
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    if (points.length !== scalars.length)
        throw new Error('arrays of points and scalars must have equal length');
    const zero = c.ZERO;
    const wbits = (0, utils_js_1.bitLen)(BigInt(points.length));
    const windowSize = wbits > 12 ? wbits - 3 : wbits > 4 ? wbits - 2 : wbits ? 2 : 1; // in bits
    const MASK = (1 << windowSize) - 1;
    const buckets = new Array(MASK + 1).fill(zero); // +1 for zero array
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for (let i = lastBits; i >= 0; i -= windowSize) {
        buckets.fill(zero);
        for (let j = 0; j < scalars.length; j++) {
            const scalar = scalars[j];
            const wbits = Number((scalar >> BigInt(i)) & BigInt(MASK));
            buckets[wbits] = buckets[wbits].add(points[j]);
        }
        let resI = zero; // not using this will do small speed-up, but will lose ct
        // Skip first bucket, because it is zero
        for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
            sumI = sumI.add(buckets[j]);
            resI = resI.add(sumI);
        }
        sum = sum.add(resI);
        if (i !== 0)
            for (let j = 0; j < windowSize; j++)
                sum = sum.double();
    }
    return sum;
}
/**
 * Precomputed multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
 * @param c Curve Point constructor
 * @param fieldN field over CURVE.N - important that it's not over CURVE.P
 * @param points array of L curve points
 * @returns function which multiplies points with scaars
 */
function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
    /**
     * Performance Analysis of Window-based Precomputation
     *
     * Base Case (256-bit scalar, 8-bit window):
     * - Standard precomputation requires:
     *   - 31 additions per scalar × 256 scalars = 7,936 ops
     *   - Plus 255 summary additions = 8,191 total ops
     *   Note: Summary additions can be optimized via accumulator
     *
     * Chunked Precomputation Analysis:
     * - Using 32 chunks requires:
     *   - 255 additions per chunk
     *   - 256 doublings
     *   - Total: (255 × 32) + 256 = 8,416 ops
     *
     * Memory Usage Comparison:
     * Window Size | Standard Points | Chunked Points
     * ------------|-----------------|---------------
     *     4-bit   |     520         |      15
     *     8-bit   |    4,224        |     255
     *    10-bit   |   13,824        |   1,023
     *    16-bit   |  557,056        |  65,535
     *
     * Key Advantages:
     * 1. Enables larger window sizes due to reduced memory overhead
     * 2. More efficient for smaller scalar counts:
     *    - 16 chunks: (16 × 255) + 256 = 4,336 ops
     *    - ~2x faster than standard 8,191 ops
     *
     * Limitations:
     * - Not suitable for plain precomputes (requires 256 constant doublings)
     * - Performance degrades with larger scalar counts:
     *   - Optimal for ~256 scalars
     *   - Less efficient for 4096+ scalars (Pippenger preferred)
     */
    validateW(windowSize, fieldN.BITS);
    validateMSMPoints(points, c);
    const zero = c.ZERO;
    const tableSize = 2 ** windowSize - 1; // table size (without zero)
    const chunks = Math.ceil(fieldN.BITS / windowSize); // chunks of item
    const MASK = BigInt((1 << windowSize) - 1);
    const tables = points.map((p) => {
        const res = [];
        for (let i = 0, acc = p; i < tableSize; i++) {
            res.push(acc);
            acc = acc.add(p);
        }
        return res;
    });
    return (scalars) => {
        validateMSMScalars(scalars, fieldN);
        if (scalars.length > points.length)
            throw new Error('array of scalars must be smaller than array of points');
        let res = zero;
        for (let i = 0; i < chunks; i++) {
            // No need to double if accumulator is still zero.
            if (res !== zero)
                for (let j = 0; j < windowSize; j++)
                    res = res.double();
            const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
            for (let j = 0; j < scalars.length; j++) {
                const n = scalars[j];
                const curr = Number((n >> shiftBy) & MASK);
                if (!curr)
                    continue; // skip zero scalars chunks
                res = res.add(tables[j][curr - 1]);
            }
        }
        return res;
    };
}
function validateBasic(curve) {
    (0, modular_js_1.validateField)(curve.Fp);
    (0, utils_js_1.validateObject)(curve, {
        n: 'bigint',
        h: 'bigint',
        Gx: 'field',
        Gy: 'field',
    }, {
        nBitLength: 'isSafeInteger',
        nByteLength: 'isSafeInteger',
    });
    // Set defaults
    return Object.freeze({
        ...(0, modular_js_1.nLength)(curve.n, curve.nBitLength),
        ...curve,
        ...{ p: curve.Fp.ORDER },
    });
}
//# sourceMappingURL=curve.js.map

/***/ }),

/***/ 4287:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.twistedEdwards = twistedEdwards;
/**
 * Twisted Edwards curve. The formula is: ax² + y² = 1 + dx²y².
 * For design rationale of types / exports, see weierstrass module documentation.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const curve_js_1 = __nccwpck_require__(9460);
const modular_js_1 = __nccwpck_require__(5705);
const ut = __nccwpck_require__(7442);
const utils_js_1 = __nccwpck_require__(7442);
// Be friendly to bad ECMAScript parsers by not using bigint literals
// prettier-ignore
const _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _8n = BigInt(8);
// verification rule is either zip215 or rfc8032 / nist186-5. Consult fromHex:
const VERIFY_DEFAULT = { zip215: true };
function validateOpts(curve) {
    const opts = (0, curve_js_1.validateBasic)(curve);
    ut.validateObject(curve, {
        hash: 'function',
        a: 'bigint',
        d: 'bigint',
        randomBytes: 'function',
    }, {
        adjustScalarBytes: 'function',
        domain: 'function',
        uvRatio: 'function',
        mapToCurve: 'function',
    });
    // Set defaults
    return Object.freeze({ ...opts });
}
/**
 * Creates Twisted Edwards curve with EdDSA signatures.
 * @example
 * import { Field } from '@noble/curves/abstract/modular';
 * // Before that, define BigInt-s: a, d, p, n, Gx, Gy, h
 * const curve = twistedEdwards({ a, d, Fp: Field(p), n, Gx, Gy, h })
 */
function twistedEdwards(curveDef) {
    const CURVE = validateOpts(curveDef);
    const { Fp, n: CURVE_ORDER, prehash: prehash, hash: cHash, randomBytes, nByteLength, h: cofactor, } = CURVE;
    // Important:
    // There are some places where Fp.BYTES is used instead of nByteLength.
    // So far, everything has been tested with curves of Fp.BYTES == nByteLength.
    // TODO: test and find curves which behave otherwise.
    const MASK = _2n << (BigInt(nByteLength * 8) - _1n);
    const modP = Fp.create; // Function overrides
    const Fn = (0, modular_js_1.Field)(CURVE.n, CURVE.nBitLength);
    // sqrt(u/v)
    const uvRatio = CURVE.uvRatio ||
        ((u, v) => {
            try {
                return { isValid: true, value: Fp.sqrt(u * Fp.inv(v)) };
            }
            catch (e) {
                return { isValid: false, value: _0n };
            }
        });
    const adjustScalarBytes = CURVE.adjustScalarBytes || ((bytes) => bytes); // NOOP
    const domain = CURVE.domain ||
        ((data, ctx, phflag) => {
            (0, utils_js_1.abool)('phflag', phflag);
            if (ctx.length || phflag)
                throw new Error('Contexts/pre-hash are not supported');
            return data;
        }); // NOOP
    // 0 <= n < MASK
    // Coordinates larger than Fp.ORDER are allowed for zip215
    function aCoordinate(title, n) {
        ut.aInRange('coordinate ' + title, n, _0n, MASK);
    }
    function assertPoint(other) {
        if (!(other instanceof Point))
            throw new Error('ExtendedPoint expected');
    }
    // Converts Extended point to default (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    const toAffineMemo = (0, utils_js_1.memoized)((p, iz) => {
        const { ex: x, ey: y, ez: z } = p;
        const is0 = p.is0();
        if (iz == null)
            iz = is0 ? _8n : Fp.inv(z); // 8 was chosen arbitrarily
        const ax = modP(x * iz);
        const ay = modP(y * iz);
        const zz = modP(z * iz);
        if (is0)
            return { x: _0n, y: _1n };
        if (zz !== _1n)
            throw new Error('invZ was invalid');
        return { x: ax, y: ay };
    });
    const assertValidMemo = (0, utils_js_1.memoized)((p) => {
        const { a, d } = CURVE;
        if (p.is0())
            throw new Error('bad point: ZERO'); // TODO: optimize, with vars below?
        // Equation in affine coordinates: ax² + y² = 1 + dx²y²
        // Equation in projective coordinates (X/Z, Y/Z, Z):  (aX² + Y²)Z² = Z⁴ + dX²Y²
        const { ex: X, ey: Y, ez: Z, et: T } = p;
        const X2 = modP(X * X); // X²
        const Y2 = modP(Y * Y); // Y²
        const Z2 = modP(Z * Z); // Z²
        const Z4 = modP(Z2 * Z2); // Z⁴
        const aX2 = modP(X2 * a); // aX²
        const left = modP(Z2 * modP(aX2 + Y2)); // (aX² + Y²)Z²
        const right = modP(Z4 + modP(d * modP(X2 * Y2))); // Z⁴ + dX²Y²
        if (left !== right)
            throw new Error('bad point: equation left != right (1)');
        // In Extended coordinates we also have T, which is x*y=T/Z: check X*Y == Z*T
        const XY = modP(X * Y);
        const ZT = modP(Z * T);
        if (XY !== ZT)
            throw new Error('bad point: equation left != right (2)');
        return true;
    });
    // Extended Point works in extended coordinates: (x, y, z, t) ∋ (x=x/z, y=y/z, t=xy).
    // https://en.wikipedia.org/wiki/Twisted_Edwards_curve#Extended_coordinates
    class Point {
        constructor(ex, ey, ez, et) {
            this.ex = ex;
            this.ey = ey;
            this.ez = ez;
            this.et = et;
            aCoordinate('x', ex);
            aCoordinate('y', ey);
            aCoordinate('z', ez);
            aCoordinate('t', et);
            Object.freeze(this);
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        static fromAffine(p) {
            if (p instanceof Point)
                throw new Error('extended point not allowed');
            const { x, y } = p || {};
            aCoordinate('x', x);
            aCoordinate('y', y);
            return new Point(x, y, _1n, modP(x * y));
        }
        static normalizeZ(points) {
            const toInv = Fp.invertBatch(points.map((p) => p.ez));
            return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
        }
        // Multiscalar Multiplication
        static msm(points, scalars) {
            return (0, curve_js_1.pippenger)(Point, Fn, points, scalars);
        }
        // "Private method", don't use it directly
        _setWindowSize(windowSize) {
            wnaf.setWindowSize(this, windowSize);
        }
        // Not required for fromHex(), which always creates valid points.
        // Could be useful for fromAffine().
        assertValidity() {
            assertValidMemo(this);
        }
        // Compare one point to another.
        equals(other) {
            assertPoint(other);
            const { ex: X1, ey: Y1, ez: Z1 } = this;
            const { ex: X2, ey: Y2, ez: Z2 } = other;
            const X1Z2 = modP(X1 * Z2);
            const X2Z1 = modP(X2 * Z1);
            const Y1Z2 = modP(Y1 * Z2);
            const Y2Z1 = modP(Y2 * Z1);
            return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
        }
        is0() {
            return this.equals(Point.ZERO);
        }
        negate() {
            // Flips point sign to a negative one (-x, y in affine coords)
            return new Point(modP(-this.ex), this.ey, this.ez, modP(-this.et));
        }
        // Fast algo for doubling Extended Point.
        // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#doubling-dbl-2008-hwcd
        // Cost: 4M + 4S + 1*a + 6add + 1*2.
        double() {
            const { a } = CURVE;
            const { ex: X1, ey: Y1, ez: Z1 } = this;
            const A = modP(X1 * X1); // A = X12
            const B = modP(Y1 * Y1); // B = Y12
            const C = modP(_2n * modP(Z1 * Z1)); // C = 2*Z12
            const D = modP(a * A); // D = a*A
            const x1y1 = X1 + Y1;
            const E = modP(modP(x1y1 * x1y1) - A - B); // E = (X1+Y1)2-A-B
            const G = D + B; // G = D+B
            const F = G - C; // F = G-C
            const H = D - B; // H = D-B
            const X3 = modP(E * F); // X3 = E*F
            const Y3 = modP(G * H); // Y3 = G*H
            const T3 = modP(E * H); // T3 = E*H
            const Z3 = modP(F * G); // Z3 = F*G
            return new Point(X3, Y3, Z3, T3);
        }
        // Fast algo for adding 2 Extended Points.
        // https://hyperelliptic.org/EFD/g1p/auto-twisted-extended.html#addition-add-2008-hwcd
        // Cost: 9M + 1*a + 1*d + 7add.
        add(other) {
            assertPoint(other);
            const { a, d } = CURVE;
            const { ex: X1, ey: Y1, ez: Z1, et: T1 } = this;
            const { ex: X2, ey: Y2, ez: Z2, et: T2 } = other;
            // Faster algo for adding 2 Extended Points when curve's a=-1.
            // http://hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html#addition-add-2008-hwcd-4
            // Cost: 8M + 8add + 2*2.
            // Note: It does not check whether the `other` point is valid.
            if (a === BigInt(-1)) {
                const A = modP((Y1 - X1) * (Y2 + X2));
                const B = modP((Y1 + X1) * (Y2 - X2));
                const F = modP(B - A);
                if (F === _0n)
                    return this.double(); // Same point. Tests say it doesn't affect timing
                const C = modP(Z1 * _2n * T2);
                const D = modP(T1 * _2n * Z2);
                const E = D + C;
                const G = B + A;
                const H = D - C;
                const X3 = modP(E * F);
                const Y3 = modP(G * H);
                const T3 = modP(E * H);
                const Z3 = modP(F * G);
                return new Point(X3, Y3, Z3, T3);
            }
            const A = modP(X1 * X2); // A = X1*X2
            const B = modP(Y1 * Y2); // B = Y1*Y2
            const C = modP(T1 * d * T2); // C = T1*d*T2
            const D = modP(Z1 * Z2); // D = Z1*Z2
            const E = modP((X1 + Y1) * (X2 + Y2) - A - B); // E = (X1+Y1)*(X2+Y2)-A-B
            const F = D - C; // F = D-C
            const G = D + C; // G = D+C
            const H = modP(B - a * A); // H = B-a*A
            const X3 = modP(E * F); // X3 = E*F
            const Y3 = modP(G * H); // Y3 = G*H
            const T3 = modP(E * H); // T3 = E*H
            const Z3 = modP(F * G); // Z3 = F*G
            return new Point(X3, Y3, Z3, T3);
        }
        subtract(other) {
            return this.add(other.negate());
        }
        wNAF(n) {
            return wnaf.wNAFCached(this, n, Point.normalizeZ);
        }
        // Constant-time multiplication.
        multiply(scalar) {
            const n = scalar;
            ut.aInRange('scalar', n, _1n, CURVE_ORDER); // 1 <= scalar < L
            const { p, f } = this.wNAF(n);
            return Point.normalizeZ([p, f])[0];
        }
        // Non-constant-time multiplication. Uses double-and-add algorithm.
        // It's faster, but should only be used when you don't care about
        // an exposed private key e.g. sig verification.
        // Does NOT allow scalars higher than CURVE.n.
        // Accepts optional accumulator to merge with multiply (important for sparse scalars)
        multiplyUnsafe(scalar, acc = Point.ZERO) {
            const n = scalar;
            ut.aInRange('scalar', n, _0n, CURVE_ORDER); // 0 <= scalar < L
            if (n === _0n)
                return I;
            if (this.is0() || n === _1n)
                return this;
            return wnaf.wNAFCachedUnsafe(this, n, Point.normalizeZ, acc);
        }
        // Checks if point is of small order.
        // If you add something to small order point, you will have "dirty"
        // point with torsion component.
        // Multiplies point by cofactor and checks if the result is 0.
        isSmallOrder() {
            return this.multiplyUnsafe(cofactor).is0();
        }
        // Multiplies point by curve order and checks if the result is 0.
        // Returns `false` is the point is dirty.
        isTorsionFree() {
            return wnaf.unsafeLadder(this, CURVE_ORDER).is0();
        }
        // Converts Extended point to default (x, y) coordinates.
        // Can accept precomputed Z^-1 - for example, from invertBatch.
        toAffine(iz) {
            return toAffineMemo(this, iz);
        }
        clearCofactor() {
            const { h: cofactor } = CURVE;
            if (cofactor === _1n)
                return this;
            return this.multiplyUnsafe(cofactor);
        }
        // Converts hash string or Uint8Array to Point.
        // Uses algo from RFC8032 5.1.3.
        static fromHex(hex, zip215 = false) {
            const { d, a } = CURVE;
            const len = Fp.BYTES;
            hex = (0, utils_js_1.ensureBytes)('pointHex', hex, len); // copy hex to a new array
            (0, utils_js_1.abool)('zip215', zip215);
            const normed = hex.slice(); // copy again, we'll manipulate it
            const lastByte = hex[len - 1]; // select last byte
            normed[len - 1] = lastByte & ~0x80; // clear last bit
            const y = ut.bytesToNumberLE(normed);
            // zip215=true is good for consensus-critical apps. =false follows RFC8032 / NIST186-5.
            // RFC8032 prohibits >= p, but ZIP215 doesn't
            // zip215=true:  0 <= y < MASK (2^256 for ed25519)
            // zip215=false: 0 <= y < P (2^255-19 for ed25519)
            const max = zip215 ? MASK : Fp.ORDER;
            ut.aInRange('pointHex.y', y, _0n, max);
            // Ed25519: x² = (y²-1)/(dy²+1) mod p. Ed448: x² = (y²-1)/(dy²-1) mod p. Generic case:
            // ax²+y²=1+dx²y² => y²-1=dx²y²-ax² => y²-1=x²(dy²-a) => x²=(y²-1)/(dy²-a)
            const y2 = modP(y * y); // denominator is always non-0 mod p.
            const u = modP(y2 - _1n); // u = y² - 1
            const v = modP(d * y2 - a); // v = d y² + 1.
            let { isValid, value: x } = uvRatio(u, v); // √(u/v)
            if (!isValid)
                throw new Error('Point.fromHex: invalid y coordinate');
            const isXOdd = (x & _1n) === _1n; // There are 2 square roots. Use x_0 bit to select proper
            const isLastByteOdd = (lastByte & 0x80) !== 0; // x_0, last bit
            if (!zip215 && x === _0n && isLastByteOdd)
                // if x=0 and x_0 = 1, fail
                throw new Error('Point.fromHex: x=0 and x_0=1');
            if (isLastByteOdd !== isXOdd)
                x = modP(-x); // if x_0 != x mod 2, set x = p-x
            return Point.fromAffine({ x, y });
        }
        static fromPrivateKey(privKey) {
            return getExtendedPublicKey(privKey).point;
        }
        toRawBytes() {
            const { x, y } = this.toAffine();
            const bytes = ut.numberToBytesLE(y, Fp.BYTES); // each y has 2 x values (x, -y)
            bytes[bytes.length - 1] |= x & _1n ? 0x80 : 0; // when compressing, it's enough to store y
            return bytes; // and use the last byte to encode sign of x
        }
        toHex() {
            return ut.bytesToHex(this.toRawBytes()); // Same as toRawBytes, but returns string.
        }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n, modP(CURVE.Gx * CURVE.Gy));
    Point.ZERO = new Point(_0n, _1n, _1n, _0n); // 0, 1, 1, 0
    const { BASE: G, ZERO: I } = Point;
    const wnaf = (0, curve_js_1.wNAF)(Point, nByteLength * 8);
    function modN(a) {
        return (0, modular_js_1.mod)(a, CURVE_ORDER);
    }
    // Little-endian SHA512 with modulo n
    function modN_LE(hash) {
        return modN(ut.bytesToNumberLE(hash));
    }
    /** Convenience method that creates public key and other stuff. RFC8032 5.1.5 */
    function getExtendedPublicKey(key) {
        const len = Fp.BYTES;
        key = (0, utils_js_1.ensureBytes)('private key', key, len);
        // Hash private key with curve's hash function to produce uniformingly random input
        // Check byte lengths: ensure(64, h(ensure(32, key)))
        const hashed = (0, utils_js_1.ensureBytes)('hashed private key', cHash(key), 2 * len);
        const head = adjustScalarBytes(hashed.slice(0, len)); // clear first half bits, produce FE
        const prefix = hashed.slice(len, 2 * len); // second half is called key prefix (5.1.6)
        const scalar = modN_LE(head); // The actual private scalar
        const point = G.multiply(scalar); // Point on Edwards curve aka public key
        const pointBytes = point.toRawBytes(); // Uint8Array representation
        return { head, prefix, scalar, point, pointBytes };
    }
    // Calculates EdDSA pub key. RFC8032 5.1.5. Privkey is hashed. Use first half with 3 bits cleared
    function getPublicKey(privKey) {
        return getExtendedPublicKey(privKey).pointBytes;
    }
    // int('LE', SHA512(dom2(F, C) || msgs)) mod N
    function hashDomainToScalar(context = new Uint8Array(), ...msgs) {
        const msg = ut.concatBytes(...msgs);
        return modN_LE(cHash(domain(msg, (0, utils_js_1.ensureBytes)('context', context), !!prehash)));
    }
    /** Signs message with privateKey. RFC8032 5.1.6 */
    function sign(msg, privKey, options = {}) {
        msg = (0, utils_js_1.ensureBytes)('message', msg);
        if (prehash)
            msg = prehash(msg); // for ed25519ph etc.
        const { prefix, scalar, pointBytes } = getExtendedPublicKey(privKey);
        const r = hashDomainToScalar(options.context, prefix, msg); // r = dom2(F, C) || prefix || PH(M)
        const R = G.multiply(r).toRawBytes(); // R = rG
        const k = hashDomainToScalar(options.context, R, pointBytes, msg); // R || A || PH(M)
        const s = modN(r + k * scalar); // S = (r + k * s) mod L
        ut.aInRange('signature.s', s, _0n, CURVE_ORDER); // 0 <= s < l
        const res = ut.concatBytes(R, ut.numberToBytesLE(s, Fp.BYTES));
        return (0, utils_js_1.ensureBytes)('result', res, Fp.BYTES * 2); // 64-byte signature
    }
    const verifyOpts = VERIFY_DEFAULT;
    /**
     * Verifies EdDSA signature against message and public key. RFC8032 5.1.7.
     * An extended group equation is checked.
     */
    function verify(sig, msg, publicKey, options = verifyOpts) {
        const { context, zip215 } = options;
        const len = Fp.BYTES; // Verifies EdDSA signature against message and public key. RFC8032 5.1.7.
        sig = (0, utils_js_1.ensureBytes)('signature', sig, 2 * len); // An extended group equation is checked.
        msg = (0, utils_js_1.ensureBytes)('message', msg);
        publicKey = (0, utils_js_1.ensureBytes)('publicKey', publicKey, len);
        if (zip215 !== undefined)
            (0, utils_js_1.abool)('zip215', zip215);
        if (prehash)
            msg = prehash(msg); // for ed25519ph, etc
        const s = ut.bytesToNumberLE(sig.slice(len, 2 * len));
        let A, R, SB;
        try {
            // zip215=true is good for consensus-critical apps. =false follows RFC8032 / NIST186-5.
            // zip215=true:  0 <= y < MASK (2^256 for ed25519)
            // zip215=false: 0 <= y < P (2^255-19 for ed25519)
            A = Point.fromHex(publicKey, zip215);
            R = Point.fromHex(sig.slice(0, len), zip215);
            SB = G.multiplyUnsafe(s); // 0 <= s < l is done inside
        }
        catch (error) {
            return false;
        }
        if (!zip215 && A.isSmallOrder())
            return false;
        const k = hashDomainToScalar(context, R.toRawBytes(), A.toRawBytes(), msg);
        const RkA = R.add(A.multiplyUnsafe(k));
        // Extended group equation
        // [8][S]B = [8]R + [8][k]A'
        return RkA.subtract(SB).clearCofactor().equals(Point.ZERO);
    }
    G._setWindowSize(8); // Enable precomputes. Slows down first publicKey computation by 20ms.
    const utils = {
        getExtendedPublicKey,
        // ed25519 private keys are uniform 32b. No need to check for modulo bias, like in secp256k1.
        randomPrivateKey: () => randomBytes(Fp.BYTES),
        /**
         * We're doing scalar multiplication (used in getPublicKey etc) with precomputed BASE_POINT
         * values. This slows down first getPublicKey() by milliseconds (see Speed section),
         * but allows to speed-up subsequent getPublicKey() calls up to 20x.
         * @param windowSize 2, 4, 8, 16
         */
        precompute(windowSize = 8, point = Point.BASE) {
            point._setWindowSize(windowSize);
            point.multiply(BigInt(3));
            return point;
        },
    };
    return {
        CURVE,
        getPublicKey,
        sign,
        verify,
        ExtendedPoint: Point,
        utils,
    };
}
//# sourceMappingURL=edwards.js.map

/***/ }),

/***/ 9287:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.expand_message_xmd = expand_message_xmd;
exports.expand_message_xof = expand_message_xof;
exports.hash_to_field = hash_to_field;
exports.isogenyMap = isogenyMap;
exports.createHasher = createHasher;
const modular_js_1 = __nccwpck_require__(5705);
const utils_js_1 = __nccwpck_require__(7442);
// Octet Stream to Integer. "spec" implementation of os2ip is 2.5x slower vs bytesToNumberBE.
const os2ip = utils_js_1.bytesToNumberBE;
// Integer to Octet Stream (numberToBytesBE)
function i2osp(value, length) {
    anum(value);
    anum(length);
    if (value < 0 || value >= 1 << (8 * length))
        throw new Error('invalid I2OSP input: ' + value);
    const res = Array.from({ length }).fill(0);
    for (let i = length - 1; i >= 0; i--) {
        res[i] = value & 0xff;
        value >>>= 8;
    }
    return new Uint8Array(res);
}
function strxor(a, b) {
    const arr = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        arr[i] = a[i] ^ b[i];
    }
    return arr;
}
function anum(item) {
    if (!Number.isSafeInteger(item))
        throw new Error('number expected');
}
/**
 * Produces a uniformly random byte string using a cryptographic hash function H that outputs b bits.
 * [RFC 9380 5.3.1](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.1).
 */
function expand_message_xmd(msg, DST, lenInBytes, H) {
    (0, utils_js_1.abytes)(msg);
    (0, utils_js_1.abytes)(DST);
    anum(lenInBytes);
    // https://www.rfc-editor.org/rfc/rfc9380#section-5.3.3
    if (DST.length > 255)
        DST = H((0, utils_js_1.concatBytes)((0, utils_js_1.utf8ToBytes)('H2C-OVERSIZE-DST-'), DST));
    const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
    const ell = Math.ceil(lenInBytes / b_in_bytes);
    if (lenInBytes > 65535 || ell > 255)
        throw new Error('expand_message_xmd: invalid lenInBytes');
    const DST_prime = (0, utils_js_1.concatBytes)(DST, i2osp(DST.length, 1));
    const Z_pad = i2osp(0, r_in_bytes);
    const l_i_b_str = i2osp(lenInBytes, 2); // len_in_bytes_str
    const b = new Array(ell);
    const b_0 = H((0, utils_js_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
    b[0] = H((0, utils_js_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
    for (let i = 1; i <= ell; i++) {
        const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
        b[i] = H((0, utils_js_1.concatBytes)(...args));
    }
    const pseudo_random_bytes = (0, utils_js_1.concatBytes)(...b);
    return pseudo_random_bytes.slice(0, lenInBytes);
}
/**
 * Produces a uniformly random byte string using an extendable-output function (XOF) H.
 * 1. The collision resistance of H MUST be at least k bits.
 * 2. H MUST be an XOF that has been proved indifferentiable from
 *    a random oracle under a reasonable cryptographic assumption.
 * [RFC 9380 5.3.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.2).
 */
function expand_message_xof(msg, DST, lenInBytes, k, H) {
    (0, utils_js_1.abytes)(msg);
    (0, utils_js_1.abytes)(DST);
    anum(lenInBytes);
    // https://www.rfc-editor.org/rfc/rfc9380#section-5.3.3
    // DST = H('H2C-OVERSIZE-DST-' || a_very_long_DST, Math.ceil((lenInBytes * k) / 8));
    if (DST.length > 255) {
        const dkLen = Math.ceil((2 * k) / 8);
        DST = H.create({ dkLen }).update((0, utils_js_1.utf8ToBytes)('H2C-OVERSIZE-DST-')).update(DST).digest();
    }
    if (lenInBytes > 65535 || DST.length > 255)
        throw new Error('expand_message_xof: invalid lenInBytes');
    return (H.create({ dkLen: lenInBytes })
        .update(msg)
        .update(i2osp(lenInBytes, 2))
        // 2. DST_prime = DST || I2OSP(len(DST), 1)
        .update(DST)
        .update(i2osp(DST.length, 1))
        .digest());
}
/**
 * Hashes arbitrary-length byte strings to a list of one or more elements of a finite field F.
 * [RFC 9380 5.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.2).
 * @param msg a byte string containing the message to hash
 * @param count the number of elements of F to output
 * @param options `{DST: string, p: bigint, m: number, k: number, expand: 'xmd' | 'xof', hash: H}`, see above
 * @returns [u_0, ..., u_(count - 1)], a list of field elements.
 */
function hash_to_field(msg, count, options) {
    (0, utils_js_1.validateObject)(options, {
        DST: 'stringOrUint8Array',
        p: 'bigint',
        m: 'isSafeInteger',
        k: 'isSafeInteger',
        hash: 'hash',
    });
    const { p, k, m, hash, expand, DST: _DST } = options;
    (0, utils_js_1.abytes)(msg);
    anum(count);
    const DST = typeof _DST === 'string' ? (0, utils_js_1.utf8ToBytes)(_DST) : _DST;
    const log2p = p.toString(2).length;
    const L = Math.ceil((log2p + k) / 8); // section 5.1 of ietf draft link above
    const len_in_bytes = count * m * L;
    let prb; // pseudo_random_bytes
    if (expand === 'xmd') {
        prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
    }
    else if (expand === 'xof') {
        prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
    }
    else if (expand === '_internal_pass') {
        // for internal tests only
        prb = msg;
    }
    else {
        throw new Error('expand must be "xmd" or "xof"');
    }
    const u = new Array(count);
    for (let i = 0; i < count; i++) {
        const e = new Array(m);
        for (let j = 0; j < m; j++) {
            const elm_offset = L * (j + i * m);
            const tv = prb.subarray(elm_offset, elm_offset + L);
            e[j] = (0, modular_js_1.mod)(os2ip(tv), p);
        }
        u[i] = e;
    }
    return u;
}
function isogenyMap(field, map) {
    // Make same order as in spec
    const COEFF = map.map((i) => Array.from(i).reverse());
    return (x, y) => {
        const [xNum, xDen, yNum, yDen] = COEFF.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
        x = field.div(xNum, xDen); // xNum / xDen
        y = field.mul(y, field.div(yNum, yDen)); // y * (yNum / yDev)
        return { x: x, y: y };
    };
}
/** Creates hash-to-curve methods from EC Point and mapToCurve function. */
function createHasher(Point, mapToCurve, def) {
    if (typeof mapToCurve !== 'function')
        throw new Error('mapToCurve() must be defined');
    return {
        // Encodes byte string to elliptic curve.
        // hash_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
        hashToCurve(msg, options) {
            const u = hash_to_field(msg, 2, { ...def, DST: def.DST, ...options });
            const u0 = Point.fromAffine(mapToCurve(u[0]));
            const u1 = Point.fromAffine(mapToCurve(u[1]));
            const P = u0.add(u1).clearCofactor();
            P.assertValidity();
            return P;
        },
        // Encodes byte string to elliptic curve.
        // encode_to_curve from https://www.rfc-editor.org/rfc/rfc9380#section-3
        encodeToCurve(msg, options) {
            const u = hash_to_field(msg, 1, { ...def, DST: def.encodeDST, ...options });
            const P = Point.fromAffine(mapToCurve(u[0])).clearCofactor();
            P.assertValidity();
            return P;
        },
        // Same as encodeToCurve, but without hash
        mapToCurve(scalars) {
            if (!Array.isArray(scalars))
                throw new Error('mapToCurve: expected array of bigints');
            for (const i of scalars)
                if (typeof i !== 'bigint')
                    throw new Error('mapToCurve: expected array of bigints');
            const P = Point.fromAffine(mapToCurve(scalars)).clearCofactor();
            P.assertValidity();
            return P;
        },
    };
}
//# sourceMappingURL=hash-to-curve.js.map

/***/ }),

/***/ 5705:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isNegativeLE = void 0;
exports.mod = mod;
exports.pow = pow;
exports.pow2 = pow2;
exports.invert = invert;
exports.tonelliShanks = tonelliShanks;
exports.FpSqrt = FpSqrt;
exports.validateField = validateField;
exports.FpPow = FpPow;
exports.FpInvertBatch = FpInvertBatch;
exports.FpDiv = FpDiv;
exports.FpLegendre = FpLegendre;
exports.FpIsSquare = FpIsSquare;
exports.nLength = nLength;
exports.Field = Field;
exports.FpSqrtOdd = FpSqrtOdd;
exports.FpSqrtEven = FpSqrtEven;
exports.hashToPrivateScalar = hashToPrivateScalar;
exports.getFieldBytesLength = getFieldBytesLength;
exports.getMinHashLength = getMinHashLength;
exports.mapHashToField = mapHashToField;
/**
 * Utils for modular division and finite fields.
 * A finite field over 11 is integer number operations `mod 11`.
 * There is no division: it is replaced by modular multiplicative inverse.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const utils_js_1 = __nccwpck_require__(7442);
// prettier-ignore
const _0n = BigInt(0), _1n = BigInt(1), _2n = /* @__PURE__ */ BigInt(2), _3n = /* @__PURE__ */ BigInt(3);
// prettier-ignore
const _4n = /* @__PURE__ */ BigInt(4), _5n = /* @__PURE__ */ BigInt(5), _8n = /* @__PURE__ */ BigInt(8);
// prettier-ignore
const _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
// Calculates a modulo b
function mod(a, b) {
    const result = a % b;
    return result >= _0n ? result : b + result;
}
/**
 * Efficiently raise num to power and do modular division.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 * @todo use field version && remove
 * @example
 * pow(2n, 6n, 11n) // 64n % 11n == 9n
 */
function pow(num, power, modulo) {
    if (power < _0n)
        throw new Error('invalid exponent, negatives unsupported');
    if (modulo <= _0n)
        throw new Error('invalid modulus');
    if (modulo === _1n)
        return _0n;
    let res = _1n;
    while (power > _0n) {
        if (power & _1n)
            res = (res * num) % modulo;
        num = (num * num) % modulo;
        power >>= _1n;
    }
    return res;
}
/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n) {
        res *= res;
        res %= modulo;
    }
    return res;
}
/**
 * Inverses number over modulo.
 * Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
 */
function invert(number, modulo) {
    if (number === _0n)
        throw new Error('invert: expected non-zero number');
    if (modulo <= _0n)
        throw new Error('invert: expected positive modulus, got ' + modulo);
    // Fermat's little theorem "CT-like" version inv(n) = n^(m-2) mod m is 30x slower.
    let a = mod(number, modulo);
    let b = modulo;
    // prettier-ignore
    let x = _0n, y = _1n, u = _1n, v = _0n;
    while (a !== _0n) {
        // JIT applies optimization if those two lines follow each other
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        // prettier-ignore
        b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n)
        throw new Error('invert: does not exist');
    return mod(x, modulo);
}
/**
 * Tonelli-Shanks square root search algorithm.
 * 1. https://eprint.iacr.org/2012/685.pdf (page 12)
 * 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
 * Will start an infinite loop if field order P is not prime.
 * @param P field order
 * @returns function that takes field Fp (created from P) and number n
 */
function tonelliShanks(P) {
    // Legendre constant: used to calculate Legendre symbol (a | p),
    // which denotes the value of a^((p-1)/2) (mod p).
    // (a | p) ≡ 1    if a is a square (mod p)
    // (a | p) ≡ -1   if a is not a square (mod p)
    // (a | p) ≡ 0    if a ≡ 0 (mod p)
    const legendreC = (P - _1n) / _2n;
    let Q, S, Z;
    // Step 1: By factoring out powers of 2 from p - 1,
    // find q and s such that p - 1 = q*(2^s) with q odd
    for (Q = P - _1n, S = 0; Q % _2n === _0n; Q /= _2n, S++)
        ;
    // Step 2: Select a non-square z such that (z | p) ≡ -1 and set c ≡ zq
    for (Z = _2n; Z < P && pow(Z, legendreC, P) !== P - _1n; Z++) {
        // Crash instead of infinity loop, we cannot reasonable count until P.
        if (Z > 1000)
            throw new Error('Cannot find square root: likely non-prime P');
    }
    // Fast-path
    if (S === 1) {
        const p1div4 = (P + _1n) / _4n;
        return function tonelliFast(Fp, n) {
            const root = Fp.pow(n, p1div4);
            if (!Fp.eql(Fp.sqr(root), n))
                throw new Error('Cannot find square root');
            return root;
        };
    }
    // Slow-path
    const Q1div2 = (Q + _1n) / _2n;
    return function tonelliSlow(Fp, n) {
        // Step 0: Check that n is indeed a square: (n | p) should not be ≡ -1
        if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE))
            throw new Error('Cannot find square root');
        let r = S;
        // TODO: will fail at Fp2/etc
        let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q); // will update both x and b
        let x = Fp.pow(n, Q1div2); // first guess at the square root
        let b = Fp.pow(n, Q); // first guess at the fudge factor
        while (!Fp.eql(b, Fp.ONE)) {
            if (Fp.eql(b, Fp.ZERO))
                return Fp.ZERO; // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm (4. If t = 0, return r = 0)
            // Find m such b^(2^m)==1
            let m = 1;
            for (let t2 = Fp.sqr(b); m < r; m++) {
                if (Fp.eql(t2, Fp.ONE))
                    break;
                t2 = Fp.sqr(t2); // t2 *= t2
            }
            // NOTE: r-m-1 can be bigger than 32, need to convert to bigint before shift, otherwise there will be overflow
            const ge = Fp.pow(g, _1n << BigInt(r - m - 1)); // ge = 2^(r-m-1)
            g = Fp.sqr(ge); // g = ge * ge
            x = Fp.mul(x, ge); // x *= ge
            b = Fp.mul(b, g); // b *= g
            r = m;
        }
        return x;
    };
}
/**
 * Square root for a finite field. It will try to check if optimizations are applicable and fall back to 4:
 *
 * 1. P ≡ 3 (mod 4)
 * 2. P ≡ 5 (mod 8)
 * 3. P ≡ 9 (mod 16)
 * 4. Tonelli-Shanks algorithm
 *
 * Different algorithms can give different roots, it is up to user to decide which one they want.
 * For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
 */
function FpSqrt(P) {
    // P ≡ 3 (mod 4)
    // √n = n^((P+1)/4)
    if (P % _4n === _3n) {
        // Not all roots possible!
        // const ORDER =
        //   0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn;
        // const NUM = 72057594037927816n;
        const p1div4 = (P + _1n) / _4n;
        return function sqrt3mod4(Fp, n) {
            const root = Fp.pow(n, p1div4);
            // Throw if root**2 != n
            if (!Fp.eql(Fp.sqr(root), n))
                throw new Error('Cannot find square root');
            return root;
        };
    }
    // Atkin algorithm for q ≡ 5 (mod 8), https://eprint.iacr.org/2012/685.pdf (page 10)
    if (P % _8n === _5n) {
        const c1 = (P - _5n) / _8n;
        return function sqrt5mod8(Fp, n) {
            const n2 = Fp.mul(n, _2n);
            const v = Fp.pow(n2, c1);
            const nv = Fp.mul(n, v);
            const i = Fp.mul(Fp.mul(nv, _2n), v);
            const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
            if (!Fp.eql(Fp.sqr(root), n))
                throw new Error('Cannot find square root');
            return root;
        };
    }
    // P ≡ 9 (mod 16)
    if (P % _16n === _9n) {
        // NOTE: tonelli is too slow for bls-Fp2 calculations even on start
        // Means we cannot use sqrt for constants at all!
        //
        // const c1 = Fp.sqrt(Fp.negate(Fp.ONE)); //  1. c1 = sqrt(-1) in F, i.e., (c1^2) == -1 in F
        // const c2 = Fp.sqrt(c1);                //  2. c2 = sqrt(c1) in F, i.e., (c2^2) == c1 in F
        // const c3 = Fp.sqrt(Fp.negate(c1));     //  3. c3 = sqrt(-c1) in F, i.e., (c3^2) == -c1 in F
        // const c4 = (P + _7n) / _16n;           //  4. c4 = (q + 7) / 16        # Integer arithmetic
        // sqrt = (x) => {
        //   let tv1 = Fp.pow(x, c4);             //  1. tv1 = x^c4
        //   let tv2 = Fp.mul(c1, tv1);           //  2. tv2 = c1 * tv1
        //   const tv3 = Fp.mul(c2, tv1);         //  3. tv3 = c2 * tv1
        //   let tv4 = Fp.mul(c3, tv1);           //  4. tv4 = c3 * tv1
        //   const e1 = Fp.equals(Fp.square(tv2), x); //  5.  e1 = (tv2^2) == x
        //   const e2 = Fp.equals(Fp.square(tv3), x); //  6.  e2 = (tv3^2) == x
        //   tv1 = Fp.cmov(tv1, tv2, e1); //  7. tv1 = CMOV(tv1, tv2, e1)  # Select tv2 if (tv2^2) == x
        //   tv2 = Fp.cmov(tv4, tv3, e2); //  8. tv2 = CMOV(tv4, tv3, e2)  # Select tv3 if (tv3^2) == x
        //   const e3 = Fp.equals(Fp.square(tv2), x); //  9.  e3 = (tv2^2) == x
        //   return Fp.cmov(tv1, tv2, e3); //  10.  z = CMOV(tv1, tv2, e3)  # Select the sqrt from tv1 and tv2
        // }
    }
    // Other cases: Tonelli-Shanks algorithm
    return tonelliShanks(P);
}
// Little-endian check for first LE bit (last BE bit);
const isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;
exports.isNegativeLE = isNegativeLE;
// prettier-ignore
const FIELD_FIELDS = [
    'create', 'isValid', 'is0', 'neg', 'inv', 'sqrt', 'sqr',
    'eql', 'add', 'sub', 'mul', 'pow', 'div',
    'addN', 'subN', 'mulN', 'sqrN'
];
function validateField(field) {
    const initial = {
        ORDER: 'bigint',
        MASK: 'bigint',
        BYTES: 'isSafeInteger',
        BITS: 'isSafeInteger',
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
        map[val] = 'function';
        return map;
    }, initial);
    return (0, utils_js_1.validateObject)(field, opts);
}
// Generic field functions
/**
 * Same as `pow` but for Fp: non-constant-time.
 * Unsafe in some contexts: uses ladder, so can expose bigint bits.
 */
function FpPow(f, num, power) {
    // Should have same speed as pow for bigints
    // TODO: benchmark!
    if (power < _0n)
        throw new Error('invalid exponent, negatives unsupported');
    if (power === _0n)
        return f.ONE;
    if (power === _1n)
        return num;
    let p = f.ONE;
    let d = num;
    while (power > _0n) {
        if (power & _1n)
            p = f.mul(p, d);
        d = f.sqr(d);
        power >>= _1n;
    }
    return p;
}
/**
 * Efficiently invert an array of Field elements.
 * `inv(0)` will return `undefined` here: make sure to throw an error.
 */
function FpInvertBatch(f, nums) {
    const tmp = new Array(nums.length);
    // Walk from first to last, multiply them by each other MOD p
    const lastMultiplied = nums.reduce((acc, num, i) => {
        if (f.is0(num))
            return acc;
        tmp[i] = acc;
        return f.mul(acc, num);
    }, f.ONE);
    // Invert last element
    const inverted = f.inv(lastMultiplied);
    // Walk from last to first, multiply them by inverted each other MOD p
    nums.reduceRight((acc, num, i) => {
        if (f.is0(num))
            return acc;
        tmp[i] = f.mul(acc, tmp[i]);
        return f.mul(acc, num);
    }, inverted);
    return tmp;
}
function FpDiv(f, lhs, rhs) {
    return f.mul(lhs, typeof rhs === 'bigint' ? invert(rhs, f.ORDER) : f.inv(rhs));
}
/**
 * Legendre symbol.
 * * (a | p) ≡ 1    if a is a square (mod p), quadratic residue
 * * (a | p) ≡ -1   if a is not a square (mod p), quadratic non residue
 * * (a | p) ≡ 0    if a ≡ 0 (mod p)
 */
function FpLegendre(order) {
    const legendreConst = (order - _1n) / _2n; // Integer arithmetic
    return (f, x) => f.pow(x, legendreConst);
}
// This function returns True whenever the value x is a square in the field F.
function FpIsSquare(f) {
    const legendre = FpLegendre(f.ORDER);
    return (x) => {
        const p = legendre(f, x);
        return f.eql(p, f.ZERO) || f.eql(p, f.ONE);
    };
}
// CURVE.n lengths
function nLength(n, nBitLength) {
    // Bit size, byte size of CURVE.n
    const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
}
/**
 * Initializes a finite field over prime.
 * Major performance optimizations:
 * * a) denormalized operations like mulN instead of mul
 * * b) same object shape: never add or remove keys
 * * c) Object.freeze
 * Fragile: always run a benchmark on a change.
 * Security note: operations don't check 'isValid' for all elements for performance reasons,
 * it is caller responsibility to check this.
 * This is low-level code, please make sure you know what you're doing.
 * @param ORDER prime positive bigint
 * @param bitLen how many bits the field consumes
 * @param isLE (def: false) if encoding / decoding should be in little-endian
 * @param redef optional faster redefinitions of sqrt and other methods
 */
function Field(ORDER, bitLen, isLE = false, redef = {}) {
    if (ORDER <= _0n)
        throw new Error('invalid field: expected ORDER > 0, got ' + ORDER);
    const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen);
    if (BYTES > 2048)
        throw new Error('invalid field: expected ORDER of <= 2048 bytes');
    let sqrtP; // cached sqrtP
    const f = Object.freeze({
        ORDER,
        isLE,
        BITS,
        BYTES,
        MASK: (0, utils_js_1.bitMask)(BITS),
        ZERO: _0n,
        ONE: _1n,
        create: (num) => mod(num, ORDER),
        isValid: (num) => {
            if (typeof num !== 'bigint')
                throw new Error('invalid field element: expected bigint, got ' + typeof num);
            return _0n <= num && num < ORDER; // 0 is valid element, but it's not invertible
        },
        is0: (num) => num === _0n,
        isOdd: (num) => (num & _1n) === _1n,
        neg: (num) => mod(-num, ORDER),
        eql: (lhs, rhs) => lhs === rhs,
        sqr: (num) => mod(num * num, ORDER),
        add: (lhs, rhs) => mod(lhs + rhs, ORDER),
        sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
        mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
        pow: (num, power) => FpPow(f, num, power),
        div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
        // Same as above, but doesn't normalize
        sqrN: (num) => num * num,
        addN: (lhs, rhs) => lhs + rhs,
        subN: (lhs, rhs) => lhs - rhs,
        mulN: (lhs, rhs) => lhs * rhs,
        inv: (num) => invert(num, ORDER),
        sqrt: redef.sqrt ||
            ((n) => {
                if (!sqrtP)
                    sqrtP = FpSqrt(ORDER);
                return sqrtP(f, n);
            }),
        invertBatch: (lst) => FpInvertBatch(f, lst),
        // TODO: do we really need constant cmov?
        // We don't have const-time bigints anyway, so probably will be not very useful
        cmov: (a, b, c) => (c ? b : a),
        toBytes: (num) => (isLE ? (0, utils_js_1.numberToBytesLE)(num, BYTES) : (0, utils_js_1.numberToBytesBE)(num, BYTES)),
        fromBytes: (bytes) => {
            if (bytes.length !== BYTES)
                throw new Error('Field.fromBytes: expected ' + BYTES + ' bytes, got ' + bytes.length);
            return isLE ? (0, utils_js_1.bytesToNumberLE)(bytes) : (0, utils_js_1.bytesToNumberBE)(bytes);
        },
    });
    return Object.freeze(f);
}
function FpSqrtOdd(Fp, elm) {
    if (!Fp.isOdd)
        throw new Error("Field doesn't have isOdd");
    const root = Fp.sqrt(elm);
    return Fp.isOdd(root) ? root : Fp.neg(root);
}
function FpSqrtEven(Fp, elm) {
    if (!Fp.isOdd)
        throw new Error("Field doesn't have isOdd");
    const root = Fp.sqrt(elm);
    return Fp.isOdd(root) ? Fp.neg(root) : root;
}
/**
 * "Constant-time" private key generation utility.
 * Same as mapKeyToField, but accepts less bytes (40 instead of 48 for 32-byte field).
 * Which makes it slightly more biased, less secure.
 * @deprecated use `mapKeyToField` instead
 */
function hashToPrivateScalar(hash, groupOrder, isLE = false) {
    hash = (0, utils_js_1.ensureBytes)('privateHash', hash);
    const hashLen = hash.length;
    const minLen = nLength(groupOrder).nByteLength + 8;
    if (minLen < 24 || hashLen < minLen || hashLen > 1024)
        throw new Error('hashToPrivateScalar: expected ' + minLen + '-1024 bytes of input, got ' + hashLen);
    const num = isLE ? (0, utils_js_1.bytesToNumberLE)(hash) : (0, utils_js_1.bytesToNumberBE)(hash);
    return mod(num, groupOrder - _1n) + _1n;
}
/**
 * Returns total number of bytes consumed by the field element.
 * For example, 32 bytes for usual 256-bit weierstrass curve.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of field
 */
function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== 'bigint')
        throw new Error('field order must be bigint');
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
}
/**
 * Returns minimal amount of bytes that can be safely reduced
 * by field order.
 * Should be 2^-128 for 128-bit curve such as P256.
 * @param fieldOrder number of field elements, usually CURVE.n
 * @returns byte length of target hash
 */
function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
}
/**
 * "Constant-time" private key generation utility.
 * Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
 * and convert them into private scalar, with the modulo bias being negligible.
 * Needs at least 48 bytes of input for 32-byte private key.
 * https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
 * FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
 * RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
 * @param hash hash output from SHA3 or a similar function
 * @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
 * @param isLE interpret hash bytes as LE num
 * @returns valid private scalar
 */
function mapHashToField(key, fieldOrder, isLE = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    // No small numbers: need to understand bias story. No huge numbers: easier to detect JS timings.
    if (len < 16 || len < minLen || len > 1024)
        throw new Error('expected ' + minLen + '-1024 bytes of input, got ' + len);
    const num = isLE ? (0, utils_js_1.bytesToNumberLE)(key) : (0, utils_js_1.bytesToNumberBE)(key);
    // `mod(x, 11)` can sometimes produce 0. `mod(x, 10) + 1` is the same, but no 0
    const reduced = mod(num, fieldOrder - _1n) + _1n;
    return isLE ? (0, utils_js_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_js_1.numberToBytesBE)(reduced, fieldLen);
}
//# sourceMappingURL=modular.js.map

/***/ }),

/***/ 2096:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.montgomery = montgomery;
/**
 * Montgomery curve methods. It's not really whole montgomery curve,
 * just bunch of very specific methods for X25519 / X448 from
 * [RFC 7748](https://www.rfc-editor.org/rfc/rfc7748)
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const modular_js_1 = __nccwpck_require__(5705);
const utils_js_1 = __nccwpck_require__(7442);
const _0n = BigInt(0);
const _1n = BigInt(1);
function validateOpts(curve) {
    (0, utils_js_1.validateObject)(curve, {
        a: 'bigint',
    }, {
        montgomeryBits: 'isSafeInteger',
        nByteLength: 'isSafeInteger',
        adjustScalarBytes: 'function',
        domain: 'function',
        powPminus2: 'function',
        Gu: 'bigint',
    });
    // Set defaults
    return Object.freeze({ ...curve });
}
// Uses only one coordinate instead of two
function montgomery(curveDef) {
    const CURVE = validateOpts(curveDef);
    const { P } = CURVE;
    const modP = (n) => (0, modular_js_1.mod)(n, P);
    const montgomeryBits = CURVE.montgomeryBits;
    const montgomeryBytes = Math.ceil(montgomeryBits / 8);
    const fieldLen = CURVE.nByteLength;
    const adjustScalarBytes = CURVE.adjustScalarBytes || ((bytes) => bytes);
    const powPminus2 = CURVE.powPminus2 || ((x) => (0, modular_js_1.pow)(x, P - BigInt(2), P));
    // cswap from RFC7748. But it is not from RFC7748!
    /*
      cswap(swap, x_2, x_3):
           dummy = mask(swap) AND (x_2 XOR x_3)
           x_2 = x_2 XOR dummy
           x_3 = x_3 XOR dummy
           Return (x_2, x_3)
    Where mask(swap) is the all-1 or all-0 word of the same length as x_2
     and x_3, computed, e.g., as mask(swap) = 0 - swap.
    */
    function cswap(swap, x_2, x_3) {
        const dummy = modP(swap * (x_2 - x_3));
        x_2 = modP(x_2 - dummy);
        x_3 = modP(x_3 + dummy);
        return [x_2, x_3];
    }
    // x25519 from 4
    // The constant a24 is (486662 - 2) / 4 = 121665 for curve25519/X25519
    const a24 = (CURVE.a - BigInt(2)) / BigInt(4);
    /**
     *
     * @param pointU u coordinate (x) on Montgomery Curve 25519
     * @param scalar by which the point would be multiplied
     * @returns new Point on Montgomery curve
     */
    function montgomeryLadder(u, scalar) {
        (0, utils_js_1.aInRange)('u', u, _0n, P);
        (0, utils_js_1.aInRange)('scalar', scalar, _0n, P);
        // Section 5: Implementations MUST accept non-canonical values and process them as
        // if they had been reduced modulo the field prime.
        const k = scalar;
        const x_1 = u;
        let x_2 = _1n;
        let z_2 = _0n;
        let x_3 = u;
        let z_3 = _1n;
        let swap = _0n;
        let sw;
        for (let t = BigInt(montgomeryBits - 1); t >= _0n; t--) {
            const k_t = (k >> t) & _1n;
            swap ^= k_t;
            sw = cswap(swap, x_2, x_3);
            x_2 = sw[0];
            x_3 = sw[1];
            sw = cswap(swap, z_2, z_3);
            z_2 = sw[0];
            z_3 = sw[1];
            swap = k_t;
            const A = x_2 + z_2;
            const AA = modP(A * A);
            const B = x_2 - z_2;
            const BB = modP(B * B);
            const E = AA - BB;
            const C = x_3 + z_3;
            const D = x_3 - z_3;
            const DA = modP(D * A);
            const CB = modP(C * B);
            const dacb = DA + CB;
            const da_cb = DA - CB;
            x_3 = modP(dacb * dacb);
            z_3 = modP(x_1 * modP(da_cb * da_cb));
            x_2 = modP(AA * BB);
            z_2 = modP(E * (AA + modP(a24 * E)));
        }
        // (x_2, x_3) = cswap(swap, x_2, x_3)
        sw = cswap(swap, x_2, x_3);
        x_2 = sw[0];
        x_3 = sw[1];
        // (z_2, z_3) = cswap(swap, z_2, z_3)
        sw = cswap(swap, z_2, z_3);
        z_2 = sw[0];
        z_3 = sw[1];
        // z_2^(p - 2)
        const z2 = powPminus2(z_2);
        // Return x_2 * (z_2^(p - 2))
        return modP(x_2 * z2);
    }
    function encodeUCoordinate(u) {
        return (0, utils_js_1.numberToBytesLE)(modP(u), montgomeryBytes);
    }
    function decodeUCoordinate(uEnc) {
        // Section 5: When receiving such an array, implementations of X25519
        // MUST mask the most significant bit in the final byte.
        const u = (0, utils_js_1.ensureBytes)('u coordinate', uEnc, montgomeryBytes);
        if (fieldLen === 32)
            u[31] &= 127; // 0b0111_1111
        return (0, utils_js_1.bytesToNumberLE)(u);
    }
    function decodeScalar(n) {
        const bytes = (0, utils_js_1.ensureBytes)('scalar', n);
        const len = bytes.length;
        if (len !== montgomeryBytes && len !== fieldLen) {
            let valid = '' + montgomeryBytes + ' or ' + fieldLen;
            throw new Error('invalid scalar, expected ' + valid + ' bytes, got ' + len);
        }
        return (0, utils_js_1.bytesToNumberLE)(adjustScalarBytes(bytes));
    }
    function scalarMult(scalar, u) {
        const pointU = decodeUCoordinate(u);
        const _scalar = decodeScalar(scalar);
        const pu = montgomeryLadder(pointU, _scalar);
        // The result was not contributory
        // https://cr.yp.to/ecdh.html#validate
        if (pu === _0n)
            throw new Error('invalid private or public key received');
        return encodeUCoordinate(pu);
    }
    // Computes public key from private. By doing scalar multiplication of base point.
    const GuBytes = encodeUCoordinate(CURVE.Gu);
    function scalarMultBase(scalar) {
        return scalarMult(scalar, GuBytes);
    }
    return {
        scalarMult,
        scalarMultBase,
        getSharedSecret: (privateKey, publicKey) => scalarMult(privateKey, publicKey),
        getPublicKey: (privateKey) => scalarMultBase(privateKey),
        utils: { randomPrivateKey: () => CURVE.randomBytes(CURVE.nByteLength) },
        GuBytes: GuBytes,
    };
}
//# sourceMappingURL=montgomery.js.map

/***/ }),

/***/ 7442:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Hex, bytes and number utilities.
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.notImplemented = exports.bitMask = void 0;
exports.isBytes = isBytes;
exports.abytes = abytes;
exports.abool = abool;
exports.bytesToHex = bytesToHex;
exports.numberToHexUnpadded = numberToHexUnpadded;
exports.hexToNumber = hexToNumber;
exports.hexToBytes = hexToBytes;
exports.bytesToNumberBE = bytesToNumberBE;
exports.bytesToNumberLE = bytesToNumberLE;
exports.numberToBytesBE = numberToBytesBE;
exports.numberToBytesLE = numberToBytesLE;
exports.numberToVarBytesBE = numberToVarBytesBE;
exports.ensureBytes = ensureBytes;
exports.concatBytes = concatBytes;
exports.equalBytes = equalBytes;
exports.utf8ToBytes = utf8ToBytes;
exports.inRange = inRange;
exports.aInRange = aInRange;
exports.bitLen = bitLen;
exports.bitGet = bitGet;
exports.bitSet = bitSet;
exports.createHmacDrbg = createHmacDrbg;
exports.validateObject = validateObject;
exports.memoized = memoized;
// 100 lines of code in the file are duplicated from noble-hashes (utils).
// This is OK: `abstract` directory does not use noble-hashes.
// User may opt-in into using different hashing library. This way, noble-hashes
// won't be included into their bundle.
const _0n = /* @__PURE__ */ BigInt(0);
const _1n = /* @__PURE__ */ BigInt(1);
const _2n = /* @__PURE__ */ BigInt(2);
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
function abytes(item) {
    if (!isBytes(item))
        throw new Error('Uint8Array expected');
}
function abool(title, value) {
    if (typeof value !== 'boolean')
        throw new Error(title + ' boolean expected, got ' + value);
}
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    abytes(bytes);
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? '0' + hex : hex;
}
function hexToNumber(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    return hex === '' ? _0n : BigInt('0x' + hex); // Big Endian
}
// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
        return ch - asciis._0; // '2' => 50-48
    if (ch >= asciis.A && ch <= asciis.F)
        return ch - (asciis.A - 10); // 'B' => 66-(65-10)
    if (ch >= asciis.a && ch <= asciis.f)
        return ch - (asciis.a - 10); // 'b' => 98-(97-10)
    return;
}
/**
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
        throw new Error('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
    }
    return array;
}
// BE: Big Endian, LE: Little Endian
function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
    abytes(bytes);
    return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, '0'));
}
function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
}
// Unpadded, rarely used
function numberToVarBytesBE(n) {
    return hexToBytes(numberToHexUnpadded(n));
}
/**
 * Takes hex string or Uint8Array, converts to Uint8Array.
 * Validates output length.
 * Will throw error for other types.
 * @param title descriptive title for an error e.g. 'private key'
 * @param hex hex string or Uint8Array
 * @param expectedLength optional, will compare to result array's length
 * @returns
 */
function ensureBytes(title, hex, expectedLength) {
    let res;
    if (typeof hex === 'string') {
        try {
            res = hexToBytes(hex);
        }
        catch (e) {
            throw new Error(title + ' must be hex string or Uint8Array, cause: ' + e);
        }
    }
    else if (isBytes(hex)) {
        // Uint8Array.from() instead of hash.slice() because node.js Buffer
        // is instance of Uint8Array, and its slice() creates **mutable** copy
        res = Uint8Array.from(hex);
    }
    else {
        throw new Error(title + ' must be hex string or Uint8Array');
    }
    const len = res.length;
    if (typeof expectedLength === 'number' && len !== expectedLength)
        throw new Error(title + ' of length ' + expectedLength + ' expected, got ' + len);
    return res;
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        abytes(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
// Compares 2 u8a-s in kinda constant time
function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
    return diff === 0;
}
/**
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error('string expected');
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
// Is positive bigint
const isPosBig = (n) => typeof n === 'bigint' && _0n <= n;
function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
/**
 * Asserts min <= n < max. NOTE: It's < max and not <= max.
 * @example
 * aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
 */
function aInRange(title, n, min, max) {
    // Why min <= n < max and not a (min < n < max) OR b (min <= n <= max)?
    // consider P=256n, min=0n, max=P
    // - a for min=0 would require -1:          `inRange('x', x, -1n, P)`
    // - b would commonly require subtraction:  `inRange('x', x, 0n, P - 1n)`
    // - our way is the cleanest:               `inRange('x', x, 0n, P)
    if (!inRange(n, min, max))
        throw new Error('expected valid ' + title + ': ' + min + ' <= n < ' + max + ', got ' + n);
}
// Bit operations
/**
 * Calculates amount of bits in a bigint.
 * Same as `n.toString(2).length`
 */
function bitLen(n) {
    let len;
    for (len = 0; n > _0n; n >>= _1n, len += 1)
        ;
    return len;
}
/**
 * Gets single bit at position.
 * NOTE: first bit position is 0 (same as arrays)
 * Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
 */
function bitGet(n, pos) {
    return (n >> BigInt(pos)) & _1n;
}
/**
 * Sets single bit at position.
 */
function bitSet(n, pos, value) {
    return n | ((value ? _1n : _0n) << BigInt(pos));
}
/**
 * Calculate mask for N bits. Not using ** operator with bigints because of old engines.
 * Same as BigInt(`0b${Array(i).fill('1').join('')}`)
 */
const bitMask = (n) => (_2n << BigInt(n - 1)) - _1n;
exports.bitMask = bitMask;
// DRBG
const u8n = (data) => new Uint8Array(data); // creates Uint8Array
const u8fr = (arr) => Uint8Array.from(arr); // another shortcut
/**
 * Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
 * @returns function that will call DRBG until 2nd arg returns something meaningful
 * @example
 *   const drbg = createHmacDRBG<Key>(32, 32, hmac);
 *   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
 */
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== 'number' || hashLen < 2)
        throw new Error('hashLen must be a number');
    if (typeof qByteLen !== 'number' || qByteLen < 2)
        throw new Error('qByteLen must be a number');
    if (typeof hmacFn !== 'function')
        throw new Error('hmacFn must be a function');
    // Step B, Step C: set hashLen to 8*ceil(hlen/8)
    let v = u8n(hashLen); // Minimal non-full-spec HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
    let k = u8n(hashLen); // Steps B and C of RFC6979 3.2: set hashLen, in our case always same
    let i = 0; // Iterations counter, will throw when over 1000
    const reset = () => {
        v.fill(1);
        k.fill(0);
        i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b); // hmac(k)(v, ...values)
    const reseed = (seed = u8n()) => {
        // HMAC-DRBG reseed() function. Steps D-G
        k = h(u8fr([0x00]), seed); // k = hmac(k || v || 0x00 || seed)
        v = h(); // v = hmac(k || v)
        if (seed.length === 0)
            return;
        k = h(u8fr([0x01]), seed); // k = hmac(k || v || 0x01 || seed)
        v = h(); // v = hmac(k || v)
    };
    const gen = () => {
        // HMAC-DRBG generate() function
        if (i++ >= 1000)
            throw new Error('drbg: tried 1000 values');
        let len = 0;
        const out = [];
        while (len < qByteLen) {
            v = h();
            const sl = v.slice();
            out.push(sl);
            len += v.length;
        }
        return concatBytes(...out);
    };
    const genUntil = (seed, pred) => {
        reset();
        reseed(seed); // Steps D-G
        let res = undefined; // Step H: grind until k is in [1..n-1]
        while (!(res = pred(gen())))
            reseed();
        reset();
        return res;
    };
    return genUntil;
}
// Validating curves and fields
const validatorFns = {
    bigint: (val) => typeof val === 'bigint',
    function: (val) => typeof val === 'function',
    boolean: (val) => typeof val === 'boolean',
    string: (val) => typeof val === 'string',
    stringOrUint8Array: (val) => typeof val === 'string' || isBytes(val),
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === 'function' && Number.isSafeInteger(val.outputLen),
};
// type Record<K extends string | number | symbol, T> = { [P in K]: T; }
function validateObject(object, validators, optValidators = {}) {
    const checkField = (fieldName, type, isOptional) => {
        const checkVal = validatorFns[type];
        if (typeof checkVal !== 'function')
            throw new Error('invalid validator function');
        const val = object[fieldName];
        if (isOptional && val === undefined)
            return;
        if (!checkVal(val, object)) {
            throw new Error('param ' + String(fieldName) + ' is invalid. Expected ' + type + ', got ' + val);
        }
    };
    for (const [fieldName, type] of Object.entries(validators))
        checkField(fieldName, type, false);
    for (const [fieldName, type] of Object.entries(optValidators))
        checkField(fieldName, type, true);
    return object;
}
// validate type tests
// const o: { a: number; b: number; c: number } = { a: 1, b: 5, c: 6 };
// const z0 = validateObject(o, { a: 'isSafeInteger' }, { c: 'bigint' }); // Ok!
// // Should fail type-check
// const z1 = validateObject(o, { a: 'tmp' }, { c: 'zz' });
// const z2 = validateObject(o, { a: 'isSafeInteger' }, { c: 'zz' });
// const z3 = validateObject(o, { test: 'boolean', z: 'bug' });
// const z4 = validateObject(o, { a: 'boolean', z: 'bug' });
/**
 * throws not implemented error
 */
const notImplemented = () => {
    throw new Error('not implemented');
};
exports.notImplemented = notImplemented;
/**
 * Memoizes (caches) computation result.
 * Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
 */
function memoized(fn) {
    const map = new WeakMap();
    return (arg, ...args) => {
        const val = map.get(arg);
        if (val !== undefined)
            return val;
        const computed = fn(arg, ...args);
        map.set(arg, computed);
        return computed;
    };
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 7859:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DER = exports.DERErr = void 0;
exports.weierstrassPoints = weierstrassPoints;
exports.weierstrass = weierstrass;
exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
/**
 * Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
 *
 * ### Design rationale for types
 *
 * * Interaction between classes from different curves should fail:
 *   `k256.Point.BASE.add(p256.Point.BASE)`
 * * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
 * * Different calls of `curve()` would return different classes -
 *   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
 *   it won't affect others
 *
 * TypeScript can't infer types for classes created inside a function. Classes is one instance
 * of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
 * unique type for every function call.
 *
 * We can use generic types via some param, like curve opts, but that would:
 *     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
 *     which is hard to debug.
 *     2. Params can be generic and we can't enforce them to be constant value:
 *     if somebody creates curve from non-constant params,
 *     it would be allowed to interact with other curves with non-constant params
 *
 * @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const curve_js_1 = __nccwpck_require__(9460);
const modular_js_1 = __nccwpck_require__(5705);
const ut = __nccwpck_require__(7442);
const utils_js_1 = __nccwpck_require__(7442);
function validateSigVerOpts(opts) {
    if (opts.lowS !== undefined)
        (0, utils_js_1.abool)('lowS', opts.lowS);
    if (opts.prehash !== undefined)
        (0, utils_js_1.abool)('prehash', opts.prehash);
}
function validatePointOpts(curve) {
    const opts = (0, curve_js_1.validateBasic)(curve);
    ut.validateObject(opts, {
        a: 'field',
        b: 'field',
    }, {
        allowedPrivateKeyLengths: 'array',
        wrapPrivateKey: 'boolean',
        isTorsionFree: 'function',
        clearCofactor: 'function',
        allowInfinityPoint: 'boolean',
        fromBytes: 'function',
        toBytes: 'function',
    });
    const { endo, Fp, a } = opts;
    if (endo) {
        if (!Fp.eql(a, Fp.ZERO)) {
            throw new Error('invalid endomorphism, can only be defined for Koblitz curves that have a=0');
        }
        if (typeof endo !== 'object' ||
            typeof endo.beta !== 'bigint' ||
            typeof endo.splitScalar !== 'function') {
            throw new Error('invalid endomorphism, expected beta: bigint and splitScalar: function');
        }
    }
    return Object.freeze({ ...opts });
}
const { bytesToNumberBE: b2n, hexToBytes: h2b } = ut;
class DERErr extends Error {
    constructor(m = '') {
        super(m);
    }
}
exports.DERErr = DERErr;
/**
 * ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
 *
 *     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
 *
 * Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
 */
exports.DER = {
    // asn.1 DER encoding utils
    Err: DERErr,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
        encode: (tag, data) => {
            const { Err: E } = exports.DER;
            if (tag < 0 || tag > 256)
                throw new E('tlv.encode: wrong tag');
            if (data.length & 1)
                throw new E('tlv.encode: unpadded data');
            const dataLen = data.length / 2;
            const len = ut.numberToHexUnpadded(dataLen);
            if ((len.length / 2) & 128)
                throw new E('tlv.encode: long form length too big');
            // length of length with long form flag
            const lenLen = dataLen > 127 ? ut.numberToHexUnpadded((len.length / 2) | 128) : '';
            const t = ut.numberToHexUnpadded(tag);
            return t + lenLen + len + data;
        },
        // v - value, l - left bytes (unparsed)
        decode(tag, data) {
            const { Err: E } = exports.DER;
            let pos = 0;
            if (tag < 0 || tag > 256)
                throw new E('tlv.encode: wrong tag');
            if (data.length < 2 || data[pos++] !== tag)
                throw new E('tlv.decode: wrong tlv');
            const first = data[pos++];
            const isLong = !!(first & 128); // First bit of first length byte is flag for short/long form
            let length = 0;
            if (!isLong)
                length = first;
            else {
                // Long form: [longFlag(1bit), lengthLength(7bit), length (BE)]
                const lenLen = first & 127;
                if (!lenLen)
                    throw new E('tlv.decode(long): indefinite length not supported');
                if (lenLen > 4)
                    throw new E('tlv.decode(long): byte length is too big'); // this will overflow u32 in js
                const lengthBytes = data.subarray(pos, pos + lenLen);
                if (lengthBytes.length !== lenLen)
                    throw new E('tlv.decode: length bytes not complete');
                if (lengthBytes[0] === 0)
                    throw new E('tlv.decode(long): zero leftmost byte');
                for (const b of lengthBytes)
                    length = (length << 8) | b;
                pos += lenLen;
                if (length < 128)
                    throw new E('tlv.decode(long): not minimal encoding');
            }
            const v = data.subarray(pos, pos + length);
            if (v.length !== length)
                throw new E('tlv.decode: wrong value length');
            return { v, l: data.subarray(pos + length) };
        },
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
        encode(num) {
            const { Err: E } = exports.DER;
            if (num < _0n)
                throw new E('integer: negative integers are not allowed');
            let hex = ut.numberToHexUnpadded(num);
            // Pad with zero byte if negative flag is present
            if (Number.parseInt(hex[0], 16) & 0b1000)
                hex = '00' + hex;
            if (hex.length & 1)
                throw new E('unexpected DER parsing assertion: unpadded hex');
            return hex;
        },
        decode(data) {
            const { Err: E } = exports.DER;
            if (data[0] & 128)
                throw new E('invalid signature integer: negative');
            if (data[0] === 0x00 && !(data[1] & 128))
                throw new E('invalid signature integer: unnecessary leading zero');
            return b2n(data);
        },
    },
    toSig(hex) {
        // parse DER signature
        const { Err: E, _int: int, _tlv: tlv } = exports.DER;
        const data = typeof hex === 'string' ? h2b(hex) : hex;
        ut.abytes(data);
        const { v: seqBytes, l: seqLeftBytes } = tlv.decode(0x30, data);
        if (seqLeftBytes.length)
            throw new E('invalid signature: left bytes after parsing');
        const { v: rBytes, l: rLeftBytes } = tlv.decode(0x02, seqBytes);
        const { v: sBytes, l: sLeftBytes } = tlv.decode(0x02, rLeftBytes);
        if (sLeftBytes.length)
            throw new E('invalid signature: left bytes after parsing');
        return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
        const { _tlv: tlv, _int: int } = exports.DER;
        const rs = tlv.encode(0x02, int.encode(sig.r));
        const ss = tlv.encode(0x02, int.encode(sig.s));
        const seq = rs + ss;
        return tlv.encode(0x30, seq);
    },
};
// Be friendly to bad ECMAScript parsers by not using bigint literals
// prettier-ignore
const _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _3n = BigInt(3), _4n = BigInt(4);
function weierstrassPoints(opts) {
    const CURVE = validatePointOpts(opts);
    const { Fp } = CURVE; // All curves has same field / group length as for now, but they can differ
    const Fn = (0, modular_js_1.Field)(CURVE.n, CURVE.nBitLength);
    const toBytes = CURVE.toBytes ||
        ((_c, point, _isCompressed) => {
            const a = point.toAffine();
            return ut.concatBytes(Uint8Array.from([0x04]), Fp.toBytes(a.x), Fp.toBytes(a.y));
        });
    const fromBytes = CURVE.fromBytes ||
        ((bytes) => {
            // const head = bytes[0];
            const tail = bytes.subarray(1);
            // if (head !== 0x04) throw new Error('Only non-compressed encoding is supported');
            const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
            const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
            return { x, y };
        });
    /**
     * y² = x³ + ax + b: Short weierstrass curve formula
     * @returns y²
     */
    function weierstrassEquation(x) {
        const { a, b } = CURVE;
        const x2 = Fp.sqr(x); // x * x
        const x3 = Fp.mul(x2, x); // x2 * x
        return Fp.add(Fp.add(x3, Fp.mul(x, a)), b); // x3 + a * x + b
    }
    // Validate whether the passed curve params are valid.
    // We check if curve equation works for generator point.
    // `assertValidity()` won't work: `isTorsionFree()` is not available at this point in bls12-381.
    // ProjectivePoint class has not been initialized yet.
    if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
        throw new Error('bad generator point: equation left != right');
    // Valid group elements reside in range 1..n-1
    function isWithinCurveOrder(num) {
        return ut.inRange(num, _1n, CURVE.n);
    }
    // Validates if priv key is valid and converts it to bigint.
    // Supports options allowedPrivateKeyLengths and wrapPrivateKey.
    function normPrivateKeyToScalar(key) {
        const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
        if (lengths && typeof key !== 'bigint') {
            if (ut.isBytes(key))
                key = ut.bytesToHex(key);
            // Normalize to hex string, pad. E.g. P521 would norm 130-132 char hex to 132-char bytes
            if (typeof key !== 'string' || !lengths.includes(key.length))
                throw new Error('invalid private key');
            key = key.padStart(nByteLength * 2, '0');
        }
        let num;
        try {
            num =
                typeof key === 'bigint'
                    ? key
                    : ut.bytesToNumberBE((0, utils_js_1.ensureBytes)('private key', key, nByteLength));
        }
        catch (error) {
            throw new Error('invalid private key, expected hex or ' + nByteLength + ' bytes, got ' + typeof key);
        }
        if (wrapPrivateKey)
            num = (0, modular_js_1.mod)(num, N); // disabled by default, enabled for BLS
        ut.aInRange('private key', num, _1n, N); // num in range [1..N-1]
        return num;
    }
    function assertPrjPoint(other) {
        if (!(other instanceof Point))
            throw new Error('ProjectivePoint expected');
    }
    // Memoized toAffine / validity check. They are heavy. Points are immutable.
    // Converts Projective point to affine (x, y) coordinates.
    // Can accept precomputed Z^-1 - for example, from invertBatch.
    // (x, y, z) ∋ (x=x/z, y=y/z)
    const toAffineMemo = (0, utils_js_1.memoized)((p, iz) => {
        const { px: x, py: y, pz: z } = p;
        // Fast-path for normalized points
        if (Fp.eql(z, Fp.ONE))
            return { x, y };
        const is0 = p.is0();
        // If invZ was 0, we return zero point. However we still want to execute
        // all operations, so we replace invZ with a random number, 1.
        if (iz == null)
            iz = is0 ? Fp.ONE : Fp.inv(z);
        const ax = Fp.mul(x, iz);
        const ay = Fp.mul(y, iz);
        const zz = Fp.mul(z, iz);
        if (is0)
            return { x: Fp.ZERO, y: Fp.ZERO };
        if (!Fp.eql(zz, Fp.ONE))
            throw new Error('invZ was invalid');
        return { x: ax, y: ay };
    });
    // NOTE: on exception this will crash 'cached' and no value will be set.
    // Otherwise true will be return
    const assertValidMemo = (0, utils_js_1.memoized)((p) => {
        if (p.is0()) {
            // (0, 1, 0) aka ZERO is invalid in most contexts.
            // In BLS, ZERO can be serialized, so we allow it.
            // (0, 0, 0) is invalid representation of ZERO.
            if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
                return;
            throw new Error('bad point: ZERO');
        }
        // Some 3rd-party test vectors require different wording between here & `fromCompressedHex`
        const { x, y } = p.toAffine();
        // Check if x, y are valid field elements
        if (!Fp.isValid(x) || !Fp.isValid(y))
            throw new Error('bad point: x or y not FE');
        const left = Fp.sqr(y); // y²
        const right = weierstrassEquation(x); // x³ + ax + b
        if (!Fp.eql(left, right))
            throw new Error('bad point: equation left != right');
        if (!p.isTorsionFree())
            throw new Error('bad point: not in prime-order subgroup');
        return true;
    });
    /**
     * Projective Point works in 3d / projective (homogeneous) coordinates: (x, y, z) ∋ (x=x/z, y=y/z)
     * Default Point works in 2d / affine coordinates: (x, y)
     * We're doing calculations in projective, because its operations don't require costly inversion.
     */
    class Point {
        constructor(px, py, pz) {
            this.px = px;
            this.py = py;
            this.pz = pz;
            if (px == null || !Fp.isValid(px))
                throw new Error('x required');
            if (py == null || !Fp.isValid(py))
                throw new Error('y required');
            if (pz == null || !Fp.isValid(pz))
                throw new Error('z required');
            Object.freeze(this);
        }
        // Does not validate if the point is on-curve.
        // Use fromHex instead, or call assertValidity() later.
        static fromAffine(p) {
            const { x, y } = p || {};
            if (!p || !Fp.isValid(x) || !Fp.isValid(y))
                throw new Error('invalid affine point');
            if (p instanceof Point)
                throw new Error('projective point not allowed');
            const is0 = (i) => Fp.eql(i, Fp.ZERO);
            // fromAffine(x:0, y:0) would produce (x:0, y:0, z:1), but we need (x:0, y:1, z:0)
            if (is0(x) && is0(y))
                return Point.ZERO;
            return new Point(x, y, Fp.ONE);
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        /**
         * Takes a bunch of Projective Points but executes only one
         * inversion on all of them. Inversion is very slow operation,
         * so this improves performance massively.
         * Optimization: converts a list of projective points to a list of identical points with Z=1.
         */
        static normalizeZ(points) {
            const toInv = Fp.invertBatch(points.map((p) => p.pz));
            return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
        }
        /**
         * Converts hash string or Uint8Array to Point.
         * @param hex short/long ECDSA hex
         */
        static fromHex(hex) {
            const P = Point.fromAffine(fromBytes((0, utils_js_1.ensureBytes)('pointHex', hex)));
            P.assertValidity();
            return P;
        }
        // Multiplies generator point by privateKey.
        static fromPrivateKey(privateKey) {
            return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
        }
        // Multiscalar Multiplication
        static msm(points, scalars) {
            return (0, curve_js_1.pippenger)(Point, Fn, points, scalars);
        }
        // "Private method", don't use it directly
        _setWindowSize(windowSize) {
            wnaf.setWindowSize(this, windowSize);
        }
        // A point on curve is valid if it conforms to equation.
        assertValidity() {
            assertValidMemo(this);
        }
        hasEvenY() {
            const { y } = this.toAffine();
            if (Fp.isOdd)
                return !Fp.isOdd(y);
            throw new Error("Field doesn't support isOdd");
        }
        /**
         * Compare one point to another.
         */
        equals(other) {
            assertPrjPoint(other);
            const { px: X1, py: Y1, pz: Z1 } = this;
            const { px: X2, py: Y2, pz: Z2 } = other;
            const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
            const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
            return U1 && U2;
        }
        /**
         * Flips point to one corresponding to (x, -y) in Affine coordinates.
         */
        negate() {
            return new Point(this.px, Fp.neg(this.py), this.pz);
        }
        // Renes-Costello-Batina exception-free doubling formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 3
        // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
        double() {
            const { a, b } = CURVE;
            const b3 = Fp.mul(b, _3n);
            const { px: X1, py: Y1, pz: Z1 } = this;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO; // prettier-ignore
            let t0 = Fp.mul(X1, X1); // step 1
            let t1 = Fp.mul(Y1, Y1);
            let t2 = Fp.mul(Z1, Z1);
            let t3 = Fp.mul(X1, Y1);
            t3 = Fp.add(t3, t3); // step 5
            Z3 = Fp.mul(X1, Z1);
            Z3 = Fp.add(Z3, Z3);
            X3 = Fp.mul(a, Z3);
            Y3 = Fp.mul(b3, t2);
            Y3 = Fp.add(X3, Y3); // step 10
            X3 = Fp.sub(t1, Y3);
            Y3 = Fp.add(t1, Y3);
            Y3 = Fp.mul(X3, Y3);
            X3 = Fp.mul(t3, X3);
            Z3 = Fp.mul(b3, Z3); // step 15
            t2 = Fp.mul(a, t2);
            t3 = Fp.sub(t0, t2);
            t3 = Fp.mul(a, t3);
            t3 = Fp.add(t3, Z3);
            Z3 = Fp.add(t0, t0); // step 20
            t0 = Fp.add(Z3, t0);
            t0 = Fp.add(t0, t2);
            t0 = Fp.mul(t0, t3);
            Y3 = Fp.add(Y3, t0);
            t2 = Fp.mul(Y1, Z1); // step 25
            t2 = Fp.add(t2, t2);
            t0 = Fp.mul(t2, t3);
            X3 = Fp.sub(X3, t0);
            Z3 = Fp.mul(t2, t1);
            Z3 = Fp.add(Z3, Z3); // step 30
            Z3 = Fp.add(Z3, Z3);
            return new Point(X3, Y3, Z3);
        }
        // Renes-Costello-Batina exception-free addition formula.
        // There is 30% faster Jacobian formula, but it is not complete.
        // https://eprint.iacr.org/2015/1060, algorithm 1
        // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
        add(other) {
            assertPrjPoint(other);
            const { px: X1, py: Y1, pz: Z1 } = this;
            const { px: X2, py: Y2, pz: Z2 } = other;
            let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO; // prettier-ignore
            const a = CURVE.a;
            const b3 = Fp.mul(CURVE.b, _3n);
            let t0 = Fp.mul(X1, X2); // step 1
            let t1 = Fp.mul(Y1, Y2);
            let t2 = Fp.mul(Z1, Z2);
            let t3 = Fp.add(X1, Y1);
            let t4 = Fp.add(X2, Y2); // step 5
            t3 = Fp.mul(t3, t4);
            t4 = Fp.add(t0, t1);
            t3 = Fp.sub(t3, t4);
            t4 = Fp.add(X1, Z1);
            let t5 = Fp.add(X2, Z2); // step 10
            t4 = Fp.mul(t4, t5);
            t5 = Fp.add(t0, t2);
            t4 = Fp.sub(t4, t5);
            t5 = Fp.add(Y1, Z1);
            X3 = Fp.add(Y2, Z2); // step 15
            t5 = Fp.mul(t5, X3);
            X3 = Fp.add(t1, t2);
            t5 = Fp.sub(t5, X3);
            Z3 = Fp.mul(a, t4);
            X3 = Fp.mul(b3, t2); // step 20
            Z3 = Fp.add(X3, Z3);
            X3 = Fp.sub(t1, Z3);
            Z3 = Fp.add(t1, Z3);
            Y3 = Fp.mul(X3, Z3);
            t1 = Fp.add(t0, t0); // step 25
            t1 = Fp.add(t1, t0);
            t2 = Fp.mul(a, t2);
            t4 = Fp.mul(b3, t4);
            t1 = Fp.add(t1, t2);
            t2 = Fp.sub(t0, t2); // step 30
            t2 = Fp.mul(a, t2);
            t4 = Fp.add(t4, t2);
            t0 = Fp.mul(t1, t4);
            Y3 = Fp.add(Y3, t0);
            t0 = Fp.mul(t5, t4); // step 35
            X3 = Fp.mul(t3, X3);
            X3 = Fp.sub(X3, t0);
            t0 = Fp.mul(t3, t1);
            Z3 = Fp.mul(t5, Z3);
            Z3 = Fp.add(Z3, t0); // step 40
            return new Point(X3, Y3, Z3);
        }
        subtract(other) {
            return this.add(other.negate());
        }
        is0() {
            return this.equals(Point.ZERO);
        }
        wNAF(n) {
            return wnaf.wNAFCached(this, n, Point.normalizeZ);
        }
        /**
         * Non-constant-time multiplication. Uses double-and-add algorithm.
         * It's faster, but should only be used when you don't care about
         * an exposed private key e.g. sig verification, which works over *public* keys.
         */
        multiplyUnsafe(sc) {
            const { endo, n: N } = CURVE;
            ut.aInRange('scalar', sc, _0n, N);
            const I = Point.ZERO;
            if (sc === _0n)
                return I;
            if (this.is0() || sc === _1n)
                return this;
            // Case a: no endomorphism. Case b: has precomputes.
            if (!endo || wnaf.hasPrecomputes(this))
                return wnaf.wNAFCachedUnsafe(this, sc, Point.normalizeZ);
            // Case c: endomorphism
            let { k1neg, k1, k2neg, k2 } = endo.splitScalar(sc);
            let k1p = I;
            let k2p = I;
            let d = this;
            while (k1 > _0n || k2 > _0n) {
                if (k1 & _1n)
                    k1p = k1p.add(d);
                if (k2 & _1n)
                    k2p = k2p.add(d);
                d = d.double();
                k1 >>= _1n;
                k2 >>= _1n;
            }
            if (k1neg)
                k1p = k1p.negate();
            if (k2neg)
                k2p = k2p.negate();
            k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
            return k1p.add(k2p);
        }
        /**
         * Constant time multiplication.
         * Uses wNAF method. Windowed method may be 10% faster,
         * but takes 2x longer to generate and consumes 2x memory.
         * Uses precomputes when available.
         * Uses endomorphism for Koblitz curves.
         * @param scalar by which the point would be multiplied
         * @returns New point
         */
        multiply(scalar) {
            const { endo, n: N } = CURVE;
            ut.aInRange('scalar', scalar, _1n, N);
            let point, fake; // Fake point is used to const-time mult
            if (endo) {
                const { k1neg, k1, k2neg, k2 } = endo.splitScalar(scalar);
                let { p: k1p, f: f1p } = this.wNAF(k1);
                let { p: k2p, f: f2p } = this.wNAF(k2);
                k1p = wnaf.constTimeNegate(k1neg, k1p);
                k2p = wnaf.constTimeNegate(k2neg, k2p);
                k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
                point = k1p.add(k2p);
                fake = f1p.add(f2p);
            }
            else {
                const { p, f } = this.wNAF(scalar);
                point = p;
                fake = f;
            }
            // Normalize `z` for both points, but return only real one
            return Point.normalizeZ([point, fake])[0];
        }
        /**
         * Efficiently calculate `aP + bQ`. Unsafe, can expose private key, if used incorrectly.
         * Not using Strauss-Shamir trick: precomputation tables are faster.
         * The trick could be useful if both P and Q are not G (not in our case).
         * @returns non-zero affine point
         */
        multiplyAndAddUnsafe(Q, a, b) {
            const G = Point.BASE; // No Strauss-Shamir trick: we have 10% faster G precomputes
            const mul = (P, a // Select faster multiply() method
            ) => (a === _0n || a === _1n || !P.equals(G) ? P.multiplyUnsafe(a) : P.multiply(a));
            const sum = mul(this, a).add(mul(Q, b));
            return sum.is0() ? undefined : sum;
        }
        // Converts Projective point to affine (x, y) coordinates.
        // Can accept precomputed Z^-1 - for example, from invertBatch.
        // (x, y, z) ∋ (x=x/z, y=y/z)
        toAffine(iz) {
            return toAffineMemo(this, iz);
        }
        isTorsionFree() {
            const { h: cofactor, isTorsionFree } = CURVE;
            if (cofactor === _1n)
                return true; // No subgroups, always torsion-free
            if (isTorsionFree)
                return isTorsionFree(Point, this);
            throw new Error('isTorsionFree() has not been declared for the elliptic curve');
        }
        clearCofactor() {
            const { h: cofactor, clearCofactor } = CURVE;
            if (cofactor === _1n)
                return this; // Fast-path
            if (clearCofactor)
                return clearCofactor(Point, this);
            return this.multiplyUnsafe(CURVE.h);
        }
        toRawBytes(isCompressed = true) {
            (0, utils_js_1.abool)('isCompressed', isCompressed);
            this.assertValidity();
            return toBytes(Point, this, isCompressed);
        }
        toHex(isCompressed = true) {
            (0, utils_js_1.abool)('isCompressed', isCompressed);
            return ut.bytesToHex(this.toRawBytes(isCompressed));
        }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
    const _bits = CURVE.nBitLength;
    const wnaf = (0, curve_js_1.wNAF)(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
    // Validate if generator point is on curve
    return {
        CURVE,
        ProjectivePoint: Point,
        normPrivateKeyToScalar,
        weierstrassEquation,
        isWithinCurveOrder,
    };
}
function validateOpts(curve) {
    const opts = (0, curve_js_1.validateBasic)(curve);
    ut.validateObject(opts, {
        hash: 'hash',
        hmac: 'function',
        randomBytes: 'function',
    }, {
        bits2int: 'function',
        bits2int_modN: 'function',
        lowS: 'boolean',
    });
    return Object.freeze({ lowS: true, ...opts });
}
/**
 * Creates short weierstrass curve and ECDSA signature methods for it.
 * @example
 * import { Field } from '@noble/curves/abstract/modular';
 * // Before that, define BigInt-s: a, b, p, n, Gx, Gy
 * const curve = weierstrass({ a, b, Fp: Field(p), n, Gx, Gy, h: 1n })
 */
function weierstrass(curveDef) {
    const CURVE = validateOpts(curveDef);
    const { Fp, n: CURVE_ORDER } = CURVE;
    const compressedLen = Fp.BYTES + 1; // e.g. 33 for 32
    const uncompressedLen = 2 * Fp.BYTES + 1; // e.g. 65 for 32
    function modN(a) {
        return (0, modular_js_1.mod)(a, CURVE_ORDER);
    }
    function invN(a) {
        return (0, modular_js_1.invert)(a, CURVE_ORDER);
    }
    const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder, } = weierstrassPoints({
        ...CURVE,
        toBytes(_c, point, isCompressed) {
            const a = point.toAffine();
            const x = Fp.toBytes(a.x);
            const cat = ut.concatBytes;
            (0, utils_js_1.abool)('isCompressed', isCompressed);
            if (isCompressed) {
                return cat(Uint8Array.from([point.hasEvenY() ? 0x02 : 0x03]), x);
            }
            else {
                return cat(Uint8Array.from([0x04]), x, Fp.toBytes(a.y));
            }
        },
        fromBytes(bytes) {
            const len = bytes.length;
            const head = bytes[0];
            const tail = bytes.subarray(1);
            // this.assertValidity() is done inside of fromHex
            if (len === compressedLen && (head === 0x02 || head === 0x03)) {
                const x = ut.bytesToNumberBE(tail);
                if (!ut.inRange(x, _1n, Fp.ORDER))
                    throw new Error('Point is not on curve');
                const y2 = weierstrassEquation(x); // y² = x³ + ax + b
                let y;
                try {
                    y = Fp.sqrt(y2); // y = y² ^ (p+1)/4
                }
                catch (sqrtError) {
                    const suffix = sqrtError instanceof Error ? ': ' + sqrtError.message : '';
                    throw new Error('Point is not on curve' + suffix);
                }
                const isYOdd = (y & _1n) === _1n;
                // ECDSA
                const isHeadOdd = (head & 1) === 1;
                if (isHeadOdd !== isYOdd)
                    y = Fp.neg(y);
                return { x, y };
            }
            else if (len === uncompressedLen && head === 0x04) {
                const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
                const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
                return { x, y };
            }
            else {
                const cl = compressedLen;
                const ul = uncompressedLen;
                throw new Error('invalid Point, expected length of ' + cl + ', or uncompressed ' + ul + ', got ' + len);
            }
        },
    });
    const numToNByteStr = (num) => ut.bytesToHex(ut.numberToBytesBE(num, CURVE.nByteLength));
    function isBiggerThanHalfOrder(number) {
        const HALF = CURVE_ORDER >> _1n;
        return number > HALF;
    }
    function normalizeS(s) {
        return isBiggerThanHalfOrder(s) ? modN(-s) : s;
    }
    // slice bytes num
    const slcNum = (b, from, to) => ut.bytesToNumberBE(b.slice(from, to));
    /**
     * ECDSA signature with its (r, s) properties. Supports DER & compact representations.
     */
    class Signature {
        constructor(r, s, recovery) {
            this.r = r;
            this.s = s;
            this.recovery = recovery;
            this.assertValidity();
        }
        // pair (bytes of r, bytes of s)
        static fromCompact(hex) {
            const l = CURVE.nByteLength;
            hex = (0, utils_js_1.ensureBytes)('compactSignature', hex, l * 2);
            return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
        }
        // DER encoded ECDSA signature
        // https://bitcoin.stackexchange.com/questions/57644/what-are-the-parts-of-a-bitcoin-transaction-input-script
        static fromDER(hex) {
            const { r, s } = exports.DER.toSig((0, utils_js_1.ensureBytes)('DER', hex));
            return new Signature(r, s);
        }
        assertValidity() {
            ut.aInRange('r', this.r, _1n, CURVE_ORDER); // r in [1..N]
            ut.aInRange('s', this.s, _1n, CURVE_ORDER); // s in [1..N]
        }
        addRecoveryBit(recovery) {
            return new Signature(this.r, this.s, recovery);
        }
        recoverPublicKey(msgHash) {
            const { r, s, recovery: rec } = this;
            const h = bits2int_modN((0, utils_js_1.ensureBytes)('msgHash', msgHash)); // Truncate hash
            if (rec == null || ![0, 1, 2, 3].includes(rec))
                throw new Error('recovery id invalid');
            const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
            if (radj >= Fp.ORDER)
                throw new Error('recovery id 2 or 3 invalid');
            const prefix = (rec & 1) === 0 ? '02' : '03';
            const R = Point.fromHex(prefix + numToNByteStr(radj));
            const ir = invN(radj); // r^-1
            const u1 = modN(-h * ir); // -hr^-1
            const u2 = modN(s * ir); // sr^-1
            const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2); // (sr^-1)R-(hr^-1)G = -(hr^-1)G + (sr^-1)
            if (!Q)
                throw new Error('point at infinify'); // unsafe is fine: no priv data leaked
            Q.assertValidity();
            return Q;
        }
        // Signatures should be low-s, to prevent malleability.
        hasHighS() {
            return isBiggerThanHalfOrder(this.s);
        }
        normalizeS() {
            return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
        }
        // DER-encoded
        toDERRawBytes() {
            return ut.hexToBytes(this.toDERHex());
        }
        toDERHex() {
            return exports.DER.hexFromSig({ r: this.r, s: this.s });
        }
        // padded bytes of r, then padded bytes of s
        toCompactRawBytes() {
            return ut.hexToBytes(this.toCompactHex());
        }
        toCompactHex() {
            return numToNByteStr(this.r) + numToNByteStr(this.s);
        }
    }
    const utils = {
        isValidPrivateKey(privateKey) {
            try {
                normPrivateKeyToScalar(privateKey);
                return true;
            }
            catch (error) {
                return false;
            }
        },
        normPrivateKeyToScalar: normPrivateKeyToScalar,
        /**
         * Produces cryptographically secure private key from random of size
         * (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
         */
        randomPrivateKey: () => {
            const length = (0, modular_js_1.getMinHashLength)(CURVE.n);
            return (0, modular_js_1.mapHashToField)(CURVE.randomBytes(length), CURVE.n);
        },
        /**
         * Creates precompute table for an arbitrary EC point. Makes point "cached".
         * Allows to massively speed-up `point.multiply(scalar)`.
         * @returns cached point
         * @example
         * const fast = utils.precompute(8, ProjectivePoint.fromHex(someonesPubKey));
         * fast.multiply(privKey); // much faster ECDH now
         */
        precompute(windowSize = 8, point = Point.BASE) {
            point._setWindowSize(windowSize);
            point.multiply(BigInt(3)); // 3 is arbitrary, just need any number here
            return point;
        },
    };
    /**
     * Computes public key for a private key. Checks for validity of the private key.
     * @param privateKey private key
     * @param isCompressed whether to return compact (default), or full key
     * @returns Public key, full when isCompressed=false; short when isCompressed=true
     */
    function getPublicKey(privateKey, isCompressed = true) {
        return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
    }
    /**
     * Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
     */
    function isProbPub(item) {
        const arr = ut.isBytes(item);
        const str = typeof item === 'string';
        const len = (arr || str) && item.length;
        if (arr)
            return len === compressedLen || len === uncompressedLen;
        if (str)
            return len === 2 * compressedLen || len === 2 * uncompressedLen;
        if (item instanceof Point)
            return true;
        return false;
    }
    /**
     * ECDH (Elliptic Curve Diffie Hellman).
     * Computes shared public key from private key and public key.
     * Checks: 1) private key validity 2) shared key is on-curve.
     * Does NOT hash the result.
     * @param privateA private key
     * @param publicB different public key
     * @param isCompressed whether to return compact (default), or full key
     * @returns shared public key
     */
    function getSharedSecret(privateA, publicB, isCompressed = true) {
        if (isProbPub(privateA))
            throw new Error('first arg must be private key');
        if (!isProbPub(publicB))
            throw new Error('second arg must be public key');
        const b = Point.fromHex(publicB); // check for being on-curve
        return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
    }
    // RFC6979: ensure ECDSA msg is X bytes and < N. RFC suggests optional truncating via bits2octets.
    // FIPS 186-4 4.6 suggests the leftmost min(nBitLen, outLen) bits, which matches bits2int.
    // bits2int can produce res>N, we can do mod(res, N) since the bitLen is the same.
    // int2octets can't be used; pads small msgs with 0: unacceptatble for trunc as per RFC vectors
    const bits2int = CURVE.bits2int ||
        function (bytes) {
            // Our custom check "just in case"
            if (bytes.length > 8192)
                throw new Error('input is too large');
            // For curves with nBitLength % 8 !== 0: bits2octets(bits2octets(m)) !== bits2octets(m)
            // for some cases, since bytes.length * 8 is not actual bitLength.
            const num = ut.bytesToNumberBE(bytes); // check for == u8 done here
            const delta = bytes.length * 8 - CURVE.nBitLength; // truncate to nBitLength leftmost bits
            return delta > 0 ? num >> BigInt(delta) : num;
        };
    const bits2int_modN = CURVE.bits2int_modN ||
        function (bytes) {
            return modN(bits2int(bytes)); // can't use bytesToNumberBE here
        };
    // NOTE: pads output with zero as per spec
    const ORDER_MASK = ut.bitMask(CURVE.nBitLength);
    /**
     * Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`.
     */
    function int2octets(num) {
        ut.aInRange('num < 2^' + CURVE.nBitLength, num, _0n, ORDER_MASK);
        // works with order, can have different size than numToField!
        return ut.numberToBytesBE(num, CURVE.nByteLength);
    }
    // Steps A, D of RFC6979 3.2
    // Creates RFC6979 seed; converts msg/privKey to numbers.
    // Used only in sign, not in verify.
    // NOTE: we cannot assume here that msgHash has same amount of bytes as curve order,
    // this will be invalid at least for P521. Also it can be bigger for P224 + SHA256
    function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
        if (['recovered', 'canonical'].some((k) => k in opts))
            throw new Error('sign() legacy options not supported');
        const { hash, randomBytes } = CURVE;
        let { lowS, prehash, extraEntropy: ent } = opts; // generates low-s sigs by default
        if (lowS == null)
            lowS = true; // RFC6979 3.2: we skip step A, because we already provide hash
        msgHash = (0, utils_js_1.ensureBytes)('msgHash', msgHash);
        validateSigVerOpts(opts);
        if (prehash)
            msgHash = (0, utils_js_1.ensureBytes)('prehashed msgHash', hash(msgHash));
        // We can't later call bits2octets, since nested bits2int is broken for curves
        // with nBitLength % 8 !== 0. Because of that, we unwrap it here as int2octets call.
        // const bits2octets = (bits) => int2octets(bits2int_modN(bits))
        const h1int = bits2int_modN(msgHash);
        const d = normPrivateKeyToScalar(privateKey); // validate private key, convert to bigint
        const seedArgs = [int2octets(d), int2octets(h1int)];
        // extraEntropy. RFC6979 3.6: additional k' (optional).
        if (ent != null && ent !== false) {
            // K = HMAC_K(V || 0x00 || int2octets(x) || bits2octets(h1) || k')
            const e = ent === true ? randomBytes(Fp.BYTES) : ent; // generate random bytes OR pass as-is
            seedArgs.push((0, utils_js_1.ensureBytes)('extraEntropy', e)); // check for being bytes
        }
        const seed = ut.concatBytes(...seedArgs); // Step D of RFC6979 3.2
        const m = h1int; // NOTE: no need to call bits2int second time here, it is inside truncateHash!
        // Converts signature params into point w r/s, checks result for validity.
        function k2sig(kBytes) {
            // RFC 6979 Section 3.2, step 3: k = bits2int(T)
            const k = bits2int(kBytes); // Cannot use fields methods, since it is group element
            if (!isWithinCurveOrder(k))
                return; // Important: all mod() calls here must be done over N
            const ik = invN(k); // k^-1 mod n
            const q = Point.BASE.multiply(k).toAffine(); // q = Gk
            const r = modN(q.x); // r = q.x mod n
            if (r === _0n)
                return;
            // Can use scalar blinding b^-1(bm + bdr) where b ∈ [1,q−1] according to
            // https://tches.iacr.org/index.php/TCHES/article/view/7337/6509. We've decided against it:
            // a) dependency on CSPRNG b) 15% slowdown c) doesn't really help since bigints are not CT
            const s = modN(ik * modN(m + r * d)); // Not using blinding here
            if (s === _0n)
                return;
            let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n); // recovery bit (2 or 3, when q.x > n)
            let normS = s;
            if (lowS && isBiggerThanHalfOrder(s)) {
                normS = normalizeS(s); // if lowS was passed, ensure s is always
                recovery ^= 1; // // in the bottom half of N
            }
            return new Signature(r, normS, recovery); // use normS, not s
        }
        return { seed, k2sig };
    }
    const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
    const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
    /**
     * Signs message hash with a private key.
     * ```
     * sign(m, d, k) where
     *   (x, y) = G × k
     *   r = x mod n
     *   s = (m + dr)/k mod n
     * ```
     * @param msgHash NOT message. msg needs to be hashed to `msgHash`, or use `prehash`.
     * @param privKey private key
     * @param opts lowS for non-malleable sigs. extraEntropy for mixing randomness into k. prehash will hash first arg.
     * @returns signature with recovery param
     */
    function sign(msgHash, privKey, opts = defaultSigOpts) {
        const { seed, k2sig } = prepSig(msgHash, privKey, opts); // Steps A, D of RFC6979 3.2.
        const C = CURVE;
        const drbg = ut.createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
        return drbg(seed, k2sig); // Steps B, C, D, E, F, G
    }
    // Enable precomputes. Slows down first publicKey computation by 20ms.
    Point.BASE._setWindowSize(8);
    // utils.precompute(8, ProjectivePoint.BASE)
    /**
     * Verifies a signature against message hash and public key.
     * Rejects lowS signatures by default: to override,
     * specify option `{lowS: false}`. Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
     *
     * ```
     * verify(r, s, h, P) where
     *   U1 = hs^-1 mod n
     *   U2 = rs^-1 mod n
     *   R = U1⋅G - U2⋅P
     *   mod(R.x, n) == r
     * ```
     */
    function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
        const sg = signature;
        msgHash = (0, utils_js_1.ensureBytes)('msgHash', msgHash);
        publicKey = (0, utils_js_1.ensureBytes)('publicKey', publicKey);
        const { lowS, prehash, format } = opts;
        // Verify opts, deduce signature format
        validateSigVerOpts(opts);
        if ('strict' in opts)
            throw new Error('options.strict was renamed to lowS');
        if (format !== undefined && format !== 'compact' && format !== 'der')
            throw new Error('format must be compact or der');
        const isHex = typeof sg === 'string' || ut.isBytes(sg);
        const isObj = !isHex &&
            !format &&
            typeof sg === 'object' &&
            sg !== null &&
            typeof sg.r === 'bigint' &&
            typeof sg.s === 'bigint';
        if (!isHex && !isObj)
            throw new Error('invalid signature, expected Uint8Array, hex string or Signature instance');
        let _sig = undefined;
        let P;
        try {
            if (isObj)
                _sig = new Signature(sg.r, sg.s);
            if (isHex) {
                // Signature can be represented in 2 ways: compact (2*nByteLength) & DER (variable-length).
                // Since DER can also be 2*nByteLength bytes, we check for it first.
                try {
                    if (format !== 'compact')
                        _sig = Signature.fromDER(sg);
                }
                catch (derError) {
                    if (!(derError instanceof exports.DER.Err))
                        throw derError;
                }
                if (!_sig && format !== 'der')
                    _sig = Signature.fromCompact(sg);
            }
            P = Point.fromHex(publicKey);
        }
        catch (error) {
            return false;
        }
        if (!_sig)
            return false;
        if (lowS && _sig.hasHighS())
            return false;
        if (prehash)
            msgHash = CURVE.hash(msgHash);
        const { r, s } = _sig;
        const h = bits2int_modN(msgHash); // Cannot use fields methods, since it is group element
        const is = invN(s); // s^-1
        const u1 = modN(h * is); // u1 = hs^-1 mod n
        const u2 = modN(r * is); // u2 = rs^-1 mod n
        const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine(); // R = u1⋅G + u2⋅P
        if (!R)
            return false;
        const v = modN(R.x);
        return v === r;
    }
    return {
        CURVE,
        getPublicKey,
        getSharedSecret,
        sign,
        verify,
        ProjectivePoint: Point,
        Signature,
        utils,
    };
}
/**
 * Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
 * TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
 * b = True and y = sqrt(u / v) if (u / v) is square in F, and
 * b = False and y = sqrt(Z * (u / v)) otherwise.
 * @param Fp
 * @param Z
 * @returns
 */
function SWUFpSqrtRatio(Fp, Z) {
    // Generic implementation
    const q = Fp.ORDER;
    let l = _0n;
    for (let o = q - _1n; o % _2n === _0n; o /= _2n)
        l += _1n;
    const c1 = l; // 1. c1, the largest integer such that 2^c1 divides q - 1.
    // We need 2n ** c1 and 2n ** (c1-1). We can't use **; but we can use <<.
    // 2n ** c1 == 2n << (c1-1)
    const _2n_pow_c1_1 = _2n << (c1 - _1n - _1n);
    const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
    const c2 = (q - _1n) / _2n_pow_c1; // 2. c2 = (q - 1) / (2^c1)  # Integer arithmetic
    const c3 = (c2 - _1n) / _2n; // 3. c3 = (c2 - 1) / 2            # Integer arithmetic
    const c4 = _2n_pow_c1 - _1n; // 4. c4 = 2^c1 - 1                # Integer arithmetic
    const c5 = _2n_pow_c1_1; // 5. c5 = 2^(c1 - 1)                  # Integer arithmetic
    const c6 = Fp.pow(Z, c2); // 6. c6 = Z^c2
    const c7 = Fp.pow(Z, (c2 + _1n) / _2n); // 7. c7 = Z^((c2 + 1) / 2)
    let sqrtRatio = (u, v) => {
        let tv1 = c6; // 1. tv1 = c6
        let tv2 = Fp.pow(v, c4); // 2. tv2 = v^c4
        let tv3 = Fp.sqr(tv2); // 3. tv3 = tv2^2
        tv3 = Fp.mul(tv3, v); // 4. tv3 = tv3 * v
        let tv5 = Fp.mul(u, tv3); // 5. tv5 = u * tv3
        tv5 = Fp.pow(tv5, c3); // 6. tv5 = tv5^c3
        tv5 = Fp.mul(tv5, tv2); // 7. tv5 = tv5 * tv2
        tv2 = Fp.mul(tv5, v); // 8. tv2 = tv5 * v
        tv3 = Fp.mul(tv5, u); // 9. tv3 = tv5 * u
        let tv4 = Fp.mul(tv3, tv2); // 10. tv4 = tv3 * tv2
        tv5 = Fp.pow(tv4, c5); // 11. tv5 = tv4^c5
        let isQR = Fp.eql(tv5, Fp.ONE); // 12. isQR = tv5 == 1
        tv2 = Fp.mul(tv3, c7); // 13. tv2 = tv3 * c7
        tv5 = Fp.mul(tv4, tv1); // 14. tv5 = tv4 * tv1
        tv3 = Fp.cmov(tv2, tv3, isQR); // 15. tv3 = CMOV(tv2, tv3, isQR)
        tv4 = Fp.cmov(tv5, tv4, isQR); // 16. tv4 = CMOV(tv5, tv4, isQR)
        // 17. for i in (c1, c1 - 1, ..., 2):
        for (let i = c1; i > _1n; i--) {
            let tv5 = i - _2n; // 18.    tv5 = i - 2
            tv5 = _2n << (tv5 - _1n); // 19.    tv5 = 2^tv5
            let tvv5 = Fp.pow(tv4, tv5); // 20.    tv5 = tv4^tv5
            const e1 = Fp.eql(tvv5, Fp.ONE); // 21.    e1 = tv5 == 1
            tv2 = Fp.mul(tv3, tv1); // 22.    tv2 = tv3 * tv1
            tv1 = Fp.mul(tv1, tv1); // 23.    tv1 = tv1 * tv1
            tvv5 = Fp.mul(tv4, tv1); // 24.    tv5 = tv4 * tv1
            tv3 = Fp.cmov(tv2, tv3, e1); // 25.    tv3 = CMOV(tv2, tv3, e1)
            tv4 = Fp.cmov(tvv5, tv4, e1); // 26.    tv4 = CMOV(tv5, tv4, e1)
        }
        return { isValid: isQR, value: tv3 };
    };
    if (Fp.ORDER % _4n === _3n) {
        // sqrt_ratio_3mod4(u, v)
        const c1 = (Fp.ORDER - _3n) / _4n; // 1. c1 = (q - 3) / 4     # Integer arithmetic
        const c2 = Fp.sqrt(Fp.neg(Z)); // 2. c2 = sqrt(-Z)
        sqrtRatio = (u, v) => {
            let tv1 = Fp.sqr(v); // 1. tv1 = v^2
            const tv2 = Fp.mul(u, v); // 2. tv2 = u * v
            tv1 = Fp.mul(tv1, tv2); // 3. tv1 = tv1 * tv2
            let y1 = Fp.pow(tv1, c1); // 4. y1 = tv1^c1
            y1 = Fp.mul(y1, tv2); // 5. y1 = y1 * tv2
            const y2 = Fp.mul(y1, c2); // 6. y2 = y1 * c2
            const tv3 = Fp.mul(Fp.sqr(y1), v); // 7. tv3 = y1^2; 8. tv3 = tv3 * v
            const isQR = Fp.eql(tv3, u); // 9. isQR = tv3 == u
            let y = Fp.cmov(y2, y1, isQR); // 10. y = CMOV(y2, y1, isQR)
            return { isValid: isQR, value: y }; // 11. return (isQR, y) isQR ? y : y*c2
        };
    }
    // No curves uses that
    // if (Fp.ORDER % _8n === _5n) // sqrt_ratio_5mod8
    return sqrtRatio;
}
/**
 * Simplified Shallue-van de Woestijne-Ulas Method
 * https://www.rfc-editor.org/rfc/rfc9380#section-6.6.2
 */
function mapToCurveSimpleSWU(Fp, opts) {
    (0, modular_js_1.validateField)(Fp);
    if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
        throw new Error('mapToCurveSimpleSWU: invalid opts');
    const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
    if (!Fp.isOdd)
        throw new Error('Fp.isOdd is not implemented!');
    // Input: u, an element of F.
    // Output: (x, y), a point on E.
    return (u) => {
        // prettier-ignore
        let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
        tv1 = Fp.sqr(u); // 1.  tv1 = u^2
        tv1 = Fp.mul(tv1, opts.Z); // 2.  tv1 = Z * tv1
        tv2 = Fp.sqr(tv1); // 3.  tv2 = tv1^2
        tv2 = Fp.add(tv2, tv1); // 4.  tv2 = tv2 + tv1
        tv3 = Fp.add(tv2, Fp.ONE); // 5.  tv3 = tv2 + 1
        tv3 = Fp.mul(tv3, opts.B); // 6.  tv3 = B * tv3
        tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO)); // 7.  tv4 = CMOV(Z, -tv2, tv2 != 0)
        tv4 = Fp.mul(tv4, opts.A); // 8.  tv4 = A * tv4
        tv2 = Fp.sqr(tv3); // 9.  tv2 = tv3^2
        tv6 = Fp.sqr(tv4); // 10. tv6 = tv4^2
        tv5 = Fp.mul(tv6, opts.A); // 11. tv5 = A * tv6
        tv2 = Fp.add(tv2, tv5); // 12. tv2 = tv2 + tv5
        tv2 = Fp.mul(tv2, tv3); // 13. tv2 = tv2 * tv3
        tv6 = Fp.mul(tv6, tv4); // 14. tv6 = tv6 * tv4
        tv5 = Fp.mul(tv6, opts.B); // 15. tv5 = B * tv6
        tv2 = Fp.add(tv2, tv5); // 16. tv2 = tv2 + tv5
        x = Fp.mul(tv1, tv3); // 17.   x = tv1 * tv3
        const { isValid, value } = sqrtRatio(tv2, tv6); // 18. (is_gx1_square, y1) = sqrt_ratio(tv2, tv6)
        y = Fp.mul(tv1, u); // 19.   y = tv1 * u  -> Z * u^3 * y1
        y = Fp.mul(y, value); // 20.   y = y * y1
        x = Fp.cmov(x, tv3, isValid); // 21.   x = CMOV(x, tv3, is_gx1_square)
        y = Fp.cmov(y, value, isValid); // 22.   y = CMOV(y, y1, is_gx1_square)
        const e1 = Fp.isOdd(u) === Fp.isOdd(y); // 23.  e1 = sgn0(u) == sgn0(y)
        y = Fp.cmov(Fp.neg(y), y, e1); // 24.   y = CMOV(-y, y, e1)
        x = Fp.div(x, tv4); // 25.   x = x / tv4
        return { x, y };
    };
}
//# sourceMappingURL=weierstrass.js.map

/***/ }),

/***/ 81:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hash_to_ristretto255 = exports.hashToRistretto255 = exports.RistrettoPoint = exports.encodeToCurve = exports.hashToCurve = exports.edwardsToMontgomery = exports.x25519 = exports.ed25519ph = exports.ed25519ctx = exports.ed25519 = exports.ED25519_TORSION_SUBGROUP = void 0;
exports.edwardsToMontgomeryPub = edwardsToMontgomeryPub;
exports.edwardsToMontgomeryPriv = edwardsToMontgomeryPriv;
/**
 * ed25519 Twisted Edwards curve with following addons:
 * - X25519 ECDH
 * - Ristretto cofactor elimination
 * - Elligator hash-to-group / point indistinguishability
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const sha512_1 = __nccwpck_require__(3345);
const utils_1 = __nccwpck_require__(9342);
const curve_js_1 = __nccwpck_require__(9460);
const edwards_js_1 = __nccwpck_require__(4287);
const hash_to_curve_js_1 = __nccwpck_require__(9287);
const modular_js_1 = __nccwpck_require__(5705);
const montgomery_js_1 = __nccwpck_require__(2096);
const utils_js_1 = __nccwpck_require__(7442);
const ED25519_P = BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819949');
// √(-1) aka √(a) aka 2^((p-1)/4)
const ED25519_SQRT_M1 = /* @__PURE__ */ BigInt('19681161376707505956807079304988542015446066515923890162744021073123829784752');
// prettier-ignore
const _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _3n = BigInt(3);
// prettier-ignore
const _5n = BigInt(5), _8n = BigInt(8);
function ed25519_pow_2_252_3(x) {
    // prettier-ignore
    const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
    const P = ED25519_P;
    const x2 = (x * x) % P;
    const b2 = (x2 * x) % P; // x^3, 11
    const b4 = ((0, modular_js_1.pow2)(b2, _2n, P) * b2) % P; // x^15, 1111
    const b5 = ((0, modular_js_1.pow2)(b4, _1n, P) * x) % P; // x^31
    const b10 = ((0, modular_js_1.pow2)(b5, _5n, P) * b5) % P;
    const b20 = ((0, modular_js_1.pow2)(b10, _10n, P) * b10) % P;
    const b40 = ((0, modular_js_1.pow2)(b20, _20n, P) * b20) % P;
    const b80 = ((0, modular_js_1.pow2)(b40, _40n, P) * b40) % P;
    const b160 = ((0, modular_js_1.pow2)(b80, _80n, P) * b80) % P;
    const b240 = ((0, modular_js_1.pow2)(b160, _80n, P) * b80) % P;
    const b250 = ((0, modular_js_1.pow2)(b240, _10n, P) * b10) % P;
    const pow_p_5_8 = ((0, modular_js_1.pow2)(b250, _2n, P) * x) % P;
    // ^ To pow to (p+3)/8, multiply it by x.
    return { pow_p_5_8, b2 };
}
function adjustScalarBytes(bytes) {
    // Section 5: For X25519, in order to decode 32 random bytes as an integer scalar,
    // set the three least significant bits of the first byte
    bytes[0] &= 248; // 0b1111_1000
    // and the most significant bit of the last to zero,
    bytes[31] &= 127; // 0b0111_1111
    // set the second most significant bit of the last byte to 1
    bytes[31] |= 64; // 0b0100_0000
    return bytes;
}
// sqrt(u/v)
function uvRatio(u, v) {
    const P = ED25519_P;
    const v3 = (0, modular_js_1.mod)(v * v * v, P); // v³
    const v7 = (0, modular_js_1.mod)(v3 * v3 * v, P); // v⁷
    // (p+3)/8 and (p-5)/8
    const pow = ed25519_pow_2_252_3(u * v7).pow_p_5_8;
    let x = (0, modular_js_1.mod)(u * v3 * pow, P); // (uv³)(uv⁷)^(p-5)/8
    const vx2 = (0, modular_js_1.mod)(v * x * x, P); // vx²
    const root1 = x; // First root candidate
    const root2 = (0, modular_js_1.mod)(x * ED25519_SQRT_M1, P); // Second root candidate
    const useRoot1 = vx2 === u; // If vx² = u (mod p), x is a square root
    const useRoot2 = vx2 === (0, modular_js_1.mod)(-u, P); // If vx² = -u, set x <-- x * 2^((p-1)/4)
    const noRoot = vx2 === (0, modular_js_1.mod)(-u * ED25519_SQRT_M1, P); // There is no valid root, vx² = -u√(-1)
    if (useRoot1)
        x = root1;
    if (useRoot2 || noRoot)
        x = root2; // We return root2 anyway, for const-time
    if ((0, modular_js_1.isNegativeLE)(x, P))
        x = (0, modular_js_1.mod)(-x, P);
    return { isValid: useRoot1 || useRoot2, value: x };
}
// Just in case
exports.ED25519_TORSION_SUBGROUP = [
    '0100000000000000000000000000000000000000000000000000000000000000',
    'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a',
    '0000000000000000000000000000000000000000000000000000000000000080',
    '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05',
    'ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f',
    '26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85',
    '0000000000000000000000000000000000000000000000000000000000000000',
    'c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa',
];
const Fp = /* @__PURE__ */ (() => (0, modular_js_1.Field)(ED25519_P, undefined, true))();
const ed25519Defaults = /* @__PURE__ */ (() => ({
    // Param: a
    a: BigInt(-1), // Fp.create(-1) is proper; our way still works and is faster
    // d is equal to -121665/121666 over finite field.
    // Negative number is P - number, and division is invert(number, P)
    d: BigInt('37095705934669439343138083508754565189542113879843219016388785533085940283555'),
    // Finite field 𝔽p over which we'll do calculations; 2n**255n - 19n
    Fp,
    // Subgroup order: how many points curve has
    // 2n**252n + 27742317777372353535851937790883648493n;
    n: BigInt('7237005577332262213973186563042994240857116359379907606001950938285454250989'),
    // Cofactor
    h: _8n,
    // Base point (x, y) aka generator point
    Gx: BigInt('15112221349535400772501151409588531511454012693041857206046113283949847762202'),
    Gy: BigInt('46316835694926478169428394003475163141307993866256225615783033603165251855960'),
    hash: sha512_1.sha512,
    randomBytes: utils_1.randomBytes,
    adjustScalarBytes,
    // dom2
    // Ratio of u to v. Allows us to combine inversion and square root. Uses algo from RFC8032 5.1.3.
    // Constant-time, u/√v
    uvRatio,
}))();
/**
 * ed25519 curve with EdDSA signatures.
 * @example
 * import { ed25519 } from '@noble/curves/ed25519';
 * const priv = ed25519.utils.randomPrivateKey();
 * const pub = ed25519.getPublicKey(priv);
 * const msg = new TextEncoder().encode('hello');
 * const sig = ed25519.sign(msg, priv);
 * ed25519.verify(sig, msg, pub); // Default mode: follows ZIP215
 * ed25519.verify(sig, msg, pub, { zip215: false }); // RFC8032 / FIPS 186-5
 */
exports.ed25519 = (() => (0, edwards_js_1.twistedEdwards)(ed25519Defaults))();
function ed25519_domain(data, ctx, phflag) {
    if (ctx.length > 255)
        throw new Error('Context is too big');
    return (0, utils_1.concatBytes)((0, utils_1.utf8ToBytes)('SigEd25519 no Ed25519 collisions'), new Uint8Array([phflag ? 1 : 0, ctx.length]), ctx, data);
}
exports.ed25519ctx = (() => (0, edwards_js_1.twistedEdwards)({
    ...ed25519Defaults,
    domain: ed25519_domain,
}))();
exports.ed25519ph = (() => (0, edwards_js_1.twistedEdwards)(Object.assign({}, ed25519Defaults, {
    domain: ed25519_domain,
    prehash: sha512_1.sha512,
})))();
/**
 * ECDH using curve25519 aka x25519.
 * @example
 * import { x25519 } from '@noble/curves/ed25519';
 * const priv = 'a546e36bf0527c9d3b16154b82465edd62144c0ac1fc5a18506a2244ba449ac4';
 * const pub = 'e6db6867583030db3594c1a424b15f7c726624ec26b3353b10a903a6d0ab1c4c';
 * x25519.getSharedSecret(priv, pub) === x25519.scalarMult(priv, pub); // aliases
 * x25519.getPublicKey(priv) === x25519.scalarMultBase(priv);
 * x25519.getPublicKey(x25519.utils.randomPrivateKey());
 */
exports.x25519 = (() => (0, montgomery_js_1.montgomery)({
    P: ED25519_P,
    a: BigInt(486662),
    montgomeryBits: 255, // n is 253 bits
    nByteLength: 32,
    Gu: BigInt(9),
    powPminus2: (x) => {
        const P = ED25519_P;
        // x^(p-2) aka x^(2^255-21)
        const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
        return (0, modular_js_1.mod)((0, modular_js_1.pow2)(pow_p_5_8, _3n, P) * b2, P);
    },
    adjustScalarBytes,
    randomBytes: utils_1.randomBytes,
}))();
/**
 * Converts ed25519 public key to x25519 public key. Uses formula:
 * * `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
 * * `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
 * @example
 *   const someonesPub = ed25519.getPublicKey(ed25519.utils.randomPrivateKey());
 *   const aPriv = x25519.utils.randomPrivateKey();
 *   x25519.getSharedSecret(aPriv, edwardsToMontgomeryPub(someonesPub))
 */
function edwardsToMontgomeryPub(edwardsPub) {
    const { y } = exports.ed25519.ExtendedPoint.fromHex(edwardsPub);
    const _1n = BigInt(1);
    return Fp.toBytes(Fp.create((_1n + y) * Fp.inv(_1n - y)));
}
exports.edwardsToMontgomery = edwardsToMontgomeryPub; // deprecated
/**
 * Converts ed25519 secret key to x25519 secret key.
 * @example
 *   const someonesPub = x25519.getPublicKey(x25519.utils.randomPrivateKey());
 *   const aPriv = ed25519.utils.randomPrivateKey();
 *   x25519.getSharedSecret(edwardsToMontgomeryPriv(aPriv), someonesPub)
 */
function edwardsToMontgomeryPriv(edwardsPriv) {
    const hashed = ed25519Defaults.hash(edwardsPriv.subarray(0, 32));
    return ed25519Defaults.adjustScalarBytes(hashed).subarray(0, 32);
}
// Hash To Curve Elligator2 Map (NOTE: different from ristretto255 elligator)
// NOTE: very important part is usage of FpSqrtEven for ELL2_C1_EDWARDS, since
// SageMath returns different root first and everything falls apart
const ELL2_C1 = /* @__PURE__ */ (() => (Fp.ORDER + _3n) / _8n)(); // 1. c1 = (q + 3) / 8       # Integer arithmetic
const ELL2_C2 = /* @__PURE__ */ (() => Fp.pow(_2n, ELL2_C1))(); // 2. c2 = 2^c1
const ELL2_C3 = /* @__PURE__ */ (() => Fp.sqrt(Fp.neg(Fp.ONE)))(); // 3. c3 = sqrt(-1)
// prettier-ignore
function map_to_curve_elligator2_curve25519(u) {
    const ELL2_C4 = (Fp.ORDER - _5n) / _8n; // 4. c4 = (q - 5) / 8       # Integer arithmetic
    const ELL2_J = BigInt(486662);
    let tv1 = Fp.sqr(u); //  1.  tv1 = u^2
    tv1 = Fp.mul(tv1, _2n); //  2.  tv1 = 2 * tv1
    let xd = Fp.add(tv1, Fp.ONE); //  3.   xd = tv1 + 1         # Nonzero: -1 is square (mod p), tv1 is not
    let x1n = Fp.neg(ELL2_J); //  4.  x1n = -J              # x1 = x1n / xd = -J / (1 + 2 * u^2)
    let tv2 = Fp.sqr(xd); //  5.  tv2 = xd^2
    let gxd = Fp.mul(tv2, xd); //  6.  gxd = tv2 * xd        # gxd = xd^3
    let gx1 = Fp.mul(tv1, ELL2_J); //  7.  gx1 = J * tv1         # x1n + J * xd
    gx1 = Fp.mul(gx1, x1n); //  8.  gx1 = gx1 * x1n       # x1n^2 + J * x1n * xd
    gx1 = Fp.add(gx1, tv2); //  9.  gx1 = gx1 + tv2       # x1n^2 + J * x1n * xd + xd^2
    gx1 = Fp.mul(gx1, x1n); //  10. gx1 = gx1 * x1n       # x1n^3 + J * x1n^2 * xd + x1n * xd^2
    let tv3 = Fp.sqr(gxd); //  11. tv3 = gxd^2
    tv2 = Fp.sqr(tv3); //  12. tv2 = tv3^2           # gxd^4
    tv3 = Fp.mul(tv3, gxd); //  13. tv3 = tv3 * gxd       # gxd^3
    tv3 = Fp.mul(tv3, gx1); //  14. tv3 = tv3 * gx1       # gx1 * gxd^3
    tv2 = Fp.mul(tv2, tv3); //  15. tv2 = tv2 * tv3       # gx1 * gxd^7
    let y11 = Fp.pow(tv2, ELL2_C4); //  16. y11 = tv2^c4        # (gx1 * gxd^7)^((p - 5) / 8)
    y11 = Fp.mul(y11, tv3); //  17. y11 = y11 * tv3       # gx1*gxd^3*(gx1*gxd^7)^((p-5)/8)
    let y12 = Fp.mul(y11, ELL2_C3); //  18. y12 = y11 * c3
    tv2 = Fp.sqr(y11); //  19. tv2 = y11^2
    tv2 = Fp.mul(tv2, gxd); //  20. tv2 = tv2 * gxd
    let e1 = Fp.eql(tv2, gx1); //  21.  e1 = tv2 == gx1
    let y1 = Fp.cmov(y12, y11, e1); //  22.  y1 = CMOV(y12, y11, e1)  # If g(x1) is square, this is its sqrt
    let x2n = Fp.mul(x1n, tv1); //  23. x2n = x1n * tv1       # x2 = x2n / xd = 2 * u^2 * x1n / xd
    let y21 = Fp.mul(y11, u); //  24. y21 = y11 * u
    y21 = Fp.mul(y21, ELL2_C2); //  25. y21 = y21 * c2
    let y22 = Fp.mul(y21, ELL2_C3); //  26. y22 = y21 * c3
    let gx2 = Fp.mul(gx1, tv1); //  27. gx2 = gx1 * tv1       # g(x2) = gx2 / gxd = 2 * u^2 * g(x1)
    tv2 = Fp.sqr(y21); //  28. tv2 = y21^2
    tv2 = Fp.mul(tv2, gxd); //  29. tv2 = tv2 * gxd
    let e2 = Fp.eql(tv2, gx2); //  30.  e2 = tv2 == gx2
    let y2 = Fp.cmov(y22, y21, e2); //  31.  y2 = CMOV(y22, y21, e2)  # If g(x2) is square, this is its sqrt
    tv2 = Fp.sqr(y1); //  32. tv2 = y1^2
    tv2 = Fp.mul(tv2, gxd); //  33. tv2 = tv2 * gxd
    let e3 = Fp.eql(tv2, gx1); //  34.  e3 = tv2 == gx1
    let xn = Fp.cmov(x2n, x1n, e3); //  35.  xn = CMOV(x2n, x1n, e3)  # If e3, x = x1, else x = x2
    let y = Fp.cmov(y2, y1, e3); //  36.   y = CMOV(y2, y1, e3)    # If e3, y = y1, else y = y2
    let e4 = Fp.isOdd(y); //  37.  e4 = sgn0(y) == 1        # Fix sign of y
    y = Fp.cmov(y, Fp.neg(y), e3 !== e4); //  38.   y = CMOV(y, -y, e3 XOR e4)
    return { xMn: xn, xMd: xd, yMn: y, yMd: _1n }; //  39. return (xn, xd, y, 1)
}
const ELL2_C1_EDWARDS = /* @__PURE__ */ (() => (0, modular_js_1.FpSqrtEven)(Fp, Fp.neg(BigInt(486664))))(); // sgn0(c1) MUST equal 0
function map_to_curve_elligator2_edwards25519(u) {
    const { xMn, xMd, yMn, yMd } = map_to_curve_elligator2_curve25519(u); //  1.  (xMn, xMd, yMn, yMd) =
    // map_to_curve_elligator2_curve25519(u)
    let xn = Fp.mul(xMn, yMd); //  2.  xn = xMn * yMd
    xn = Fp.mul(xn, ELL2_C1_EDWARDS); //  3.  xn = xn * c1
    let xd = Fp.mul(xMd, yMn); //  4.  xd = xMd * yMn    # xn / xd = c1 * xM / yM
    let yn = Fp.sub(xMn, xMd); //  5.  yn = xMn - xMd
    let yd = Fp.add(xMn, xMd); //  6.  yd = xMn + xMd    # (n / d - 1) / (n / d + 1) = (n - d) / (n + d)
    let tv1 = Fp.mul(xd, yd); //  7. tv1 = xd * yd
    let e = Fp.eql(tv1, Fp.ZERO); //  8.   e = tv1 == 0
    xn = Fp.cmov(xn, Fp.ZERO, e); //  9.  xn = CMOV(xn, 0, e)
    xd = Fp.cmov(xd, Fp.ONE, e); //  10. xd = CMOV(xd, 1, e)
    yn = Fp.cmov(yn, Fp.ONE, e); //  11. yn = CMOV(yn, 1, e)
    yd = Fp.cmov(yd, Fp.ONE, e); //  12. yd = CMOV(yd, 1, e)
    const inv = Fp.invertBatch([xd, yd]); // batch division
    return { x: Fp.mul(xn, inv[0]), y: Fp.mul(yn, inv[1]) }; //  13. return (xn, xd, yn, yd)
}
const htf = /* @__PURE__ */ (() => (0, hash_to_curve_js_1.createHasher)(exports.ed25519.ExtendedPoint, (scalars) => map_to_curve_elligator2_edwards25519(scalars[0]), {
    DST: 'edwards25519_XMD:SHA-512_ELL2_RO_',
    encodeDST: 'edwards25519_XMD:SHA-512_ELL2_NU_',
    p: Fp.ORDER,
    m: 1,
    k: 128,
    expand: 'xmd',
    hash: sha512_1.sha512,
}))();
exports.hashToCurve = (() => htf.hashToCurve)();
exports.encodeToCurve = (() => htf.encodeToCurve)();
function assertRstPoint(other) {
    if (!(other instanceof RistPoint))
        throw new Error('RistrettoPoint expected');
}
// √(-1) aka √(a) aka 2^((p-1)/4)
const SQRT_M1 = ED25519_SQRT_M1;
// √(ad - 1)
const SQRT_AD_MINUS_ONE = /* @__PURE__ */ BigInt('25063068953384623474111414158702152701244531502492656460079210482610430750235');
// 1 / √(a-d)
const INVSQRT_A_MINUS_D = /* @__PURE__ */ BigInt('54469307008909316920995813868745141605393597292927456921205312896311721017578');
// 1-d²
const ONE_MINUS_D_SQ = /* @__PURE__ */ BigInt('1159843021668779879193775521855586647937357759715417654439879720876111806838');
// (d-1)²
const D_MINUS_ONE_SQ = /* @__PURE__ */ BigInt('40440834346308536858101042469323190826248399146238708352240133220865137265952');
// Calculates 1/√(number)
const invertSqrt = (number) => uvRatio(_1n, number);
const MAX_255B = /* @__PURE__ */ BigInt('0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
const bytes255ToNumberLE = (bytes) => exports.ed25519.CURVE.Fp.create((0, utils_js_1.bytesToNumberLE)(bytes) & MAX_255B);
// Computes Elligator map for Ristretto
// https://ristretto.group/formulas/elligator.html
function calcElligatorRistrettoMap(r0) {
    const { d } = exports.ed25519.CURVE;
    const P = exports.ed25519.CURVE.Fp.ORDER;
    const mod = exports.ed25519.CURVE.Fp.create;
    const r = mod(SQRT_M1 * r0 * r0); // 1
    const Ns = mod((r + _1n) * ONE_MINUS_D_SQ); // 2
    let c = BigInt(-1); // 3
    const D = mod((c - d * r) * mod(r + d)); // 4
    let { isValid: Ns_D_is_sq, value: s } = uvRatio(Ns, D); // 5
    let s_ = mod(s * r0); // 6
    if (!(0, modular_js_1.isNegativeLE)(s_, P))
        s_ = mod(-s_);
    if (!Ns_D_is_sq)
        s = s_; // 7
    if (!Ns_D_is_sq)
        c = r; // 8
    const Nt = mod(c * (r - _1n) * D_MINUS_ONE_SQ - D); // 9
    const s2 = s * s;
    const W0 = mod((s + s) * D); // 10
    const W1 = mod(Nt * SQRT_AD_MINUS_ONE); // 11
    const W2 = mod(_1n - s2); // 12
    const W3 = mod(_1n + s2); // 13
    return new exports.ed25519.ExtendedPoint(mod(W0 * W3), mod(W2 * W1), mod(W1 * W3), mod(W0 * W2));
}
/**
 * Each ed25519/ExtendedPoint has 8 different equivalent points. This can be
 * a source of bugs for protocols like ring signatures. Ristretto was created to solve this.
 * Ristretto point operates in X:Y:Z:T extended coordinates like ExtendedPoint,
 * but it should work in its own namespace: do not combine those two.
 * https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-ristretto255-decaf448
 */
class RistPoint {
    // Private property to discourage combining ExtendedPoint + RistrettoPoint
    // Always use Ristretto encoding/decoding instead.
    constructor(ep) {
        this.ep = ep;
    }
    static fromAffine(ap) {
        return new RistPoint(exports.ed25519.ExtendedPoint.fromAffine(ap));
    }
    /**
     * Takes uniform output of 64-byte hash function like sha512 and converts it to `RistrettoPoint`.
     * The hash-to-group operation applies Elligator twice and adds the results.
     * **Note:** this is one-way map, there is no conversion from point to hash.
     * https://ristretto.group/formulas/elligator.html
     * @param hex 64-byte output of a hash function
     */
    static hashToCurve(hex) {
        hex = (0, utils_js_1.ensureBytes)('ristrettoHash', hex, 64);
        const r1 = bytes255ToNumberLE(hex.slice(0, 32));
        const R1 = calcElligatorRistrettoMap(r1);
        const r2 = bytes255ToNumberLE(hex.slice(32, 64));
        const R2 = calcElligatorRistrettoMap(r2);
        return new RistPoint(R1.add(R2));
    }
    /**
     * Converts ristretto-encoded string to ristretto point.
     * https://ristretto.group/formulas/decoding.html
     * @param hex Ristretto-encoded 32 bytes. Not every 32-byte string is valid ristretto encoding
     */
    static fromHex(hex) {
        hex = (0, utils_js_1.ensureBytes)('ristrettoHex', hex, 32);
        const { a, d } = exports.ed25519.CURVE;
        const P = exports.ed25519.CURVE.Fp.ORDER;
        const mod = exports.ed25519.CURVE.Fp.create;
        const emsg = 'RistrettoPoint.fromHex: the hex is not valid encoding of RistrettoPoint';
        const s = bytes255ToNumberLE(hex);
        // 1. Check that s_bytes is the canonical encoding of a field element, or else abort.
        // 3. Check that s is non-negative, or else abort
        if (!(0, utils_js_1.equalBytes)((0, utils_js_1.numberToBytesLE)(s, 32), hex) || (0, modular_js_1.isNegativeLE)(s, P))
            throw new Error(emsg);
        const s2 = mod(s * s);
        const u1 = mod(_1n + a * s2); // 4 (a is -1)
        const u2 = mod(_1n - a * s2); // 5
        const u1_2 = mod(u1 * u1);
        const u2_2 = mod(u2 * u2);
        const v = mod(a * d * u1_2 - u2_2); // 6
        const { isValid, value: I } = invertSqrt(mod(v * u2_2)); // 7
        const Dx = mod(I * u2); // 8
        const Dy = mod(I * Dx * v); // 9
        let x = mod((s + s) * Dx); // 10
        if ((0, modular_js_1.isNegativeLE)(x, P))
            x = mod(-x); // 10
        const y = mod(u1 * Dy); // 11
        const t = mod(x * y); // 12
        if (!isValid || (0, modular_js_1.isNegativeLE)(t, P) || y === _0n)
            throw new Error(emsg);
        return new RistPoint(new exports.ed25519.ExtendedPoint(x, y, _1n, t));
    }
    static msm(points, scalars) {
        const Fn = (0, modular_js_1.Field)(exports.ed25519.CURVE.n, exports.ed25519.CURVE.nBitLength);
        return (0, curve_js_1.pippenger)(RistPoint, Fn, points, scalars);
    }
    /**
     * Encodes ristretto point to Uint8Array.
     * https://ristretto.group/formulas/encoding.html
     */
    toRawBytes() {
        let { ex: x, ey: y, ez: z, et: t } = this.ep;
        const P = exports.ed25519.CURVE.Fp.ORDER;
        const mod = exports.ed25519.CURVE.Fp.create;
        const u1 = mod(mod(z + y) * mod(z - y)); // 1
        const u2 = mod(x * y); // 2
        // Square root always exists
        const u2sq = mod(u2 * u2);
        const { value: invsqrt } = invertSqrt(mod(u1 * u2sq)); // 3
        const D1 = mod(invsqrt * u1); // 4
        const D2 = mod(invsqrt * u2); // 5
        const zInv = mod(D1 * D2 * t); // 6
        let D; // 7
        if ((0, modular_js_1.isNegativeLE)(t * zInv, P)) {
            let _x = mod(y * SQRT_M1);
            let _y = mod(x * SQRT_M1);
            x = _x;
            y = _y;
            D = mod(D1 * INVSQRT_A_MINUS_D);
        }
        else {
            D = D2; // 8
        }
        if ((0, modular_js_1.isNegativeLE)(x * zInv, P))
            y = mod(-y); // 9
        let s = mod((z - y) * D); // 10 (check footer's note, no sqrt(-a))
        if ((0, modular_js_1.isNegativeLE)(s, P))
            s = mod(-s);
        return (0, utils_js_1.numberToBytesLE)(s, 32); // 11
    }
    toHex() {
        return (0, utils_js_1.bytesToHex)(this.toRawBytes());
    }
    toString() {
        return this.toHex();
    }
    // Compare one point to another.
    equals(other) {
        assertRstPoint(other);
        const { ex: X1, ey: Y1 } = this.ep;
        const { ex: X2, ey: Y2 } = other.ep;
        const mod = exports.ed25519.CURVE.Fp.create;
        // (x1 * y2 == y1 * x2) | (y1 * y2 == x1 * x2)
        const one = mod(X1 * Y2) === mod(Y1 * X2);
        const two = mod(Y1 * Y2) === mod(X1 * X2);
        return one || two;
    }
    add(other) {
        assertRstPoint(other);
        return new RistPoint(this.ep.add(other.ep));
    }
    subtract(other) {
        assertRstPoint(other);
        return new RistPoint(this.ep.subtract(other.ep));
    }
    multiply(scalar) {
        return new RistPoint(this.ep.multiply(scalar));
    }
    multiplyUnsafe(scalar) {
        return new RistPoint(this.ep.multiplyUnsafe(scalar));
    }
    double() {
        return new RistPoint(this.ep.double());
    }
    negate() {
        return new RistPoint(this.ep.negate());
    }
}
exports.RistrettoPoint = (() => {
    if (!RistPoint.BASE)
        RistPoint.BASE = new RistPoint(exports.ed25519.ExtendedPoint.BASE);
    if (!RistPoint.ZERO)
        RistPoint.ZERO = new RistPoint(exports.ed25519.ExtendedPoint.ZERO);
    return RistPoint;
})();
// Hashing to ristretto255. https://www.rfc-editor.org/rfc/rfc9380#appendix-B
const hashToRistretto255 = (msg, options) => {
    const d = options.DST;
    const DST = typeof d === 'string' ? (0, utils_1.utf8ToBytes)(d) : d;
    const uniform_bytes = (0, hash_to_curve_js_1.expand_message_xmd)(msg, DST, 64, sha512_1.sha512);
    const P = RistPoint.hashToCurve(uniform_bytes);
    return P;
};
exports.hashToRistretto255 = hashToRistretto255;
exports.hash_to_ristretto255 = exports.hashToRistretto255; // legacy
//# sourceMappingURL=ed25519.js.map

/***/ }),

/***/ 7300:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.encodeToCurve = exports.hashToCurve = exports.schnorr = exports.secp256k1 = void 0;
/**
 * NIST secp256k1. See [pdf](https://www.secg.org/sec2-v2.pdf).
 *
 * Seems to be rigid (not backdoored)
 * [as per discussion](https://bitcointalk.org/index.php?topic=289795.msg3183975#msg3183975).
 *
 * secp256k1 belongs to Koblitz curves: it has efficiently computable endomorphism.
 * Endomorphism uses 2x less RAM, speeds up precomputation by 2x and ECDH / key recovery by 20%.
 * For precomputed wNAF it trades off 1/2 init time & 1/3 ram for 20% perf hit.
 * [See explanation](https://gist.github.com/paulmillr/eb670806793e84df628a7c434a873066).
 * @module
 */
/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
const sha256_1 = __nccwpck_require__(8068);
const utils_1 = __nccwpck_require__(9342);
const _shortw_utils_js_1 = __nccwpck_require__(7512);
const hash_to_curve_js_1 = __nccwpck_require__(9287);
const modular_js_1 = __nccwpck_require__(5705);
const utils_js_1 = __nccwpck_require__(7442);
const weierstrass_js_1 = __nccwpck_require__(7859);
const secp256k1P = BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f');
const secp256k1N = BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141');
const _1n = BigInt(1);
const _2n = BigInt(2);
const divNearest = (a, b) => (a + b / _2n) / b;
/**
 * √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
 * (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
 */
function sqrtMod(y) {
    const P = secp256k1P;
    // prettier-ignore
    const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    // prettier-ignore
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = (y * y * y) % P; // x^3, 11
    const b3 = (b2 * b2 * y) % P; // x^7
    const b6 = ((0, modular_js_1.pow2)(b3, _3n, P) * b3) % P;
    const b9 = ((0, modular_js_1.pow2)(b6, _3n, P) * b3) % P;
    const b11 = ((0, modular_js_1.pow2)(b9, _2n, P) * b2) % P;
    const b22 = ((0, modular_js_1.pow2)(b11, _11n, P) * b11) % P;
    const b44 = ((0, modular_js_1.pow2)(b22, _22n, P) * b22) % P;
    const b88 = ((0, modular_js_1.pow2)(b44, _44n, P) * b44) % P;
    const b176 = ((0, modular_js_1.pow2)(b88, _88n, P) * b88) % P;
    const b220 = ((0, modular_js_1.pow2)(b176, _44n, P) * b44) % P;
    const b223 = ((0, modular_js_1.pow2)(b220, _3n, P) * b3) % P;
    const t1 = ((0, modular_js_1.pow2)(b223, _23n, P) * b22) % P;
    const t2 = ((0, modular_js_1.pow2)(t1, _6n, P) * b2) % P;
    const root = (0, modular_js_1.pow2)(t2, _2n, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y))
        throw new Error('Cannot find square root');
    return root;
}
const Fpk1 = (0, modular_js_1.Field)(secp256k1P, undefined, undefined, { sqrt: sqrtMod });
/**
 * secp256k1 short weierstrass curve and ECDSA signatures over it.
 *
 * @example
 * import { secp256k1 } from '@noble/curves/secp256k1';
 *
 * const priv = secp256k1.utils.randomPrivateKey();
 * const pub = secp256k1.getPublicKey(priv);
 * const msg = new Uint8Array(32).fill(1); // message hash (not message) in ecdsa
 * const sig = secp256k1.sign(msg, priv); // `{prehash: true}` option is available
 * const isValid = secp256k1.verify(sig, msg, pub) === true;
 */
exports.secp256k1 = (0, _shortw_utils_js_1.createCurve)({
    a: BigInt(0), // equation params: a, b
    b: BigInt(7),
    Fp: Fpk1, // Field's prime: 2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n
    n: secp256k1N, // Curve order, total count of valid points in the field
    // Base point (x, y) aka generator point
    Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
    Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
    h: BigInt(1), // Cofactor
    lowS: true, // Allow only low-S signatures by default in sign() and verify()
    endo: {
        // Endomorphism, see above
        beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
        splitScalar: (k) => {
            const n = secp256k1N;
            const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
            const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
            const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
            const b2 = a1;
            const POW_2_128 = BigInt('0x100000000000000000000000000000000'); // (2n**128n).toString(16)
            const c1 = divNearest(b2 * k, n);
            const c2 = divNearest(-b1 * k, n);
            let k1 = (0, modular_js_1.mod)(k - c1 * a1 - c2 * a2, n);
            let k2 = (0, modular_js_1.mod)(-c1 * b1 - c2 * b2, n);
            const k1neg = k1 > POW_2_128;
            const k2neg = k2 > POW_2_128;
            if (k1neg)
                k1 = n - k1;
            if (k2neg)
                k2 = n - k2;
            if (k1 > POW_2_128 || k2 > POW_2_128) {
                throw new Error('splitScalar: Endomorphism failed, k=' + k);
            }
            return { k1neg, k1, k2neg, k2 };
        },
    },
}, sha256_1.sha256);
// Schnorr signatures are superior to ECDSA from above. Below is Schnorr-specific BIP0340 code.
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
const _0n = BigInt(0);
/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
const TAGGED_HASH_PREFIXES = {};
function taggedHash(tag, ...messages) {
    let tagP = TAGGED_HASH_PREFIXES[tag];
    if (tagP === undefined) {
        const tagH = (0, sha256_1.sha256)(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
        tagP = (0, utils_js_1.concatBytes)(tagH, tagH);
        TAGGED_HASH_PREFIXES[tag] = tagP;
    }
    return (0, sha256_1.sha256)((0, utils_js_1.concatBytes)(tagP, ...messages));
}
// ECDSA compact points are 33-byte. Schnorr is 32: we strip first byte 0x02 or 0x03
const pointToBytes = (point) => point.toRawBytes(true).slice(1);
const numTo32b = (n) => (0, utils_js_1.numberToBytesBE)(n, 32);
const modP = (x) => (0, modular_js_1.mod)(x, secp256k1P);
const modN = (x) => (0, modular_js_1.mod)(x, secp256k1N);
const Point = exports.secp256k1.ProjectivePoint;
const GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b);
// Calculate point, scalar and bytes
function schnorrGetExtPubKey(priv) {
    let d_ = exports.secp256k1.utils.normPrivateKeyToScalar(priv); // same method executed in fromPrivateKey
    let p = Point.fromPrivateKey(d_); // P = d'⋅G; 0 < d' < n check is done inside
    const scalar = p.hasEvenY() ? d_ : modN(-d_);
    return { scalar: scalar, bytes: pointToBytes(p) };
}
/**
 * lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
 * @returns valid point checked for being on-curve
 */
function lift_x(x) {
    (0, utils_js_1.aInRange)('x', x, _1n, secp256k1P); // Fail if x ≥ p.
    const xx = modP(x * x);
    const c = modP(xx * x + BigInt(7)); // Let c = x³ + 7 mod p.
    let y = sqrtMod(c); // Let y = c^(p+1)/4 mod p.
    if (y % _2n !== _0n)
        y = modP(-y); // Return the unique point P such that x(P) = x and
    const p = new Point(x, y, _1n); // y(P) = y if y mod 2 = 0 or y(P) = p-y otherwise.
    p.assertValidity();
    return p;
}
const num = utils_js_1.bytesToNumberBE;
/**
 * Create tagged hash, convert it to bigint, reduce modulo-n.
 */
function challenge(...args) {
    return modN(num(taggedHash('BIP0340/challenge', ...args)));
}
/**
 * Schnorr public key is just `x` coordinate of Point as per BIP340.
 */
function schnorrGetPublicKey(privateKey) {
    return schnorrGetExtPubKey(privateKey).bytes; // d'=int(sk). Fail if d'=0 or d'≥n. Ret bytes(d'⋅G)
}
/**
 * Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
 * auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
 */
function schnorrSign(message, privateKey, auxRand = (0, utils_1.randomBytes)(32)) {
    const m = (0, utils_js_1.ensureBytes)('message', message);
    const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey); // checks for isWithinCurveOrder
    const a = (0, utils_js_1.ensureBytes)('auxRand', auxRand, 32); // Auxiliary random data a: a 32-byte array
    const t = numTo32b(d ^ num(taggedHash('BIP0340/aux', a))); // Let t be the byte-wise xor of bytes(d) and hash/aux(a)
    const rand = taggedHash('BIP0340/nonce', t, px, m); // Let rand = hash/nonce(t || bytes(P) || m)
    const k_ = modN(num(rand)); // Let k' = int(rand) mod n
    if (k_ === _0n)
        throw new Error('sign failed: k is zero'); // Fail if k' = 0.
    const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_); // Let R = k'⋅G.
    const e = challenge(rx, px, m); // Let e = int(hash/challenge(bytes(R) || bytes(P) || m)) mod n.
    const sig = new Uint8Array(64); // Let sig = bytes(R) || bytes((k + ed) mod n).
    sig.set(rx, 0);
    sig.set(numTo32b(modN(k + e * d)), 32);
    // If Verify(bytes(P), m, sig) (see below) returns failure, abort
    if (!schnorrVerify(sig, m, px))
        throw new Error('sign: Invalid signature produced');
    return sig;
}
/**
 * Verifies Schnorr signature.
 * Will swallow errors & return false except for initial type validation of arguments.
 */
function schnorrVerify(signature, message, publicKey) {
    const sig = (0, utils_js_1.ensureBytes)('signature', signature, 64);
    const m = (0, utils_js_1.ensureBytes)('message', message);
    const pub = (0, utils_js_1.ensureBytes)('publicKey', publicKey, 32);
    try {
        const P = lift_x(num(pub)); // P = lift_x(int(pk)); fail if that fails
        const r = num(sig.subarray(0, 32)); // Let r = int(sig[0:32]); fail if r ≥ p.
        if (!(0, utils_js_1.inRange)(r, _1n, secp256k1P))
            return false;
        const s = num(sig.subarray(32, 64)); // Let s = int(sig[32:64]); fail if s ≥ n.
        if (!(0, utils_js_1.inRange)(s, _1n, secp256k1N))
            return false;
        const e = challenge(numTo32b(r), pointToBytes(P), m); // int(challenge(bytes(r)||bytes(P)||m))%n
        const R = GmulAdd(P, s, modN(-e)); // R = s⋅G - e⋅P
        if (!R || !R.hasEvenY() || R.toAffine().x !== r)
            return false; // -eP == (n-e)P
        return true; // Fail if is_infinite(R) / not has_even_y(R) / x(R) ≠ r.
    }
    catch (error) {
        return false;
    }
}
/**
 * Schnorr signatures over secp256k1.
 * https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
 * @example
 * import { schnorr } from '@noble/curves/secp256k1';
 * const priv = schnorr.utils.randomPrivateKey();
 * const pub = schnorr.getPublicKey(priv);
 * const msg = new TextEncoder().encode('hello');
 * const sig = schnorr.sign(msg, priv);
 * const isValid = schnorr.verify(sig, msg, pub);
 */
exports.schnorr = (() => ({
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    utils: {
        randomPrivateKey: exports.secp256k1.utils.randomPrivateKey,
        lift_x,
        pointToBytes,
        numberToBytesBE: utils_js_1.numberToBytesBE,
        bytesToNumberBE: utils_js_1.bytesToNumberBE,
        taggedHash,
        mod: modular_js_1.mod,
    },
}))();
const isoMap = /* @__PURE__ */ (() => (0, hash_to_curve_js_1.isogenyMap)(Fpk1, [
    // xNum
    [
        '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7',
        '0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581',
        '0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262',
        '0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c',
    ],
    // xDen
    [
        '0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b',
        '0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14',
        '0x0000000000000000000000000000000000000000000000000000000000000001', // LAST 1
    ],
    // yNum
    [
        '0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c',
        '0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3',
        '0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931',
        '0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84',
    ],
    // yDen
    [
        '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b',
        '0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573',
        '0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f',
        '0x0000000000000000000000000000000000000000000000000000000000000001', // LAST 1
    ],
].map((i) => i.map((j) => BigInt(j)))))();
const mapSWU = /* @__PURE__ */ (() => (0, weierstrass_js_1.mapToCurveSimpleSWU)(Fpk1, {
    A: BigInt('0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533'),
    B: BigInt('1771'),
    Z: Fpk1.create(BigInt('-11')),
}))();
const htf = /* @__PURE__ */ (() => (0, hash_to_curve_js_1.createHasher)(exports.secp256k1.ProjectivePoint, (scalars) => {
    const { x, y } = mapSWU(Fpk1.create(scalars[0]));
    return isoMap(x, y);
}, {
    DST: 'secp256k1_XMD:SHA-256_SSWU_RO_',
    encodeDST: 'secp256k1_XMD:SHA-256_SSWU_NU_',
    p: Fpk1.ORDER,
    m: 1,
    k: 128,
    expand: 'xmd',
    hash: sha256_1.sha256,
}))();
/** secp256k1 hash-to-curve from [RFC 9380](https://www.rfc-editor.org/rfc/rfc9380). */
exports.hashToCurve = (() => htf.hashToCurve)();
/** secp256k1 encode-to-curve from [RFC 9380](https://www.rfc-editor.org/rfc/rfc9380). */
exports.encodeToCurve = (() => htf.encodeToCurve)();
//# sourceMappingURL=secp256k1.js.map

/***/ }),

/***/ 4536:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Internal assertion helpers.
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.anumber = anumber;
exports.abytes = abytes;
exports.ahash = ahash;
exports.aexists = aexists;
exports.aoutput = aoutput;
/** Asserts something is positive integer. */
function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
        throw new Error('positive integer expected, got ' + n);
}
/** Is number an Uint8Array? Copied from utils for perf. */
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
/** Asserts something is Uint8Array. */
function abytes(b, ...lengths) {
    if (!isBytes(b))
        throw new Error('Uint8Array expected');
    if (lengths.length > 0 && !lengths.includes(b.length))
        throw new Error('Uint8Array expected of length ' + lengths + ', got length=' + b.length);
}
/** Asserts something is hash */
function ahash(h) {
    if (typeof h !== 'function' || typeof h.create !== 'function')
        throw new Error('Hash should be wrapped by utils.wrapConstructor');
    anumber(h.outputLen);
    anumber(h.blockLen);
}
/** Asserts a hash instance has not been destroyed / finished */
function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
        throw new Error('Hash instance has been destroyed');
    if (checkFinished && instance.finished)
        throw new Error('Hash#digest() has already been called');
}
/** Asserts output is properly-sized byte array */
function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error('digestInto() expects output buffer of length at least ' + min);
    }
}
//# sourceMappingURL=_assert.js.map

/***/ }),

/***/ 3059:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HashMD = void 0;
exports.setBigUint64 = setBigUint64;
exports.Chi = Chi;
exports.Maj = Maj;
/**
 * Internal Merkle-Damgard hash utils.
 * @module
 */
const _assert_js_1 = __nccwpck_require__(4536);
const utils_js_1 = __nccwpck_require__(9342);
/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === 'function')
        return view.setBigUint64(byteOffset, value, isLE);
    const _32n = BigInt(32);
    const _u32_max = BigInt(0xffffffff);
    const wh = Number((value >> _32n) & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
}
/** Choice: a ? b : c */
function Chi(a, b, c) {
    return (a & b) ^ (~a & c);
}
/** Majority function, true if any two inputs is true. */
function Maj(a, b, c) {
    return (a & b) ^ (a & c) ^ (b & c);
}
/**
 * Merkle-Damgard hash construction base class.
 * Could be used to create MD5, RIPEMD, SHA1, SHA2.
 */
class HashMD extends utils_js_1.Hash {
    constructor(blockLen, outputLen, padOffset, isLE) {
        super();
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.buffer = new Uint8Array(blockLen);
        this.view = (0, utils_js_1.createView)(this.buffer);
    }
    update(data) {
        (0, _assert_js_1.aexists)(this);
        const { view, buffer, blockLen } = this;
        data = (0, utils_js_1.toBytes)(data);
        const len = data.length;
        for (let pos = 0; pos < len;) {
            const take = Math.min(blockLen - this.pos, len - pos);
            // Fast path: we have at least one block in input, cast it to view and process
            if (take === blockLen) {
                const dataView = (0, utils_js_1.createView)(data);
                for (; blockLen <= len - pos; pos += blockLen)
                    this.process(dataView, pos);
                continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
                this.process(view, 0);
                this.pos = 0;
            }
        }
        this.length += data.length;
        this.roundClean();
        return this;
    }
    digestInto(out) {
        (0, _assert_js_1.aexists)(this);
        (0, _assert_js_1.aoutput)(out, this);
        this.finished = true;
        // Padding
        // We can avoid allocation of buffer for padding completely if it
        // was previously not allocated here. But it won't change performance.
        const { buffer, view, blockLen, isLE } = this;
        let { pos } = this;
        // append the bit '1' to the message
        buffer[pos++] = 0b10000000;
        this.buffer.subarray(pos).fill(0);
        // we have less than padOffset left in buffer, so we cannot put length in
        // current block, need process it and pad again
        if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
        }
        // Pad until full block byte with zeros
        for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
        // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
        // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
        // So we just write lowest 64 bits of that value.
        setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
        this.process(view, 0);
        const oview = (0, utils_js_1.createView)(out);
        const len = this.outputLen;
        // NOTE: we do division by 4 later, which should be fused in single op with modulo by JIT
        if (len % 4)
            throw new Error('_sha2: outputLen should be aligned to 32bit');
        const outLen = len / 4;
        const state = this.get();
        if (outLen > state.length)
            throw new Error('_sha2: outputLen bigger than state');
        for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE);
    }
    digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
    }
    _cloneInto(to) {
        to || (to = new this.constructor());
        to.set(...this.get());
        const { blockLen, buffer, length, finished, destroyed, pos } = this;
        to.length = length;
        to.pos = pos;
        to.finished = finished;
        to.destroyed = destroyed;
        if (length % blockLen)
            to.buffer.set(buffer);
        return to;
    }
}
exports.HashMD = HashMD;
//# sourceMappingURL=_md.js.map

/***/ }),

/***/ 9405:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.add5L = exports.add5H = exports.add4H = exports.add4L = exports.add3H = exports.add3L = exports.rotlBL = exports.rotlBH = exports.rotlSL = exports.rotlSH = exports.rotr32L = exports.rotr32H = exports.rotrBL = exports.rotrBH = exports.rotrSL = exports.rotrSH = exports.shrSL = exports.shrSH = exports.toBig = void 0;
exports.fromBig = fromBig;
exports.split = split;
exports.add = add;
/**
 * Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
 * @todo re-check https://issues.chromium.org/issues/42212588
 * @module
 */
const U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
const _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
    if (le)
        return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) };
    return { h: Number((n >> _32n) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
    let Ah = new Uint32Array(lst.length);
    let Al = new Uint32Array(lst.length);
    for (let i = 0; i < lst.length; i++) {
        const { h, l } = fromBig(lst[i], le);
        [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
}
const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0);
exports.toBig = toBig;
// for Shift in [0, 32)
const shrSH = (h, _l, s) => h >>> s;
exports.shrSH = shrSH;
const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
exports.shrSL = shrSL;
// Right rotate for Shift in [1, 32)
const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
exports.rotrSH = rotrSH;
const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
exports.rotrSL = rotrSL;
// Right rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
exports.rotrBH = rotrBH;
const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
exports.rotrBL = rotrBL;
// Right rotate for shift===32 (just swaps l&h)
const rotr32H = (_h, l) => l;
exports.rotr32H = rotr32H;
const rotr32L = (h, _l) => h;
exports.rotr32L = rotr32L;
// Left rotate for Shift in [1, 32)
const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
exports.rotlSH = rotlSH;
const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
exports.rotlSL = rotlSL;
// Left rotate for Shift in (32, 64), NOTE: 32 is special case.
const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
exports.rotlBH = rotlBH;
const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
exports.rotlBL = rotlBL;
// JS uses 32-bit signed integers for bitwise operations which means we cannot
// simple take carry out of low bit sum by shift, we need to use division.
function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
}
// Addition with more than 2 elements
const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
exports.add3L = add3L;
const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
exports.add3H = add3H;
const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
exports.add4L = add4L;
const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
exports.add4H = add4H;
const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
exports.add5L = add5L;
const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;
exports.add5H = add5H;
// prettier-ignore
const u64 = {
    fromBig, split, toBig,
    shrSH, shrSL,
    rotrSH, rotrSL, rotrBH, rotrBL,
    rotr32H, rotr32L,
    rotlSH, rotlSL, rotlBH, rotlBL,
    add, add3L, add3H, add4L, add4H, add5H, add5L,
};
exports["default"] = u64;
//# sourceMappingURL=_u64.js.map

/***/ }),

/***/ 5714:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.crypto = void 0;
/**
 * Internal webcrypto alias.
 * We prefer WebCrypto aka globalThis.crypto, which exists in node.js 16+.
 * Falls back to Node.js built-in crypto for Node.js <=v14.
 * See utils.ts for details.
 * @module
 */
// @ts-ignore
const nc = __nccwpck_require__(7598);
exports.crypto = nc && typeof nc === 'object' && 'webcrypto' in nc
    ? nc.webcrypto
    : nc && typeof nc === 'object' && 'randomBytes' in nc
        ? nc
        : undefined;
//# sourceMappingURL=cryptoNode.js.map

/***/ }),

/***/ 8104:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hkdf = void 0;
exports.extract = extract;
exports.expand = expand;
/**
 * HKDF (RFC 5869): extract + expand in one step.
 * See https://soatok.blog/2021/11/17/understanding-hkdf/.
 * @module
 */
const _assert_js_1 = __nccwpck_require__(4536);
const hmac_js_1 = __nccwpck_require__(8024);
const utils_js_1 = __nccwpck_require__(9342);
/**
 * HKDF-extract from spec. Less important part. `HKDF-Extract(IKM, salt) -> PRK`
 * Arguments position differs from spec (IKM is first one, since it is not optional)
 * @param hash - hash function that would be used (e.g. sha256)
 * @param ikm - input keying material, the initial key
 * @param salt - optional salt value (a non-secret random value)
 */
function extract(hash, ikm, salt) {
    (0, _assert_js_1.ahash)(hash);
    // NOTE: some libraries treat zero-length array as 'not provided';
    // we don't, since we have undefined as 'not provided'
    // https://github.com/RustCrypto/KDFs/issues/15
    if (salt === undefined)
        salt = new Uint8Array(hash.outputLen);
    return (0, hmac_js_1.hmac)(hash, (0, utils_js_1.toBytes)(salt), (0, utils_js_1.toBytes)(ikm));
}
const HKDF_COUNTER = /* @__PURE__ */ new Uint8Array([0]);
const EMPTY_BUFFER = /* @__PURE__ */ new Uint8Array();
/**
 * HKDF-expand from the spec. The most important part. `HKDF-Expand(PRK, info, L) -> OKM`
 * @param hash - hash function that would be used (e.g. sha256)
 * @param prk - a pseudorandom key of at least HashLen octets (usually, the output from the extract step)
 * @param info - optional context and application specific information (can be a zero-length string)
 * @param length - length of output keying material in bytes
 */
function expand(hash, prk, info, length = 32) {
    (0, _assert_js_1.ahash)(hash);
    (0, _assert_js_1.anumber)(length);
    if (length > 255 * hash.outputLen)
        throw new Error('Length should be <= 255*HashLen');
    const blocks = Math.ceil(length / hash.outputLen);
    if (info === undefined)
        info = EMPTY_BUFFER;
    // first L(ength) octets of T
    const okm = new Uint8Array(blocks * hash.outputLen);
    // Re-use HMAC instance between blocks
    const HMAC = hmac_js_1.hmac.create(hash, prk);
    const HMACTmp = HMAC._cloneInto();
    const T = new Uint8Array(HMAC.outputLen);
    for (let counter = 0; counter < blocks; counter++) {
        HKDF_COUNTER[0] = counter + 1;
        // T(0) = empty string (zero length)
        // T(N) = HMAC-Hash(PRK, T(N-1) | info | N)
        HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T)
            .update(info)
            .update(HKDF_COUNTER)
            .digestInto(T);
        okm.set(T, hash.outputLen * counter);
        HMAC._cloneInto(HMACTmp);
    }
    HMAC.destroy();
    HMACTmp.destroy();
    T.fill(0);
    HKDF_COUNTER.fill(0);
    return okm.slice(0, length);
}
/**
 * HKDF (RFC 5869): derive keys from an initial input.
 * Combines hkdf_extract + hkdf_expand in one step
 * @param hash - hash function that would be used (e.g. sha256)
 * @param ikm - input keying material, the initial key
 * @param salt - optional salt value (a non-secret random value)
 * @param info - optional context and application specific information (can be a zero-length string)
 * @param length - length of output keying material in bytes
 * @example
 * import { hkdf } from '@noble/hashes/hkdf';
 * import { sha256 } from '@noble/hashes/sha2';
 * import { randomBytes } from '@noble/hashes/utils';
 * const inputKey = randomBytes(32);
 * const salt = randomBytes(32);
 * const info = 'application-key';
 * const hk1 = hkdf(sha256, inputKey, salt, info, 32);
 */
const hkdf = (hash, ikm, salt, info, length) => expand(hash, extract(hash, ikm, salt), info, length);
exports.hkdf = hkdf;
//# sourceMappingURL=hkdf.js.map

/***/ }),

/***/ 8024:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hmac = exports.HMAC = void 0;
/**
 * HMAC: RFC2104 message authentication code.
 * @module
 */
const _assert_js_1 = __nccwpck_require__(4536);
const utils_js_1 = __nccwpck_require__(9342);
class HMAC extends utils_js_1.Hash {
    constructor(hash, _key) {
        super();
        this.finished = false;
        this.destroyed = false;
        (0, _assert_js_1.ahash)(hash);
        const key = (0, utils_js_1.toBytes)(_key);
        this.iHash = hash.create();
        if (typeof this.iHash.update !== 'function')
            throw new Error('Expected instance of class which extends utils.Hash');
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        // blockLen can be bigger than outputLen
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++)
            pad[i] ^= 0x36;
        this.iHash.update(pad);
        // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
        this.oHash = hash.create();
        // Undo internal XOR && apply outer XOR
        for (let i = 0; i < pad.length; i++)
            pad[i] ^= 0x36 ^ 0x5c;
        this.oHash.update(pad);
        pad.fill(0);
    }
    update(buf) {
        (0, _assert_js_1.aexists)(this);
        this.iHash.update(buf);
        return this;
    }
    digestInto(out) {
        (0, _assert_js_1.aexists)(this);
        (0, _assert_js_1.abytes)(out, this.outputLen);
        this.finished = true;
        this.iHash.digestInto(out);
        this.oHash.update(out);
        this.oHash.digestInto(out);
        this.destroy();
    }
    digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
    }
    _cloneInto(to) {
        // Create new instance without calling constructor since key already in state and we don't know it.
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
    }
    destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
    }
}
exports.HMAC = HMAC;
/**
 * HMAC: RFC2104 message authentication code.
 * @param hash - function that would be used e.g. sha256
 * @param key - message key
 * @param message - message data
 * @example
 * import { hmac } from '@noble/hashes/hmac';
 * import { sha256 } from '@noble/hashes/sha2';
 * const mac1 = hmac(sha256, 'key', 'message');
 */
const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
exports.hmac = hmac;
exports.hmac.create = (hash, key) => new HMAC(hash, key);
//# sourceMappingURL=hmac.js.map

/***/ }),

/***/ 8068:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sha224 = exports.sha256 = exports.SHA256 = void 0;
/**
 * SHA2-256 a.k.a. sha256. In JS, it is the fastest hash, even faster than Blake3.
 *
 * To break sha256 using birthday attack, attackers need to try 2^128 hashes.
 * BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
 *
 * Check out [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
 * @module
 */
const _md_js_1 = __nccwpck_require__(3059);
const utils_js_1 = __nccwpck_require__(9342);
/** Round constants: first 32 bits of fractional parts of the cube roots of the first 64 primes 2..311). */
// prettier-ignore
const SHA256_K = /* @__PURE__ */ new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
/** Initial state: first 32 bits of fractional parts of the square roots of the first 8 primes 2..19. */
// prettier-ignore
const SHA256_IV = /* @__PURE__ */ new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);
/**
 * Temporary buffer, not used to store anything between runs.
 * Named this way because it matches specification.
 */
const SHA256_W = /* @__PURE__ */ new Uint32Array(64);
class SHA256 extends _md_js_1.HashMD {
    constructor() {
        super(64, 32, 8, false);
        // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        this.A = SHA256_IV[0] | 0;
        this.B = SHA256_IV[1] | 0;
        this.C = SHA256_IV[2] | 0;
        this.D = SHA256_IV[3] | 0;
        this.E = SHA256_IV[4] | 0;
        this.F = SHA256_IV[5] | 0;
        this.G = SHA256_IV[6] | 0;
        this.H = SHA256_IV[7] | 0;
    }
    get() {
        const { A, B, C, D, E, F, G, H } = this;
        return [A, B, C, D, E, F, G, H];
    }
    // prettier-ignore
    set(A, B, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
        for (let i = 0; i < 16; i++, offset += 4)
            SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = (0, utils_js_1.rotr)(W15, 7) ^ (0, utils_js_1.rotr)(W15, 18) ^ (W15 >>> 3);
            const s1 = (0, utils_js_1.rotr)(W2, 17) ^ (0, utils_js_1.rotr)(W2, 19) ^ (W2 >>> 10);
            SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0;
        }
        // Compression function main loop, 64 rounds
        let { A, B, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
            const sigma1 = (0, utils_js_1.rotr)(E, 6) ^ (0, utils_js_1.rotr)(E, 11) ^ (0, utils_js_1.rotr)(E, 25);
            const T1 = (H + sigma1 + (0, _md_js_1.Chi)(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const sigma0 = (0, utils_js_1.rotr)(A, 2) ^ (0, utils_js_1.rotr)(A, 13) ^ (0, utils_js_1.rotr)(A, 22);
            const T2 = (sigma0 + (0, _md_js_1.Maj)(A, B, C)) | 0;
            H = G;
            G = F;
            F = E;
            E = (D + T1) | 0;
            D = C;
            C = B;
            B = A;
            A = (T1 + T2) | 0;
        }
        // Add the compressed chunk to the current hash value
        A = (A + this.A) | 0;
        B = (B + this.B) | 0;
        C = (C + this.C) | 0;
        D = (D + this.D) | 0;
        E = (E + this.E) | 0;
        F = (F + this.F) | 0;
        G = (G + this.G) | 0;
        H = (H + this.H) | 0;
        this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
        SHA256_W.fill(0);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        this.buffer.fill(0);
    }
}
exports.SHA256 = SHA256;
/**
 * Constants taken from https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf.
 */
class SHA224 extends SHA256 {
    constructor() {
        super();
        this.A = 0xc1059ed8 | 0;
        this.B = 0x367cd507 | 0;
        this.C = 0x3070dd17 | 0;
        this.D = 0xf70e5939 | 0;
        this.E = 0xffc00b31 | 0;
        this.F = 0x68581511 | 0;
        this.G = 0x64f98fa7 | 0;
        this.H = 0xbefa4fa4 | 0;
        this.outputLen = 28;
    }
}
/** SHA2-256 hash function */
exports.sha256 = (0, utils_js_1.wrapConstructor)(() => new SHA256());
/** SHA2-224 hash function */
exports.sha224 = (0, utils_js_1.wrapConstructor)(() => new SHA224());
//# sourceMappingURL=sha256.js.map

/***/ }),

/***/ 3345:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sha384 = exports.sha512_256 = exports.sha512_224 = exports.sha512 = exports.SHA384 = exports.SHA512_256 = exports.SHA512_224 = exports.SHA512 = void 0;
/**
 * SHA2-512 a.k.a. sha512 and sha384. It is slower than sha256 in js because u64 operations are slow.
 *
 * Check out [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and
 * [the paper on truncated SHA512/256](https://eprint.iacr.org/2010/548.pdf).
 * @module
 */
const _md_js_1 = __nccwpck_require__(3059);
const _u64_js_1 = __nccwpck_require__(9405);
const utils_js_1 = __nccwpck_require__(9342);
// Round contants (first 32 bits of the fractional parts of the cube roots of the first 80 primes 2..409):
// prettier-ignore
const [SHA512_Kh, SHA512_Kl] = /* @__PURE__ */ (() => _u64_js_1.default.split([
    '0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc',
    '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118',
    '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2',
    '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694',
    '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65',
    '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5',
    '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4',
    '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70',
    '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df',
    '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b',
    '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30',
    '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8',
    '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8',
    '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3',
    '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec',
    '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b',
    '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178',
    '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b',
    '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c',
    '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'
].map(n => BigInt(n))))();
// Temporary buffer, not used to store anything between runs
const SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
const SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
class SHA512 extends _md_js_1.HashMD {
    constructor() {
        super(128, 64, 16, false);
        // We cannot use array here since array allows indexing by variable which means optimizer/compiler cannot use registers.
        // Also looks cleaner and easier to verify with spec.
        // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = 0x6a09e667 | 0;
        this.Al = 0xf3bcc908 | 0;
        this.Bh = 0xbb67ae85 | 0;
        this.Bl = 0x84caa73b | 0;
        this.Ch = 0x3c6ef372 | 0;
        this.Cl = 0xfe94f82b | 0;
        this.Dh = 0xa54ff53a | 0;
        this.Dl = 0x5f1d36f1 | 0;
        this.Eh = 0x510e527f | 0;
        this.El = 0xade682d1 | 0;
        this.Fh = 0x9b05688c | 0;
        this.Fl = 0x2b3e6c1f | 0;
        this.Gh = 0x1f83d9ab | 0;
        this.Gl = 0xfb41bd6b | 0;
        this.Hh = 0x5be0cd19 | 0;
        this.Hl = 0x137e2179 | 0;
    }
    // prettier-ignore
    get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
    }
    // prettier-ignore
    set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
    }
    process(view, offset) {
        // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
        for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32((offset += 4));
        }
        for (let i = 16; i < 80; i++) {
            // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = _u64_js_1.default.rotrSH(W15h, W15l, 1) ^ _u64_js_1.default.rotrSH(W15h, W15l, 8) ^ _u64_js_1.default.shrSH(W15h, W15l, 7);
            const s0l = _u64_js_1.default.rotrSL(W15h, W15l, 1) ^ _u64_js_1.default.rotrSL(W15h, W15l, 8) ^ _u64_js_1.default.shrSL(W15h, W15l, 7);
            // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = _u64_js_1.default.rotrSH(W2h, W2l, 19) ^ _u64_js_1.default.rotrBH(W2h, W2l, 61) ^ _u64_js_1.default.shrSH(W2h, W2l, 6);
            const s1l = _u64_js_1.default.rotrSL(W2h, W2l, 19) ^ _u64_js_1.default.rotrBL(W2h, W2l, 61) ^ _u64_js_1.default.shrSL(W2h, W2l, 6);
            // SHA256_W[i] = s0 + s1 + SHA256_W[i - 7] + SHA256_W[i - 16];
            const SUMl = _u64_js_1.default.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = _u64_js_1.default.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        // Compression function main loop, 80 rounds
        for (let i = 0; i < 80; i++) {
            // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
            const sigma1h = _u64_js_1.default.rotrSH(Eh, El, 14) ^ _u64_js_1.default.rotrSH(Eh, El, 18) ^ _u64_js_1.default.rotrBH(Eh, El, 41);
            const sigma1l = _u64_js_1.default.rotrSL(Eh, El, 14) ^ _u64_js_1.default.rotrSL(Eh, El, 18) ^ _u64_js_1.default.rotrBL(Eh, El, 41);
            //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
            const CHIh = (Eh & Fh) ^ (~Eh & Gh);
            const CHIl = (El & Fl) ^ (~El & Gl);
            // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
            // prettier-ignore
            const T1ll = _u64_js_1.default.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = _u64_js_1.default.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
            const sigma0h = _u64_js_1.default.rotrSH(Ah, Al, 28) ^ _u64_js_1.default.rotrBH(Ah, Al, 34) ^ _u64_js_1.default.rotrBH(Ah, Al, 39);
            const sigma0l = _u64_js_1.default.rotrSL(Ah, Al, 28) ^ _u64_js_1.default.rotrBL(Ah, Al, 34) ^ _u64_js_1.default.rotrBL(Ah, Al, 39);
            const MAJh = (Ah & Bh) ^ (Ah & Ch) ^ (Bh & Ch);
            const MAJl = (Al & Bl) ^ (Al & Cl) ^ (Bl & Cl);
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = _u64_js_1.default.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = _u64_js_1.default.add3L(T1l, sigma0l, MAJl);
            Ah = _u64_js_1.default.add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
        }
        // Add the compressed chunk to the current hash value
        ({ h: Ah, l: Al } = _u64_js_1.default.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = _u64_js_1.default.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = _u64_js_1.default.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = _u64_js_1.default.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = _u64_js_1.default.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = _u64_js_1.default.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = _u64_js_1.default.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = _u64_js_1.default.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
    }
    roundClean() {
        SHA512_W_H.fill(0);
        SHA512_W_L.fill(0);
    }
    destroy() {
        this.buffer.fill(0);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
}
exports.SHA512 = SHA512;
class SHA512_224 extends SHA512 {
    constructor() {
        super();
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = 0x8c3d37c8 | 0;
        this.Al = 0x19544da2 | 0;
        this.Bh = 0x73e19966 | 0;
        this.Bl = 0x89dcd4d6 | 0;
        this.Ch = 0x1dfab7ae | 0;
        this.Cl = 0x32ff9c82 | 0;
        this.Dh = 0x679dd514 | 0;
        this.Dl = 0x582f9fcf | 0;
        this.Eh = 0x0f6d2b69 | 0;
        this.El = 0x7bd44da8 | 0;
        this.Fh = 0x77e36f73 | 0;
        this.Fl = 0x04c48942 | 0;
        this.Gh = 0x3f9d85a8 | 0;
        this.Gl = 0x6a1d36c8 | 0;
        this.Hh = 0x1112e6ad | 0;
        this.Hl = 0x91d692a1 | 0;
        this.outputLen = 28;
    }
}
exports.SHA512_224 = SHA512_224;
class SHA512_256 extends SHA512 {
    constructor() {
        super();
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = 0x22312194 | 0;
        this.Al = 0xfc2bf72c | 0;
        this.Bh = 0x9f555fa3 | 0;
        this.Bl = 0xc84c64c2 | 0;
        this.Ch = 0x2393b86b | 0;
        this.Cl = 0x6f53b151 | 0;
        this.Dh = 0x96387719 | 0;
        this.Dl = 0x5940eabd | 0;
        this.Eh = 0x96283ee2 | 0;
        this.El = 0xa88effe3 | 0;
        this.Fh = 0xbe5e1e25 | 0;
        this.Fl = 0x53863992 | 0;
        this.Gh = 0x2b0199fc | 0;
        this.Gl = 0x2c85b8aa | 0;
        this.Hh = 0x0eb72ddc | 0;
        this.Hl = 0x81c52ca2 | 0;
        this.outputLen = 32;
    }
}
exports.SHA512_256 = SHA512_256;
class SHA384 extends SHA512 {
    constructor() {
        super();
        // h -- high 32 bits, l -- low 32 bits
        this.Ah = 0xcbbb9d5d | 0;
        this.Al = 0xc1059ed8 | 0;
        this.Bh = 0x629a292a | 0;
        this.Bl = 0x367cd507 | 0;
        this.Ch = 0x9159015a | 0;
        this.Cl = 0x3070dd17 | 0;
        this.Dh = 0x152fecd8 | 0;
        this.Dl = 0xf70e5939 | 0;
        this.Eh = 0x67332667 | 0;
        this.El = 0xffc00b31 | 0;
        this.Fh = 0x8eb44a87 | 0;
        this.Fl = 0x68581511 | 0;
        this.Gh = 0xdb0c2e0d | 0;
        this.Gl = 0x64f98fa7 | 0;
        this.Hh = 0x47b5481d | 0;
        this.Hl = 0xbefa4fa4 | 0;
        this.outputLen = 48;
    }
}
exports.SHA384 = SHA384;
/** SHA2-512 hash function. */
exports.sha512 = (0, utils_js_1.wrapConstructor)(() => new SHA512());
/** SHA2-512/224 "truncated" hash function, with improved resistance to length extension attacks. */
exports.sha512_224 = (0, utils_js_1.wrapConstructor)(() => new SHA512_224());
/** SHA2-512/256 "truncated" hash function, with improved resistance to length extension attacks. */
exports.sha512_256 = (0, utils_js_1.wrapConstructor)(() => new SHA512_256());
/** SHA2-384 hash function. */
exports.sha384 = (0, utils_js_1.wrapConstructor)(() => new SHA384());
//# sourceMappingURL=sha512.js.map

/***/ }),

/***/ 9342:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


/**
 * Utilities for hex, bytes, CSPRNG.
 * @module
 */
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Hash = exports.nextTick = exports.byteSwapIfBE = exports.isLE = void 0;
exports.isBytes = isBytes;
exports.u8 = u8;
exports.u32 = u32;
exports.createView = createView;
exports.rotr = rotr;
exports.rotl = rotl;
exports.byteSwap = byteSwap;
exports.byteSwap32 = byteSwap32;
exports.bytesToHex = bytesToHex;
exports.hexToBytes = hexToBytes;
exports.asyncLoop = asyncLoop;
exports.utf8ToBytes = utf8ToBytes;
exports.toBytes = toBytes;
exports.concatBytes = concatBytes;
exports.checkOpts = checkOpts;
exports.wrapConstructor = wrapConstructor;
exports.wrapConstructorWithOpts = wrapConstructorWithOpts;
exports.wrapXOFConstructorWithOpts = wrapXOFConstructorWithOpts;
exports.randomBytes = randomBytes;
// We use WebCrypto aka globalThis.crypto, which exists in browsers and node.js 16+.
// node.js versions earlier than v19 don't declare it in global scope.
// For node.js, package.json#exports field mapping rewrites import
// from `crypto` to `cryptoNode`, which imports native module.
// Makes the utils un-importable in browsers without a bundler.
// Once node.js 18 is deprecated (2025-04-30), we can just drop the import.
const crypto_1 = __nccwpck_require__(5714);
const _assert_js_1 = __nccwpck_require__(4536);
// export { isBytes } from './_assert.js';
// We can't reuse isBytes from _assert, because somehow this causes huge perf issues
function isBytes(a) {
    return a instanceof Uint8Array || (ArrayBuffer.isView(a) && a.constructor.name === 'Uint8Array');
}
// Cast array to different type
function u8(arr) {
    return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
}
function u32(arr) {
    return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
// Cast array to view
function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
/** The rotate right (circular right shift) operation for uint32 */
function rotr(word, shift) {
    return (word << (32 - shift)) | (word >>> shift);
}
/** The rotate left (circular left shift) operation for uint32 */
function rotl(word, shift) {
    return (word << shift) | ((word >>> (32 - shift)) >>> 0);
}
/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
exports.isLE = (() => new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44)();
// The byte swap operation for uint32
function byteSwap(word) {
    return (((word << 24) & 0xff000000) |
        ((word << 8) & 0xff0000) |
        ((word >>> 8) & 0xff00) |
        ((word >>> 24) & 0xff));
}
/** Conditionally byte swap if on a big-endian platform */
exports.byteSwapIfBE = exports.isLE
    ? (n) => n
    : (n) => byteSwap(n);
/** In place byte swap for Uint32Array */
function byteSwap32(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i] = byteSwap(arr[i]);
    }
}
// Array where index 0xf0 (240) is mapped to string 'f0'
const hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
/**
 * Convert byte array to hex string.
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
function bytesToHex(bytes) {
    (0, _assert_js_1.abytes)(bytes);
    // pre-caching improves the speed 6x
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += hexes[bytes[i]];
    }
    return hex;
}
// We use optimized technique to convert hex string to byte array
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
        return ch - asciis._0; // '2' => 50-48
    if (ch >= asciis.A && ch <= asciis.F)
        return ch - (asciis.A - 10); // 'B' => 66-(65-10)
    if (ch >= asciis.a && ch <= asciis.f)
        return ch - (asciis.a - 10); // 'b' => 98-(97-10)
    return;
}
/**
 * Convert hex string to byte array.
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
function hexToBytes(hex) {
    if (typeof hex !== 'string')
        throw new Error('hex string expected, got ' + typeof hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
        throw new Error('hex string expected, got unpadded hex of length ' + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
    }
    return array;
}
/**
 * There is no setImmediate in browser and setTimeout is slow.
 * Call of async fn will return Promise, which will be fullfiled only on
 * next scheduler queue processing step and this is exactly what we need.
 */
const nextTick = async () => { };
exports.nextTick = nextTick;
/** Returns control to thread each 'tick' ms to avoid blocking. */
async function asyncLoop(iters, tick, cb) {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
        cb(i);
        // Date.now() is not monotonic, so in case if clock goes backwards we return return control too
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
            continue;
        await (0, exports.nextTick)();
        ts += diff;
    }
}
/**
 * Convert JS string to byte array.
 * @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
 */
function utf8ToBytes(str) {
    if (typeof str !== 'string')
        throw new Error('utf8ToBytes expected string, got ' + typeof str);
    return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}
/**
 * Normalizes (non-hex) string or Uint8Array to Uint8Array.
 * Warning: when Uint8Array is passed, it would NOT get copied.
 * Keep in mind for future mutable operations.
 */
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    (0, _assert_js_1.abytes)(data);
    return data;
}
/**
 * Copies several Uint8Arrays into one.
 */
function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        (0, _assert_js_1.abytes)(a);
        sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad);
        pad += a.length;
    }
    return res;
}
/** For runtime check if class implements interface */
class Hash {
    // Safe version that clones internal state
    clone() {
        return this._cloneInto();
    }
}
exports.Hash = Hash;
function checkOpts(defaults, opts) {
    if (opts !== undefined && {}.toString.call(opts) !== '[object Object]')
        throw new Error('Options should be object or undefined');
    const merged = Object.assign(defaults, opts);
    return merged;
}
/** Wraps hash function, creating an interface on top of it */
function wrapConstructor(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
}
function wrapConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
function wrapXOFConstructorWithOpts(hashCons) {
    const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
    const tmp = hashCons({});
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (opts) => hashCons(opts);
    return hashC;
}
/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
function randomBytes(bytesLength = 32) {
    if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === 'function') {
        return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    // Legacy Node.js compatibility
    if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === 'function') {
        return crypto_1.crypto.randomBytes(bytesLength);
    }
    throw new Error('crypto.getRandomValues must be defined');
}
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 6705:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fs = __nccwpck_require__(9896)
const path = __nccwpck_require__(6928)
const os = __nccwpck_require__(857)
const crypto = __nccwpck_require__(6982)
const packageJson = __nccwpck_require__(476)

const version = packageJson.version

const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

// Parse src into an Object
function parse (src) {
  const obj = {}

  // Convert buffer to string
  let lines = src.toString()

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/mg, '\n')

  let match
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]

    // Default undefined or null to empty string
    let value = (match[2] || '')

    // Remove whitespace
    value = value.trim()

    // Check if double quoted
    const maybeQuote = value[0]

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n')
      value = value.replace(/\\r/g, '\r')
    }

    // Add to object
    obj[key] = value
  }

  return obj
}

function _parseVault (options) {
  const vaultPath = _vaultPath(options)

  // Parse .env.vault
  const result = DotenvModule.configDotenv({ path: vaultPath })
  if (!result.parsed) {
    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`)
    err.code = 'MISSING_DATA'
    throw err
  }

  // handle scenario for comma separated keys - for use with key rotation
  // example: DOTENV_KEY="dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenvx.com/vault/.env.vault?environment=prod"
  const keys = _dotenvKey(options).split(',')
  const length = keys.length

  let decrypted
  for (let i = 0; i < length; i++) {
    try {
      // Get full key
      const key = keys[i].trim()

      // Get instructions for decrypt
      const attrs = _instructions(result, key)

      // Decrypt
      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key)

      break
    } catch (error) {
      // last key
      if (i + 1 >= length) {
        throw error
      }
      // try next key
    }
  }

  // Parse decrypted .env string
  return DotenvModule.parse(decrypted)
}

function _warn (message) {
  console.log(`[dotenv@${version}][WARN] ${message}`)
}

function _debug (message) {
  console.log(`[dotenv@${version}][DEBUG] ${message}`)
}

function _dotenvKey (options) {
  // prioritize developer directly setting options.DOTENV_KEY
  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
    return options.DOTENV_KEY
  }

  // secondary infra already contains a DOTENV_KEY environment variable
  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
    return process.env.DOTENV_KEY
  }

  // fallback to empty string
  return ''
}

function _instructions (result, dotenvKey) {
  // Parse DOTENV_KEY. Format is a URI
  let uri
  try {
    uri = new URL(dotenvKey)
  } catch (error) {
    if (error.code === 'ERR_INVALID_URL') {
      const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development')
      err.code = 'INVALID_DOTENV_KEY'
      throw err
    }

    throw error
  }

  // Get decrypt key
  const key = uri.password
  if (!key) {
    const err = new Error('INVALID_DOTENV_KEY: Missing key part')
    err.code = 'INVALID_DOTENV_KEY'
    throw err
  }

  // Get environment
  const environment = uri.searchParams.get('environment')
  if (!environment) {
    const err = new Error('INVALID_DOTENV_KEY: Missing environment part')
    err.code = 'INVALID_DOTENV_KEY'
    throw err
  }

  // Get ciphertext payload
  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`
  const ciphertext = result.parsed[environmentKey] // DOTENV_VAULT_PRODUCTION
  if (!ciphertext) {
    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`)
    err.code = 'NOT_FOUND_DOTENV_ENVIRONMENT'
    throw err
  }

  return { ciphertext, key }
}

function _vaultPath (options) {
  let possibleVaultPath = null

  if (options && options.path && options.path.length > 0) {
    if (Array.isArray(options.path)) {
      for (const filepath of options.path) {
        if (fs.existsSync(filepath)) {
          possibleVaultPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`
        }
      }
    } else {
      possibleVaultPath = options.path.endsWith('.vault') ? options.path : `${options.path}.vault`
    }
  } else {
    possibleVaultPath = path.resolve(process.cwd(), '.env.vault')
  }

  if (fs.existsSync(possibleVaultPath)) {
    return possibleVaultPath
  }

  return null
}

function _resolveHome (envPath) {
  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
}

function _configVault (options) {
  const debug = Boolean(options && options.debug)
  if (debug) {
    _debug('Loading env from encrypted .env.vault')
  }

  const parsed = DotenvModule._parseVault(options)

  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  DotenvModule.populate(processEnv, parsed, options)

  return { parsed }
}

function configDotenv (options) {
  const dotenvPath = path.resolve(process.cwd(), '.env')
  let encoding = 'utf8'
  const debug = Boolean(options && options.debug)

  if (options && options.encoding) {
    encoding = options.encoding
  } else {
    if (debug) {
      _debug('No encoding is specified. UTF-8 is used by default')
    }
  }

  let optionPaths = [dotenvPath] // default, look for .env
  if (options && options.path) {
    if (!Array.isArray(options.path)) {
      optionPaths = [_resolveHome(options.path)]
    } else {
      optionPaths = [] // reset default
      for (const filepath of options.path) {
        optionPaths.push(_resolveHome(filepath))
      }
    }
  }

  // Build the parsed data in a temporary object (because we need to return it).  Once we have the final
  // parsed data, we will combine it with process.env (or options.processEnv if provided).
  let lastError
  const parsedAll = {}
  for (const path of optionPaths) {
    try {
      // Specifying an encoding returns a string instead of a buffer
      const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }))

      DotenvModule.populate(parsedAll, parsed, options)
    } catch (e) {
      if (debug) {
        _debug(`Failed to load ${path} ${e.message}`)
      }
      lastError = e
    }
  }

  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  DotenvModule.populate(processEnv, parsedAll, options)

  if (lastError) {
    return { parsed: parsedAll, error: lastError }
  } else {
    return { parsed: parsedAll }
  }
}

// Populates process.env from .env file
function config (options) {
  // fallback to original dotenv if DOTENV_KEY is not set
  if (_dotenvKey(options).length === 0) {
    return DotenvModule.configDotenv(options)
  }

  const vaultPath = _vaultPath(options)

  // dotenvKey exists but .env.vault file does not exist
  if (!vaultPath) {
    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`)

    return DotenvModule.configDotenv(options)
  }

  return DotenvModule._configVault(options)
}

function decrypt (encrypted, keyStr) {
  const key = Buffer.from(keyStr.slice(-64), 'hex')
  let ciphertext = Buffer.from(encrypted, 'base64')

  const nonce = ciphertext.subarray(0, 12)
  const authTag = ciphertext.subarray(-16)
  ciphertext = ciphertext.subarray(12, -16)

  try {
    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce)
    aesgcm.setAuthTag(authTag)
    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`
  } catch (error) {
    const isRange = error instanceof RangeError
    const invalidKeyLength = error.message === 'Invalid key length'
    const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data'

    if (isRange || invalidKeyLength) {
      const err = new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)')
      err.code = 'INVALID_DOTENV_KEY'
      throw err
    } else if (decryptionFailed) {
      const err = new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY')
      err.code = 'DECRYPTION_FAILED'
      throw err
    } else {
      throw error
    }
  }
}

// Populate process.env with parsed values
function populate (processEnv, parsed, options = {}) {
  const debug = Boolean(options && options.debug)
  const override = Boolean(options && options.override)

  if (typeof parsed !== 'object') {
    const err = new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate')
    err.code = 'OBJECT_REQUIRED'
    throw err
  }

  // Set process.env
  for (const key of Object.keys(parsed)) {
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      if (override === true) {
        processEnv[key] = parsed[key]
      }

      if (debug) {
        if (override === true) {
          _debug(`"${key}" is already defined and WAS overwritten`)
        } else {
          _debug(`"${key}" is already defined and was NOT overwritten`)
        }
      }
    } else {
      processEnv[key] = parsed[key]
    }
  }
}

const DotenvModule = {
  configDotenv,
  _configVault,
  _parseVault,
  config,
  decrypt,
  parse,
  populate
}

module.exports.configDotenv = DotenvModule.configDotenv
module.exports._configVault = DotenvModule._configVault
module.exports._parseVault = DotenvModule._parseVault
module.exports.config = DotenvModule.config
module.exports.decrypt = DotenvModule.decrypt
module.exports.parse = DotenvModule.parse
module.exports.populate = DotenvModule.populate

module.exports = DotenvModule


/***/ }),

/***/ 4074:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ephemeralKeySize = exports.symmetricNonceLength = exports.symmetricAlgorithm = exports.isHkdfKeyCompressed = exports.isEphemeralKeyCompressed = exports.ellipticCurve = exports.ECIES_CONFIG = void 0;
var consts_1 = __nccwpck_require__(7020);
var Config = /** @class */ (function () {
    function Config() {
        this.ellipticCurve = "secp256k1";
        this.isEphemeralKeyCompressed = false; // secp256k1 only
        this.isHkdfKeyCompressed = false; // secp256k1 only
        this.symmetricAlgorithm = "aes-256-gcm";
        this.symmetricNonceLength = 16; // aes-256-gcm only
    }
    return Config;
}());
exports.ECIES_CONFIG = new Config();
var ellipticCurve = function () { return exports.ECIES_CONFIG.ellipticCurve; };
exports.ellipticCurve = ellipticCurve;
var isEphemeralKeyCompressed = function () { return exports.ECIES_CONFIG.isEphemeralKeyCompressed; };
exports.isEphemeralKeyCompressed = isEphemeralKeyCompressed;
var isHkdfKeyCompressed = function () { return exports.ECIES_CONFIG.isHkdfKeyCompressed; };
exports.isHkdfKeyCompressed = isHkdfKeyCompressed;
var symmetricAlgorithm = function () { return exports.ECIES_CONFIG.symmetricAlgorithm; };
exports.symmetricAlgorithm = symmetricAlgorithm;
var symmetricNonceLength = function () { return exports.ECIES_CONFIG.symmetricNonceLength; };
exports.symmetricNonceLength = symmetricNonceLength;
var ephemeralKeySize = function () {
    var mapping = {
        secp256k1: exports.ECIES_CONFIG.isEphemeralKeyCompressed
            ? consts_1.COMPRESSED_PUBLIC_KEY_SIZE
            : consts_1.UNCOMPRESSED_PUBLIC_KEY_SIZE,
        x25519: consts_1.CURVE25519_PUBLIC_KEY_SIZE,
        ed25519: consts_1.CURVE25519_PUBLIC_KEY_SIZE,
    };
    if (exports.ECIES_CONFIG.ellipticCurve in mapping) {
        return mapping[exports.ECIES_CONFIG.ellipticCurve];
    } /* v8 ignore next 2 */
    else {
        throw new Error("Not implemented");
    }
};
exports.ephemeralKeySize = ephemeralKeySize;


/***/ }),

/***/ 7020:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AEAD_TAG_LENGTH = exports.XCHACHA20_NONCE_LENGTH = exports.CURVE25519_PUBLIC_KEY_SIZE = exports.ETH_PUBLIC_KEY_SIZE = exports.UNCOMPRESSED_PUBLIC_KEY_SIZE = exports.COMPRESSED_PUBLIC_KEY_SIZE = exports.SECRET_KEY_LENGTH = void 0;
// elliptic
exports.SECRET_KEY_LENGTH = 32;
exports.COMPRESSED_PUBLIC_KEY_SIZE = 33;
exports.UNCOMPRESSED_PUBLIC_KEY_SIZE = 65;
exports.ETH_PUBLIC_KEY_SIZE = 64;
exports.CURVE25519_PUBLIC_KEY_SIZE = 32;
// symmetric
exports.XCHACHA20_NONCE_LENGTH = 24;
exports.AEAD_TAG_LENGTH = 16;


/***/ }),

/***/ 8162:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.utils = exports.PublicKey = exports.PrivateKey = exports.ECIES_CONFIG = void 0;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
var utils_1 = __nccwpck_require__(4621);
var config_1 = __nccwpck_require__(4074);
var keys_1 = __nccwpck_require__(5215);
var utils_2 = __nccwpck_require__(5612);
/**
 * Encrypts data with a receiver's public key.
 * @description From version 0.5.0, `Uint8Array` will be returned instead of `Buffer`.
 * To keep the same behavior, use `Buffer.from(encrypt(...))`.
 *
 * @param receiverRawPK - Raw public key of the receiver, either as a hex string or a Uint8Array.
 * @param data - Data to encrypt.
 * @returns Encrypted payload, format: `public key || encrypted`.
 */
function encrypt(receiverRawPK, data) {
    return Buffer.from(_encrypt(receiverRawPK, data));
}
function _encrypt(receiverRawPK, data) {
    var ephemeralSK = new keys_1.PrivateKey();
    var receiverPK = receiverRawPK instanceof Uint8Array
        ? new keys_1.PublicKey(receiverRawPK)
        : keys_1.PublicKey.fromHex(receiverRawPK);
    var sharedKey = ephemeralSK.encapsulate(receiverPK, (0, config_1.isHkdfKeyCompressed)());
    var ephemeralPK = ephemeralSK.publicKey.toBytes((0, config_1.isEphemeralKeyCompressed)());
    var encrypted = (0, utils_2.symEncrypt)(sharedKey, data);
    return (0, utils_1.concatBytes)(ephemeralPK, encrypted);
}
/**
 * Decrypts data with a receiver's private key.
 * @description From version 0.5.0, `Uint8Array` will be returned instead of `Buffer`.
 * To keep the same behavior, use `Buffer.from(decrypt(...))`.
 *
 * @param receiverRawSK - Raw private key of the receiver, either as a hex string or a Uint8Array.
 * @param data - Data to decrypt.
 * @returns Decrypted plain text.
 */
function decrypt(receiverRawSK, data) {
    return Buffer.from(_decrypt(receiverRawSK, data));
}
function _decrypt(receiverRawSK, data) {
    var receiverSK = receiverRawSK instanceof Uint8Array
        ? new keys_1.PrivateKey(receiverRawSK)
        : keys_1.PrivateKey.fromHex(receiverRawSK);
    var keySize = (0, config_1.ephemeralKeySize)();
    var ephemeralPK = new keys_1.PublicKey(data.subarray(0, keySize));
    var encrypted = data.subarray(keySize);
    var sharedKey = ephemeralPK.decapsulate(receiverSK, (0, config_1.isHkdfKeyCompressed)());
    return (0, utils_2.symDecrypt)(sharedKey, encrypted);
}
var config_2 = __nccwpck_require__(4074);
Object.defineProperty(exports, "ECIES_CONFIG", ({ enumerable: true, get: function () { return config_2.ECIES_CONFIG; } }));
var keys_2 = __nccwpck_require__(5215);
Object.defineProperty(exports, "PrivateKey", ({ enumerable: true, get: function () { return keys_2.PrivateKey; } }));
Object.defineProperty(exports, "PublicKey", ({ enumerable: true, get: function () { return keys_2.PublicKey; } }));
/** @deprecated - use `import utils from "eciesjs/utils"` instead. */
exports.utils = {
    // TODO: remove these after 0.5.0
    aesEncrypt: utils_2.aesEncrypt,
    aesDecrypt: utils_2.aesDecrypt,
    symEncrypt: utils_2.symEncrypt,
    symDecrypt: utils_2.symDecrypt,
    decodeHex: utils_2.decodeHex,
    getValidSecret: utils_2.getValidSecret,
    remove0x: utils_2.remove0x,
};


/***/ }),

/***/ 2625:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrivateKey = void 0;
var utils_1 = __nccwpck_require__(4621);
var utils_2 = __nccwpck_require__(5612);
var PublicKey_1 = __nccwpck_require__(5603);
var PrivateKey = /** @class */ (function () {
    function PrivateKey(secret) {
        if (secret === undefined) {
            this.data = (0, utils_2.getValidSecret)();
        }
        else if ((0, utils_2.isValidPrivateKey)(secret)) {
            this.data = secret;
        }
        else {
            throw new Error("Invalid private key");
        }
        this.publicKey = new PublicKey_1.PublicKey((0, utils_2.getPublicKey)(this.data));
    }
    PrivateKey.fromHex = function (hex) {
        return new PrivateKey((0, utils_2.decodeHex)(hex));
    };
    Object.defineProperty(PrivateKey.prototype, "secret", {
        /** @description From version 0.5.0, `Uint8Array` will be returned instead of `Buffer`. */
        get: function () {
            // TODO: Uint8Array
            return Buffer.from(this.data);
        },
        enumerable: false,
        configurable: true
    });
    PrivateKey.prototype.toHex = function () {
        return (0, utils_1.bytesToHex)(this.data);
    };
    /**
     * Derives a shared secret from ephemeral private key (this) and receiver's public key (pk).
     * @description The shared key is 32 bytes, derived with `HKDF-SHA256(senderPoint || sharedPoint)`. See implementation for details.
     *
     * There are some variations in different ECIES implementations:
     * which key derivation function to use, compressed or uncompressed `senderPoint`/`sharedPoint`, whether to include `senderPoint`, etc.
     *
     * Because the entropy of `senderPoint`, `sharedPoint` is enough high[1], we don't need salt to derive keys.
     *
     * [1]: Two reasons: the public keys are "random" bytes (albeit secp256k1 public keys are **not uniformly** random), and ephemeral keys are generated in every encryption.
     *
     * @param pk - Receiver's public key.
     * @param compressed - (default: `false`) Whether to use compressed or uncompressed public keys in the key derivation (secp256k1 only).
     * @returns Shared secret, derived with HKDF-SHA256.
     */
    PrivateKey.prototype.encapsulate = function (pk, compressed) {
        if (compressed === void 0) { compressed = false; }
        var senderPoint = this.publicKey.toBytes(compressed);
        var sharedPoint = this.multiply(pk, compressed);
        return (0, utils_2.getSharedKey)(senderPoint, sharedPoint);
    };
    PrivateKey.prototype.multiply = function (pk, compressed) {
        if (compressed === void 0) { compressed = false; }
        return (0, utils_2.getSharedPoint)(this.data, pk.toBytes(true), compressed);
    };
    PrivateKey.prototype.equals = function (other) {
        return (0, utils_1.equalBytes)(this.data, other.data);
    };
    return PrivateKey;
}());
exports.PrivateKey = PrivateKey;


/***/ }),

/***/ 5603:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PublicKey = void 0;
var utils_1 = __nccwpck_require__(4621);
var utils_2 = __nccwpck_require__(5612);
var PublicKey = /** @class */ (function () {
    function PublicKey(data) {
        // data can be either compressed or uncompressed if secp256k1
        var compressed = (0, utils_2.convertPublicKeyFormat)(data, true);
        var uncompressed = (0, utils_2.convertPublicKeyFormat)(data, false);
        this.data = compressed;
        this.dataUncompressed =
            compressed.length !== uncompressed.length ? uncompressed : null;
    }
    PublicKey.fromHex = function (hex) {
        return new PublicKey((0, utils_2.hexToPublicKey)(hex));
    };
    Object.defineProperty(PublicKey.prototype, "_uncompressed", {
        get: function () {
            return this.dataUncompressed !== null ? this.dataUncompressed : this.data;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PublicKey.prototype, "uncompressed", {
        /** @deprecated - use `PublicKey.toBytes(false)` instead. You may also need `Buffer.from`. */
        get: function () {
            return Buffer.from(this._uncompressed); // TODO: delete
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PublicKey.prototype, "compressed", {
        /** @deprecated - use `PublicKey.toBytes()` instead. You may also need `Buffer.from`. */
        get: function () {
            return Buffer.from(this.data); // TODO: delete
        },
        enumerable: false,
        configurable: true
    });
    PublicKey.prototype.toBytes = function (compressed) {
        if (compressed === void 0) { compressed = true; }
        return compressed ? this.data : this._uncompressed;
    };
    PublicKey.prototype.toHex = function (compressed) {
        if (compressed === void 0) { compressed = true; }
        return (0, utils_1.bytesToHex)(this.toBytes(compressed));
    };
    /**
     * Derives a shared secret from receiver's private key (sk) and ephemeral public key (this).
     * Opposite of `encapsulate`.
     * @see PrivateKey.encapsulate
     *
     * @param sk - Receiver's private key.
     * @param compressed - (default: `false`) Whether to use compressed or uncompressed public keys in the key derivation (secp256k1 only).
     * @returns Shared secret, derived with HKDF-SHA256.
     */
    PublicKey.prototype.decapsulate = function (sk, compressed) {
        if (compressed === void 0) { compressed = false; }
        var senderPoint = this.toBytes(compressed);
        var sharedPoint = sk.multiply(this, compressed);
        return (0, utils_2.getSharedKey)(senderPoint, sharedPoint);
    };
    PublicKey.prototype.equals = function (other) {
        return (0, utils_1.equalBytes)(this.data, other.data);
    };
    return PublicKey;
}());
exports.PublicKey = PublicKey;


/***/ }),

/***/ 5215:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PublicKey = exports.PrivateKey = void 0;
// treat Buffer as Uint8array, i.e. no call of Buffer specific functions
// finally Uint8Array only
var PrivateKey_1 = __nccwpck_require__(2625);
Object.defineProperty(exports, "PrivateKey", ({ enumerable: true, get: function () { return PrivateKey_1.PrivateKey; } }));
var PublicKey_1 = __nccwpck_require__(5603);
Object.defineProperty(exports, "PublicKey", ({ enumerable: true, get: function () { return PublicKey_1.PublicKey; } }));


/***/ }),

/***/ 5580:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hexToPublicKey = exports.convertPublicKeyFormat = exports.getSharedPoint = exports.getPublicKey = exports.isValidPrivateKey = exports.getValidSecret = void 0;
var webcrypto_1 = __nccwpck_require__(1287);
var ed25519_1 = __nccwpck_require__(81);
var secp256k1_1 = __nccwpck_require__(7300);
var config_1 = __nccwpck_require__(4074);
var consts_1 = __nccwpck_require__(7020);
var hex_1 = __nccwpck_require__(4953);
var getValidSecret = function () {
    var key;
    do {
        key = (0, webcrypto_1.randomBytes)(consts_1.SECRET_KEY_LENGTH);
    } while (!(0, exports.isValidPrivateKey)(key));
    return key;
};
exports.getValidSecret = getValidSecret;
var isValidPrivateKey = function (secret) {
    // on secp256k1: only key ∈ (0, group order) is valid
    // on curve25519: any 32-byte key is valid
    return _exec((0, config_1.ellipticCurve)(), function (curve) { return curve.utils.isValidPrivateKey(secret); }, function () { return true; }, function () { return true; });
};
exports.isValidPrivateKey = isValidPrivateKey;
var getPublicKey = function (secret) {
    return _exec((0, config_1.ellipticCurve)(), function (curve) { return curve.getPublicKey(secret); }, function (curve) { return curve.getPublicKey(secret); }, function (curve) { return curve.getPublicKey(secret); });
};
exports.getPublicKey = getPublicKey;
var getSharedPoint = function (sk, pk, compressed) {
    return _exec((0, config_1.ellipticCurve)(), function (curve) { return curve.getSharedSecret(sk, pk, compressed); }, function (curve) { return curve.getSharedSecret(sk, pk); }, function (curve) { return getSharedPointOnEd25519(curve, sk, pk); });
};
exports.getSharedPoint = getSharedPoint;
var convertPublicKeyFormat = function (pk, compressed) {
    // only for secp256k1
    return _exec((0, config_1.ellipticCurve)(), function (curve) { return curve.getSharedSecret(BigInt(1), pk, compressed); }, function () { return pk; }, function () { return pk; });
};
exports.convertPublicKeyFormat = convertPublicKeyFormat;
var hexToPublicKey = function (hex) {
    var decoded = (0, hex_1.decodeHex)(hex);
    return _exec((0, config_1.ellipticCurve)(), function () { return compatEthPublicKey(decoded); }, function () { return decoded; }, function () { return decoded; });
};
exports.hexToPublicKey = hexToPublicKey;
function _exec(curve, secp256k1Callback, x25519Callback, ed25519Callback) {
    if (curve === "secp256k1") {
        return secp256k1Callback(secp256k1_1.secp256k1);
    }
    else if (curve === "x25519") {
        return x25519Callback(ed25519_1.x25519);
    }
    else if (curve === "ed25519") {
        return ed25519Callback(ed25519_1.ed25519);
    } /* v8 ignore next 2 */
    else {
        throw new Error("Not implemented");
    }
}
var compatEthPublicKey = function (pk) {
    if (pk.length === consts_1.ETH_PUBLIC_KEY_SIZE) {
        var fixed = new Uint8Array(1 + pk.length);
        fixed.set([0x04]);
        fixed.set(pk, 1);
        return fixed;
    }
    return pk;
};
var getSharedPointOnEd25519 = function (curve, sk, pk) {
    // Note: scalar is hashed from sk
    var scalar = curve.utils.getExtendedPublicKey(sk).scalar;
    var point = curve.ExtendedPoint.fromHex(pk).multiply(scalar);
    return point.toRawBytes();
};


/***/ }),

/***/ 3350:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSharedKey = exports.deriveKey = void 0;
var utils_1 = __nccwpck_require__(4621);
var hkdf_1 = __nccwpck_require__(8104);
var sha256_1 = __nccwpck_require__(8068);
var deriveKey = function (master, salt, info) {
    // 32 bytes shared secret for aes256 and xchacha20 derived from HKDF-SHA256
    return (0, hkdf_1.hkdf)(sha256_1.sha256, master, salt, info, 32);
};
exports.deriveKey = deriveKey;
var getSharedKey = function () {
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parts[_i] = arguments[_i];
    }
    return (0, exports.deriveKey)(utils_1.concatBytes.apply(void 0, parts));
};
exports.getSharedKey = getSharedKey;


/***/ }),

/***/ 4953:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decodeHex = exports.remove0x = void 0;
var utils_1 = __nccwpck_require__(4621);
var remove0x = function (hex) {
    return hex.startsWith("0x") || hex.startsWith("0X") ? hex.slice(2) : hex;
};
exports.remove0x = remove0x;
var decodeHex = function (hex) { return (0, utils_1.hexToBytes)((0, exports.remove0x)(hex)); };
exports.decodeHex = decodeHex;


/***/ }),

/***/ 5612:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(5580), exports);
__exportStar(__nccwpck_require__(3350), exports);
__exportStar(__nccwpck_require__(4953), exports);
__exportStar(__nccwpck_require__(7819), exports);


/***/ }),

/***/ 7819:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.aesDecrypt = exports.aesEncrypt = exports.symDecrypt = exports.symEncrypt = void 0;
var utils_1 = __nccwpck_require__(4621);
var webcrypto_1 = __nccwpck_require__(1287);
var aes_1 = __nccwpck_require__(9398);
var chacha_1 = __nccwpck_require__(149);
var config_1 = __nccwpck_require__(4074);
var consts_1 = __nccwpck_require__(7020);
var symEncrypt = function (key, plainText, AAD) { return _exec(_encrypt, key, plainText, AAD); };
exports.symEncrypt = symEncrypt;
var symDecrypt = function (key, cipherText, AAD) { return _exec(_decrypt, key, cipherText, AAD); };
exports.symDecrypt = symDecrypt;
/** @deprecated - use `symEncrypt` instead. */
exports.aesEncrypt = exports.symEncrypt; // TODO: delete
/** @deprecated - use `symDecrypt` instead. */
exports.aesDecrypt = exports.symDecrypt; // TODO: delete
function _exec(callback, key, data, AAD) {
    var algorithm = (0, config_1.symmetricAlgorithm)();
    if (algorithm === "aes-256-gcm") {
        return callback(aes_1.aes256gcm, key, data, (0, config_1.symmetricNonceLength)(), consts_1.AEAD_TAG_LENGTH, AAD);
    }
    else if (algorithm === "xchacha20") {
        return callback(chacha_1.xchacha20, key, data, consts_1.XCHACHA20_NONCE_LENGTH, consts_1.AEAD_TAG_LENGTH, AAD);
    }
    else if (algorithm === "aes-256-cbc") {
        // NOT RECOMMENDED. There is neither AAD nor AEAD tag in cbc mode
        // aes-256-cbc always uses 16 bytes iv
        return callback(aes_1.aes256cbc, key, data, 16, 0);
    }
    else {
        throw new Error("Not implemented");
    }
}
function _encrypt(func, key, data, nonceLength, tagLength, AAD) {
    var nonce = (0, webcrypto_1.randomBytes)(nonceLength);
    var cipher = func(key, nonce, AAD);
    // @noble/ciphers format: cipherText || tag
    var encrypted = cipher.encrypt(data);
    if (tagLength === 0) {
        return (0, utils_1.concatBytes)(nonce, encrypted);
    }
    var cipherTextLength = encrypted.length - tagLength;
    var cipherText = encrypted.subarray(0, cipherTextLength);
    var tag = encrypted.subarray(cipherTextLength);
    // ecies payload format: pk || nonce || tag || cipherText
    return (0, utils_1.concatBytes)(nonce, tag, cipherText);
}
function _decrypt(func, key, data, nonceLength, tagLength, AAD) {
    var nonce = data.subarray(0, nonceLength);
    var cipher = func(key, Uint8Array.from(nonce), AAD); // to reset byteOffset
    var encrypted = data.subarray(nonceLength);
    if (tagLength === 0) {
        return cipher.decrypt(encrypted);
    }
    var tag = encrypted.subarray(0, tagLength);
    var cipherText = encrypted.subarray(tagLength);
    return cipher.decrypt((0, utils_1.concatBytes)(cipherText, tag));
}


/***/ }),

/***/ 872:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.callback = exports.promise = void 0;
const walker_1 = __nccwpck_require__(928);
function promise(root, options) {
    return new Promise((resolve, reject) => {
        callback(root, options, (err, output) => {
            if (err)
                return reject(err);
            resolve(output);
        });
    });
}
exports.promise = promise;
function callback(root, options, callback) {
    let walker = new walker_1.Walker(root, options, callback);
    walker.start();
}
exports.callback = callback;


/***/ }),

/***/ 9828:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Counter = void 0;
class Counter {
    _files = 0;
    _directories = 0;
    set files(num) {
        this._files = num;
    }
    get files() {
        return this._files;
    }
    set directories(num) {
        this._directories = num;
    }
    get directories() {
        return this._directories;
    }
    /**
     * @deprecated use `directories` instead
     */
    /* c8 ignore next 3 */
    get dirs() {
        return this._directories;
    }
}
exports.Counter = Counter;


/***/ }),

/***/ 8170:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
const getArray = (paths) => {
    return paths;
};
const getArrayGroup = () => {
    return [""].slice(0, 0);
};
function build(options) {
    return options.group ? getArrayGroup : getArray;
}
exports.build = build;


/***/ }),

/***/ 2027:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
const groupFiles = (groups, directory, files) => {
    groups.push({ directory, files, dir: directory });
};
const empty = () => { };
function build(options) {
    return options.group ? groupFiles : empty;
}
exports.build = build;


/***/ }),

/***/ 2426:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
const onlyCountsSync = (state) => {
    return state.counts;
};
const groupsSync = (state) => {
    return state.groups;
};
const defaultSync = (state) => {
    return state.paths;
};
const limitFilesSync = (state) => {
    return state.paths.slice(0, state.options.maxFiles);
};
const onlyCountsAsync = (state, error, callback) => {
    report(error, callback, state.counts, state.options.suppressErrors);
    return null;
};
const defaultAsync = (state, error, callback) => {
    report(error, callback, state.paths, state.options.suppressErrors);
    return null;
};
const limitFilesAsync = (state, error, callback) => {
    report(error, callback, state.paths.slice(0, state.options.maxFiles), state.options.suppressErrors);
    return null;
};
const groupsAsync = (state, error, callback) => {
    report(error, callback, state.groups, state.options.suppressErrors);
    return null;
};
function report(error, callback, output, suppressErrors) {
    if (error && !suppressErrors)
        callback(error, output);
    else
        callback(null, output);
}
function build(options, isSynchronous) {
    const { onlyCounts, group, maxFiles } = options;
    if (onlyCounts)
        return isSynchronous
            ? onlyCountsSync
            : onlyCountsAsync;
    else if (group)
        return isSynchronous
            ? groupsSync
            : groupsAsync;
    else if (maxFiles)
        return isSynchronous
            ? limitFilesSync
            : limitFilesAsync;
    else
        return isSynchronous
            ? defaultSync
            : defaultAsync;
}
exports.build = build;


/***/ }),

/***/ 7038:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = exports.joinDirectoryPath = exports.joinPathWithBasePath = void 0;
const path_1 = __nccwpck_require__(6928);
const utils_1 = __nccwpck_require__(114);
function joinPathWithBasePath(filename, directoryPath) {
    return directoryPath + filename;
}
exports.joinPathWithBasePath = joinPathWithBasePath;
function joinPathWithRelativePath(root, options) {
    return function (filename, directoryPath) {
        const sameRoot = directoryPath.startsWith(root);
        if (sameRoot)
            return directoryPath.replace(root, "") + filename;
        else
            return ((0, utils_1.convertSlashes)((0, path_1.relative)(root, directoryPath), options.pathSeparator) +
                options.pathSeparator +
                filename);
    };
}
function joinPath(filename) {
    return filename;
}
function joinDirectoryPath(filename, directoryPath, separator) {
    return directoryPath + filename + separator;
}
exports.joinDirectoryPath = joinDirectoryPath;
function build(root, options) {
    const { relativePaths, includeBasePath } = options;
    return relativePaths && root
        ? joinPathWithRelativePath(root, options)
        : includeBasePath
            ? joinPathWithBasePath
            : joinPath;
}
exports.build = build;


/***/ }),

/***/ 8914:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
function pushDirectoryWithRelativePath(root) {
    return function (directoryPath, paths) {
        paths.push(directoryPath.substring(root.length) || ".");
    };
}
function pushDirectoryFilterWithRelativePath(root) {
    return function (directoryPath, paths, filters) {
        const relativePath = directoryPath.substring(root.length) || ".";
        if (filters.every((filter) => filter(relativePath, true))) {
            paths.push(relativePath);
        }
    };
}
const pushDirectory = (directoryPath, paths) => {
    paths.push(directoryPath || ".");
};
const pushDirectoryFilter = (directoryPath, paths, filters) => {
    const path = directoryPath || ".";
    if (filters.every((filter) => filter(path, true))) {
        paths.push(path);
    }
};
const empty = () => { };
function build(root, options) {
    const { includeDirs, filters, relativePaths } = options;
    if (!includeDirs)
        return empty;
    if (relativePaths)
        return filters && filters.length
            ? pushDirectoryFilterWithRelativePath(root)
            : pushDirectoryWithRelativePath(root);
    return filters && filters.length ? pushDirectoryFilter : pushDirectory;
}
exports.build = build;


/***/ }),

/***/ 4867:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
const pushFileFilterAndCount = (filename, _paths, counts, filters) => {
    if (filters.every((filter) => filter(filename, false)))
        counts.files++;
};
const pushFileFilter = (filename, paths, _counts, filters) => {
    if (filters.every((filter) => filter(filename, false)))
        paths.push(filename);
};
const pushFileCount = (_filename, _paths, counts, _filters) => {
    counts.files++;
};
const pushFile = (filename, paths) => {
    paths.push(filename);
};
const empty = () => { };
function build(options) {
    const { excludeFiles, filters, onlyCounts } = options;
    if (excludeFiles)
        return empty;
    if (filters && filters.length) {
        return onlyCounts ? pushFileFilterAndCount : pushFileFilter;
    }
    else if (onlyCounts) {
        return pushFileCount;
    }
    else {
        return pushFile;
    }
}
exports.build = build;


/***/ }),

/***/ 4444:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
const fs_1 = __importDefault(__nccwpck_require__(9896));
const path_1 = __nccwpck_require__(6928);
const resolveSymlinksAsync = function (path, state, callback) {
    const { queue, options: { suppressErrors }, } = state;
    queue.enqueue();
    fs_1.default.realpath(path, (error, resolvedPath) => {
        if (error)
            return queue.dequeue(suppressErrors ? null : error, state);
        fs_1.default.stat(resolvedPath, (error, stat) => {
            if (error)
                return queue.dequeue(suppressErrors ? null : error, state);
            if (stat.isDirectory() && isRecursive(path, resolvedPath, state))
                return queue.dequeue(null, state);
            callback(stat, resolvedPath);
            queue.dequeue(null, state);
        });
    });
};
const resolveSymlinks = function (path, state, callback) {
    const { queue, options: { suppressErrors }, } = state;
    queue.enqueue();
    try {
        const resolvedPath = fs_1.default.realpathSync(path);
        const stat = fs_1.default.statSync(resolvedPath);
        if (stat.isDirectory() && isRecursive(path, resolvedPath, state))
            return;
        callback(stat, resolvedPath);
    }
    catch (e) {
        if (!suppressErrors)
            throw e;
    }
};
function build(options, isSynchronous) {
    if (!options.resolveSymlinks || options.excludeSymlinks)
        return null;
    return isSynchronous ? resolveSymlinks : resolveSymlinksAsync;
}
exports.build = build;
function isRecursive(path, resolved, state) {
    if (state.options.useRealPaths)
        return isRecursiveUsingRealPaths(resolved, state);
    let parent = (0, path_1.dirname)(path);
    let depth = 1;
    while (parent !== state.root && depth < 2) {
        const resolvedPath = state.symlinks.get(parent);
        const isSameRoot = !!resolvedPath &&
            (resolvedPath === resolved ||
                resolvedPath.startsWith(resolved) ||
                resolved.startsWith(resolvedPath));
        if (isSameRoot)
            depth++;
        else
            parent = (0, path_1.dirname)(parent);
    }
    state.symlinks.set(path, resolved);
    return depth > 1;
}
function isRecursiveUsingRealPaths(resolved, state) {
    return state.visited.includes(resolved + state.options.pathSeparator);
}


/***/ }),

/***/ 3095:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.build = void 0;
const fs_1 = __importDefault(__nccwpck_require__(9896));
const readdirOpts = { withFileTypes: true };
const walkAsync = (state, crawlPath, directoryPath, currentDepth, callback) => {
    if (currentDepth < 0)
        return state.queue.dequeue(null, state);
    state.visited.push(crawlPath);
    state.counts.directories++;
    state.queue.enqueue();
    // Perf: Node >= 10 introduced withFileTypes that helps us
    // skip an extra fs.stat call.
    fs_1.default.readdir(crawlPath || ".", readdirOpts, (error, entries = []) => {
        callback(entries, directoryPath, currentDepth);
        state.queue.dequeue(state.options.suppressErrors ? null : error, state);
    });
};
const walkSync = (state, crawlPath, directoryPath, currentDepth, callback) => {
    if (currentDepth < 0)
        return;
    state.visited.push(crawlPath);
    state.counts.directories++;
    let entries = [];
    try {
        entries = fs_1.default.readdirSync(crawlPath || ".", readdirOpts);
    }
    catch (e) {
        if (!state.options.suppressErrors)
            throw e;
    }
    callback(entries, directoryPath, currentDepth);
};
function build(isSynchronous) {
    return isSynchronous ? walkSync : walkAsync;
}
exports.build = build;


/***/ }),

/***/ 2979:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Queue = void 0;
/**
 * This is a custom stateless queue to track concurrent async fs calls.
 * It increments a counter whenever a call is queued and decrements it
 * as soon as it completes. When the counter hits 0, it calls onQueueEmpty.
 */
class Queue {
    onQueueEmpty;
    count = 0;
    constructor(onQueueEmpty) {
        this.onQueueEmpty = onQueueEmpty;
    }
    enqueue() {
        this.count++;
    }
    dequeue(error, output) {
        if (--this.count <= 0 || error)
            this.onQueueEmpty(error, output);
    }
}
exports.Queue = Queue;


/***/ }),

/***/ 5865:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sync = void 0;
const walker_1 = __nccwpck_require__(928);
function sync(root, options) {
    const walker = new walker_1.Walker(root, options);
    return walker.start();
}
exports.sync = sync;


/***/ }),

/***/ 928:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Walker = void 0;
const path_1 = __nccwpck_require__(6928);
const utils_1 = __nccwpck_require__(114);
const joinPath = __importStar(__nccwpck_require__(7038));
const pushDirectory = __importStar(__nccwpck_require__(8914));
const pushFile = __importStar(__nccwpck_require__(4867));
const getArray = __importStar(__nccwpck_require__(8170));
const groupFiles = __importStar(__nccwpck_require__(2027));
const resolveSymlink = __importStar(__nccwpck_require__(4444));
const invokeCallback = __importStar(__nccwpck_require__(2426));
const walkDirectory = __importStar(__nccwpck_require__(3095));
const queue_1 = __nccwpck_require__(2979);
const counter_1 = __nccwpck_require__(9828);
class Walker {
    root;
    isSynchronous;
    state;
    joinPath;
    pushDirectory;
    pushFile;
    getArray;
    groupFiles;
    resolveSymlink;
    walkDirectory;
    callbackInvoker;
    constructor(root, options, callback) {
        this.isSynchronous = !callback;
        this.callbackInvoker = invokeCallback.build(options, this.isSynchronous);
        this.root = (0, utils_1.normalizePath)(root, options);
        this.state = {
            root: this.root.slice(0, -1),
            // Perf: we explicitly tell the compiler to optimize for String arrays
            paths: [""].slice(0, 0),
            groups: [],
            counts: new counter_1.Counter(),
            options,
            queue: new queue_1.Queue((error, state) => this.callbackInvoker(state, error, callback)),
            symlinks: new Map(),
            visited: [""].slice(0, 0),
        };
        /*
         * Perf: We conditionally change functions according to options. This gives a slight
         * performance boost. Since these functions are so small, they are automatically inlined
         * by the javascript engine so there's no function call overhead (in most cases).
         */
        this.joinPath = joinPath.build(this.root, options);
        this.pushDirectory = pushDirectory.build(this.root, options);
        this.pushFile = pushFile.build(options);
        this.getArray = getArray.build(options);
        this.groupFiles = groupFiles.build(options);
        this.resolveSymlink = resolveSymlink.build(options, this.isSynchronous);
        this.walkDirectory = walkDirectory.build(this.isSynchronous);
    }
    start() {
        this.walkDirectory(this.state, this.root, this.root, this.state.options.maxDepth, this.walk);
        return this.isSynchronous ? this.callbackInvoker(this.state, null) : null;
    }
    walk = (entries, directoryPath, depth) => {
        const { paths, options: { filters, resolveSymlinks, excludeSymlinks, exclude, maxFiles, signal, useRealPaths, pathSeparator, }, } = this.state;
        if ((signal && signal.aborted) || (maxFiles && paths.length > maxFiles))
            return;
        this.pushDirectory(directoryPath, paths, filters);
        const files = this.getArray(this.state.paths);
        for (let i = 0; i < entries.length; ++i) {
            const entry = entries[i];
            if (entry.isFile() ||
                (entry.isSymbolicLink() && !resolveSymlinks && !excludeSymlinks)) {
                const filename = this.joinPath(entry.name, directoryPath);
                this.pushFile(filename, files, this.state.counts, filters);
            }
            else if (entry.isDirectory()) {
                let path = joinPath.joinDirectoryPath(entry.name, directoryPath, this.state.options.pathSeparator);
                if (exclude && exclude(entry.name, path))
                    continue;
                this.walkDirectory(this.state, path, path, depth - 1, this.walk);
            }
            else if (entry.isSymbolicLink() && this.resolveSymlink) {
                let path = joinPath.joinPathWithBasePath(entry.name, directoryPath);
                this.resolveSymlink(path, this.state, (stat, resolvedPath) => {
                    if (stat.isDirectory()) {
                        resolvedPath = (0, utils_1.normalizePath)(resolvedPath, this.state.options);
                        if (exclude && exclude(entry.name, useRealPaths ? resolvedPath : path + pathSeparator))
                            return;
                        this.walkDirectory(this.state, resolvedPath, useRealPaths ? resolvedPath : path + pathSeparator, depth - 1, this.walk);
                    }
                    else {
                        resolvedPath = useRealPaths ? resolvedPath : path;
                        const filename = (0, path_1.basename)(resolvedPath);
                        const directoryPath = (0, utils_1.normalizePath)((0, path_1.dirname)(resolvedPath), this.state.options);
                        resolvedPath = this.joinPath(filename, directoryPath);
                        this.pushFile(resolvedPath, files, this.state.counts, filters);
                    }
                });
            }
        }
        this.groupFiles(this.state.groups, directoryPath, files);
    };
}
exports.Walker = Walker;


/***/ }),

/***/ 9669:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.APIBuilder = void 0;
const async_1 = __nccwpck_require__(872);
const sync_1 = __nccwpck_require__(5865);
class APIBuilder {
    root;
    options;
    constructor(root, options) {
        this.root = root;
        this.options = options;
    }
    withPromise() {
        return (0, async_1.promise)(this.root, this.options);
    }
    withCallback(cb) {
        (0, async_1.callback)(this.root, this.options, cb);
    }
    sync() {
        return (0, sync_1.sync)(this.root, this.options);
    }
}
exports.APIBuilder = APIBuilder;


/***/ }),

/***/ 4559:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Builder = void 0;
const path_1 = __nccwpck_require__(6928);
const api_builder_1 = __nccwpck_require__(9669);
var pm = null;
/* c8 ignore next 6 */
try {
    __nccwpck_require__.ab + "index.js"
    pm = __nccwpck_require__(2324);
}
catch (_e) {
    // do nothing
}
class Builder {
    globCache = {};
    options = {
        maxDepth: Infinity,
        suppressErrors: true,
        pathSeparator: path_1.sep,
        filters: [],
    };
    globFunction;
    constructor(options) {
        this.options = { ...this.options, ...options };
        this.globFunction = this.options.globFunction;
    }
    group() {
        this.options.group = true;
        return this;
    }
    withPathSeparator(separator) {
        this.options.pathSeparator = separator;
        return this;
    }
    withBasePath() {
        this.options.includeBasePath = true;
        return this;
    }
    withRelativePaths() {
        this.options.relativePaths = true;
        return this;
    }
    withDirs() {
        this.options.includeDirs = true;
        return this;
    }
    withMaxDepth(depth) {
        this.options.maxDepth = depth;
        return this;
    }
    withMaxFiles(limit) {
        this.options.maxFiles = limit;
        return this;
    }
    withFullPaths() {
        this.options.resolvePaths = true;
        this.options.includeBasePath = true;
        return this;
    }
    withErrors() {
        this.options.suppressErrors = false;
        return this;
    }
    withSymlinks({ resolvePaths = true } = {}) {
        this.options.resolveSymlinks = true;
        this.options.useRealPaths = resolvePaths;
        return this.withFullPaths();
    }
    withAbortSignal(signal) {
        this.options.signal = signal;
        return this;
    }
    normalize() {
        this.options.normalizePath = true;
        return this;
    }
    filter(predicate) {
        this.options.filters.push(predicate);
        return this;
    }
    onlyDirs() {
        this.options.excludeFiles = true;
        this.options.includeDirs = true;
        return this;
    }
    exclude(predicate) {
        this.options.exclude = predicate;
        return this;
    }
    onlyCounts() {
        this.options.onlyCounts = true;
        return this;
    }
    crawl(root) {
        return new api_builder_1.APIBuilder(root || ".", this.options);
    }
    withGlobFunction(fn) {
        // cast this since we don't have the new type params yet
        this.globFunction = fn;
        return this;
    }
    /**
     * @deprecated Pass options using the constructor instead:
     * ```ts
     * new fdir(options).crawl("/path/to/root");
     * ```
     * This method will be removed in v7.0
     */
    /* c8 ignore next 4 */
    crawlWithOptions(root, options) {
        this.options = { ...this.options, ...options };
        return new api_builder_1.APIBuilder(root || ".", this.options);
    }
    glob(...patterns) {
        if (this.globFunction) {
            return this.globWithOptions(patterns);
        }
        return this.globWithOptions(patterns, ...[{ dot: true }]);
    }
    globWithOptions(patterns, ...options) {
        const globFn = (this.globFunction || pm);
        /* c8 ignore next 5 */
        if (!globFn) {
            throw new Error('Please specify a glob function to use glob matching.');
        }
        var isMatch = this.globCache[patterns.join("\0")];
        if (!isMatch) {
            isMatch = globFn(patterns, ...options);
            this.globCache[patterns.join("\0")] = isMatch;
        }
        this.options.filters.push((path) => isMatch(path));
        return this;
    }
}
exports.Builder = Builder;


/***/ }),

/***/ 9991:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fdir = void 0;
const builder_1 = __nccwpck_require__(4559);
Object.defineProperty(exports, "fdir", ({ enumerable: true, get: function () { return builder_1.Builder; } }));
__exportStar(__nccwpck_require__(6190), exports);


/***/ }),

/***/ 6190:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 114:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalizePath = exports.convertSlashes = exports.cleanPath = void 0;
const path_1 = __nccwpck_require__(6928);
function cleanPath(path) {
    let normalized = (0, path_1.normalize)(path);
    // we have to remove the last path separator
    // to account for / root path
    if (normalized.length > 1 && normalized[normalized.length - 1] === path_1.sep)
        normalized = normalized.substring(0, normalized.length - 1);
    return normalized;
}
exports.cleanPath = cleanPath;
const SLASHES_REGEX = /[\\/]/g;
function convertSlashes(path, separator) {
    return path.replace(SLASHES_REGEX, separator);
}
exports.convertSlashes = convertSlashes;
function normalizePath(path, options) {
    const { resolvePaths, normalizePath, pathSeparator } = options;
    const pathNeedsCleaning = (process.platform === "win32" && path.includes("/")) ||
        path.startsWith(".");
    if (resolvePaths)
        path = (0, path_1.resolve)(path);
    if (normalizePath || pathNeedsCleaning)
        path = cleanPath(path);
    if (path === ".")
        return "";
    const needsSeperator = path[path.length - 1] !== pathSeparator;
    return convertSlashes(needsSeperator ? path + pathSeparator : path, pathSeparator);
}
exports.normalizePath = normalizePath;


/***/ }),

/***/ 2146:
/***/ ((module) => {

// A simple implementation of make-array
function makeArray (subject) {
  return Array.isArray(subject)
    ? subject
    : [subject]
}

const EMPTY = ''
const SPACE = ' '
const ESCAPE = '\\'
const REGEX_TEST_BLANK_LINE = /^\s+$/
const REGEX_INVALID_TRAILING_BACKSLASH = /(?:[^\\]|^)\\$/
const REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION = /^\\!/
const REGEX_REPLACE_LEADING_EXCAPED_HASH = /^\\#/
const REGEX_SPLITALL_CRLF = /\r?\n/g
// /foo,
// ./foo,
// ../foo,
// .
// ..
const REGEX_TEST_INVALID_PATH = /^\.*\/|^\.+$/

const SLASH = '/'

// Do not use ternary expression here, since "istanbul ignore next" is buggy
let TMP_KEY_IGNORE = 'node-ignore'
/* istanbul ignore else */
if (typeof Symbol !== 'undefined') {
  TMP_KEY_IGNORE = Symbol.for('node-ignore')
}
const KEY_IGNORE = TMP_KEY_IGNORE

const define = (object, key, value) =>
  Object.defineProperty(object, key, {value})

const REGEX_REGEXP_RANGE = /([0-z])-([0-z])/g

const RETURN_FALSE = () => false

// Sanitize the range of a regular expression
// The cases are complicated, see test cases for details
const sanitizeRange = range => range.replace(
  REGEX_REGEXP_RANGE,
  (match, from, to) => from.charCodeAt(0) <= to.charCodeAt(0)
    ? match
    // Invalid range (out of order) which is ok for gitignore rules but
    //   fatal for JavaScript regular expression, so eliminate it.
    : EMPTY
)

// See fixtures #59
const cleanRangeBackSlash = slashes => {
  const {length} = slashes
  return slashes.slice(0, length - length % 2)
}

// > If the pattern ends with a slash,
// > it is removed for the purpose of the following description,
// > but it would only find a match with a directory.
// > In other words, foo/ will match a directory foo and paths underneath it,
// > but will not match a regular file or a symbolic link foo
// >  (this is consistent with the way how pathspec works in general in Git).
// '`foo/`' will not match regular file '`foo`' or symbolic link '`foo`'
// -> ignore-rules will not deal with it, because it costs extra `fs.stat` call
//      you could use option `mark: true` with `glob`

// '`foo/`' should not continue with the '`..`'
const REPLACERS = [

  [
    // remove BOM
    // TODO:
    // Other similar zero-width characters?
    /^\uFEFF/,
    () => EMPTY
  ],

  // > Trailing spaces are ignored unless they are quoted with backslash ("\")
  [
    // (a\ ) -> (a )
    // (a  ) -> (a)
    // (a ) -> (a)
    // (a \ ) -> (a  )
    /((?:\\\\)*?)(\\?\s+)$/,
    (_, m1, m2) => m1 + (
      m2.indexOf('\\') === 0
        ? SPACE
        : EMPTY
    )
  ],

  // replace (\ ) with ' '
  // (\ ) -> ' '
  // (\\ ) -> '\\ '
  // (\\\ ) -> '\\ '
  [
    /(\\+?)\s/g,
    (_, m1) => {
      const {length} = m1
      return m1.slice(0, length - length % 2) + SPACE
    }
  ],

  // Escape metacharacters
  // which is written down by users but means special for regular expressions.

  // > There are 12 characters with special meanings:
  // > - the backslash \,
  // > - the caret ^,
  // > - the dollar sign $,
  // > - the period or dot .,
  // > - the vertical bar or pipe symbol |,
  // > - the question mark ?,
  // > - the asterisk or star *,
  // > - the plus sign +,
  // > - the opening parenthesis (,
  // > - the closing parenthesis ),
  // > - and the opening square bracket [,
  // > - the opening curly brace {,
  // > These special characters are often called "metacharacters".
  [
    /[\\$.|*+(){^]/g,
    match => `\\${match}`
  ],

  [
    // > a question mark (?) matches a single character
    /(?!\\)\?/g,
    () => '[^/]'
  ],

  // leading slash
  [

    // > A leading slash matches the beginning of the pathname.
    // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
    // A leading slash matches the beginning of the pathname
    /^\//,
    () => '^'
  ],

  // replace special metacharacter slash after the leading slash
  [
    /\//g,
    () => '\\/'
  ],

  [
    // > A leading "**" followed by a slash means match in all directories.
    // > For example, "**/foo" matches file or directory "foo" anywhere,
    // > the same as pattern "foo".
    // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
    // >   under directory "foo".
    // Notice that the '*'s have been replaced as '\\*'
    /^\^*\\\*\\\*\\\//,

    // '**/foo' <-> 'foo'
    () => '^(?:.*\\/)?'
  ],

  // starting
  [
    // there will be no leading '/'
    //   (which has been replaced by section "leading slash")
    // If starts with '**', adding a '^' to the regular expression also works
    /^(?=[^^])/,
    function startingReplacer () {
      // If has a slash `/` at the beginning or middle
      return !/\/(?!$)/.test(this)
        // > Prior to 2.22.1
        // > If the pattern does not contain a slash /,
        // >   Git treats it as a shell glob pattern
        // Actually, if there is only a trailing slash,
        //   git also treats it as a shell glob pattern

        // After 2.22.1 (compatible but clearer)
        // > If there is a separator at the beginning or middle (or both)
        // > of the pattern, then the pattern is relative to the directory
        // > level of the particular .gitignore file itself.
        // > Otherwise the pattern may also match at any level below
        // > the .gitignore level.
        ? '(?:^|\\/)'

        // > Otherwise, Git treats the pattern as a shell glob suitable for
        // >   consumption by fnmatch(3)
        : '^'
    }
  ],

  // two globstars
  [
    // Use lookahead assertions so that we could match more than one `'/**'`
    /\\\/\\\*\\\*(?=\\\/|$)/g,

    // Zero, one or several directories
    // should not use '*', or it will be replaced by the next replacer

    // Check if it is not the last `'/**'`
    (_, index, str) => index + 6 < str.length

      // case: /**/
      // > A slash followed by two consecutive asterisks then a slash matches
      // >   zero or more directories.
      // > For example, "a/**/b" matches "a/b", "a/x/b", "a/x/y/b" and so on.
      // '/**/'
      ? '(?:\\/[^\\/]+)*'

      // case: /**
      // > A trailing `"/**"` matches everything inside.

      // #21: everything inside but it should not include the current folder
      : '\\/.+'
  ],

  // normal intermediate wildcards
  [
    // Never replace escaped '*'
    // ignore rule '\*' will match the path '*'

    // 'abc.*/' -> go
    // 'abc.*'  -> skip this rule,
    //    coz trailing single wildcard will be handed by [trailing wildcard]
    /(^|[^\\]+)(\\\*)+(?=.+)/g,

    // '*.js' matches '.js'
    // '*.js' doesn't match 'abc'
    (_, p1, p2) => {
      // 1.
      // > An asterisk "*" matches anything except a slash.
      // 2.
      // > Other consecutive asterisks are considered regular asterisks
      // > and will match according to the previous rules.
      const unescaped = p2.replace(/\\\*/g, '[^\\/]*')
      return p1 + unescaped
    }
  ],

  [
    // unescape, revert step 3 except for back slash
    // For example, if a user escape a '\\*',
    // after step 3, the result will be '\\\\\\*'
    /\\\\\\(?=[$.|*+(){^])/g,
    () => ESCAPE
  ],

  [
    // '\\\\' -> '\\'
    /\\\\/g,
    () => ESCAPE
  ],

  [
    // > The range notation, e.g. [a-zA-Z],
    // > can be used to match one of the characters in a range.

    // `\` is escaped by step 3
    /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
    (match, leadEscape, range, endEscape, close) => leadEscape === ESCAPE
      // '\\[bar]' -> '\\\\[bar\\]'
      ? `\\[${range}${cleanRangeBackSlash(endEscape)}${close}`
      : close === ']'
        ? endEscape.length % 2 === 0
          // A normal case, and it is a range notation
          // '[bar]'
          // '[bar\\\\]'
          ? `[${sanitizeRange(range)}${endEscape}]`
          // Invalid range notaton
          // '[bar\\]' -> '[bar\\\\]'
          : '[]'
        : '[]'
  ],

  // ending
  [
    // 'js' will not match 'js.'
    // 'ab' will not match 'abc'
    /(?:[^*])$/,

    // WTF!
    // https://git-scm.com/docs/gitignore
    // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
    // which re-fixes #24, #38

    // > If there is a separator at the end of the pattern then the pattern
    // > will only match directories, otherwise the pattern can match both
    // > files and directories.

    // 'js*' will not match 'a.js'
    // 'js/' will not match 'a.js'
    // 'js' will match 'a.js' and 'a.js/'
    match => /\/$/.test(match)
      // foo/ will not match 'foo'
      ? `${match}$`
      // foo matches 'foo' and 'foo/'
      : `${match}(?=$|\\/$)`
  ],

  // trailing wildcard
  [
    /(\^|\\\/)?\\\*$/,
    (_, p1) => {
      const prefix = p1
        // '\^':
        // '/*' does not match EMPTY
        // '/*' does not match everything

        // '\\\/':
        // 'abc/*' does not match 'abc/'
        ? `${p1}[^/]+`

        // 'a*' matches 'a'
        // 'a*' matches 'aa'
        : '[^/]*'

      return `${prefix}(?=$|\\/$)`
    }
  ],
]

// A simple cache, because an ignore rule only has only one certain meaning
const regexCache = Object.create(null)

// @param {pattern}
const makeRegex = (pattern, ignoreCase) => {
  let source = regexCache[pattern]

  if (!source) {
    source = REPLACERS.reduce(
      (prev, [matcher, replacer]) =>
        prev.replace(matcher, replacer.bind(pattern)),
      pattern
    )
    regexCache[pattern] = source
  }

  return ignoreCase
    ? new RegExp(source, 'i')
    : new RegExp(source)
}

const isString = subject => typeof subject === 'string'

// > A blank line matches no files, so it can serve as a separator for readability.
const checkPattern = pattern => pattern
  && isString(pattern)
  && !REGEX_TEST_BLANK_LINE.test(pattern)
  && !REGEX_INVALID_TRAILING_BACKSLASH.test(pattern)

  // > A line starting with # serves as a comment.
  && pattern.indexOf('#') !== 0

const splitPattern = pattern => pattern.split(REGEX_SPLITALL_CRLF)

class IgnoreRule {
  constructor (
    origin,
    pattern,
    negative,
    regex
  ) {
    this.origin = origin
    this.pattern = pattern
    this.negative = negative
    this.regex = regex
  }
}

const createRule = (pattern, ignoreCase) => {
  const origin = pattern
  let negative = false

  // > An optional prefix "!" which negates the pattern;
  if (pattern.indexOf('!') === 0) {
    negative = true
    pattern = pattern.substr(1)
  }

  pattern = pattern
  // > Put a backslash ("\") in front of the first "!" for patterns that
  // >   begin with a literal "!", for example, `"\!important!.txt"`.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_EXCLAMATION, '!')
  // > Put a backslash ("\") in front of the first hash for patterns that
  // >   begin with a hash.
  .replace(REGEX_REPLACE_LEADING_EXCAPED_HASH, '#')

  const regex = makeRegex(pattern, ignoreCase)

  return new IgnoreRule(
    origin,
    pattern,
    negative,
    regex
  )
}

const throwError = (message, Ctor) => {
  throw new Ctor(message)
}

const checkPath = (path, originalPath, doThrow) => {
  if (!isString(path)) {
    return doThrow(
      `path must be a string, but got \`${originalPath}\``,
      TypeError
    )
  }

  // We don't know if we should ignore EMPTY, so throw
  if (!path) {
    return doThrow(`path must not be empty`, TypeError)
  }

  // Check if it is a relative path
  if (checkPath.isNotRelative(path)) {
    const r = '`path.relative()`d'
    return doThrow(
      `path should be a ${r} string, but got "${originalPath}"`,
      RangeError
    )
  }

  return true
}

const isNotRelative = path => REGEX_TEST_INVALID_PATH.test(path)

checkPath.isNotRelative = isNotRelative
checkPath.convert = p => p

class Ignore {
  constructor ({
    ignorecase = true,
    ignoreCase = ignorecase,
    allowRelativePaths = false
  } = {}) {
    define(this, KEY_IGNORE, true)

    this._rules = []
    this._ignoreCase = ignoreCase
    this._allowRelativePaths = allowRelativePaths
    this._initCache()
  }

  _initCache () {
    this._ignoreCache = Object.create(null)
    this._testCache = Object.create(null)
  }

  _addPattern (pattern) {
    // #32
    if (pattern && pattern[KEY_IGNORE]) {
      this._rules = this._rules.concat(pattern._rules)
      this._added = true
      return
    }

    if (checkPattern(pattern)) {
      const rule = createRule(pattern, this._ignoreCase)
      this._added = true
      this._rules.push(rule)
    }
  }

  // @param {Array<string> | string | Ignore} pattern
  add (pattern) {
    this._added = false

    makeArray(
      isString(pattern)
        ? splitPattern(pattern)
        : pattern
    ).forEach(this._addPattern, this)

    // Some rules have just added to the ignore,
    // making the behavior changed.
    if (this._added) {
      this._initCache()
    }

    return this
  }

  // legacy
  addPattern (pattern) {
    return this.add(pattern)
  }

  //          |           ignored : unignored
  // negative |   0:0   |   0:1   |   1:0   |   1:1
  // -------- | ------- | ------- | ------- | --------
  //     0    |  TEST   |  TEST   |  SKIP   |    X
  //     1    |  TESTIF |  SKIP   |  TEST   |    X

  // - SKIP: always skip
  // - TEST: always test
  // - TESTIF: only test if checkUnignored
  // - X: that never happen

  // @param {boolean} whether should check if the path is unignored,
  //   setting `checkUnignored` to `false` could reduce additional
  //   path matching.

  // @returns {TestResult} true if a file is ignored
  _testOne (path, checkUnignored) {
    let ignored = false
    let unignored = false

    this._rules.forEach(rule => {
      const {negative} = rule
      if (
        unignored === negative && ignored !== unignored
        || negative && !ignored && !unignored && !checkUnignored
      ) {
        return
      }

      const matched = rule.regex.test(path)

      if (matched) {
        ignored = !negative
        unignored = negative
      }
    })

    return {
      ignored,
      unignored
    }
  }

  // @returns {TestResult}
  _test (originalPath, cache, checkUnignored, slices) {
    const path = originalPath
      // Supports nullable path
      && checkPath.convert(originalPath)

    checkPath(
      path,
      originalPath,
      this._allowRelativePaths
        ? RETURN_FALSE
        : throwError
    )

    return this._t(path, cache, checkUnignored, slices)
  }

  _t (path, cache, checkUnignored, slices) {
    if (path in cache) {
      return cache[path]
    }

    if (!slices) {
      // path/to/a.js
      // ['path', 'to', 'a.js']
      slices = path.split(SLASH)
    }

    slices.pop()

    // If the path has no parent directory, just test it
    if (!slices.length) {
      return cache[path] = this._testOne(path, checkUnignored)
    }

    const parent = this._t(
      slices.join(SLASH) + SLASH,
      cache,
      checkUnignored,
      slices
    )

    // If the path contains a parent directory, check the parent first
    return cache[path] = parent.ignored
      // > It is not possible to re-include a file if a parent directory of
      // >   that file is excluded.
      ? parent
      : this._testOne(path, checkUnignored)
  }

  ignores (path) {
    return this._test(path, this._ignoreCache, false).ignored
  }

  createFilter () {
    return path => !this.ignores(path)
  }

  filter (paths) {
    return makeArray(paths).filter(this.createFilter())
  }

  // @returns {TestResult}
  test (path) {
    return this._test(path, this._testCache, true)
  }
}

const factory = options => new Ignore(options)

const isPathValid = path =>
  checkPath(path && checkPath.convert(path), path, RETURN_FALSE)

factory.isPathValid = isPathValid

// Fixes typescript
factory.default = factory

module.exports = factory

// Windows
// --------------------------------------------------------------
/* istanbul ignore if */
if (
  // Detect `process` so that it can run in browsers.
  typeof process !== 'undefined'
  && (
    process.env && process.env.IGNORE_TEST_WIN32
    || process.platform === 'win32'
  )
) {
  /* eslint no-control-regex: "off" */
  const makePosix = str => /^\\\\\?\\/.test(str)
  || /["<>|\u0000-\u001F]+/u.test(str)
    ? str
    : str.replace(/\\/g, '/')

  checkPath.convert = makePosix

  // 'C:\\foo'     <- 'C:\\foo' has been converted to 'C:/'
  // 'd:\\foo'
  const REGIX_IS_WINDOWS_PATH_ABSOLUTE = /^[a-z]:\//i
  checkPath.isNotRelative = path =>
    REGIX_IS_WINDOWS_PATH_ABSOLUTE.test(path)
    || isNotRelative(path)
}


/***/ }),

/***/ 2324:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const pico = __nccwpck_require__(4174);
const utils = __nccwpck_require__(3625);

function picomatch(glob, options, returnState = false) {
  // default to os.platform()
  if (options && (options.windows === null || options.windows === undefined)) {
    // don't mutate the original options object
    options = { ...options, windows: utils.isWindows() };
  }

  return pico(glob, options, returnState);
}

Object.assign(picomatch, pico);
module.exports = picomatch;


/***/ }),

/***/ 789:
/***/ ((module) => {



const WIN_SLASH = '\\\\/';
const WIN_NO_SLASH = `[^${WIN_SLASH}]`;

/**
 * Posix glob regex
 */

const DOT_LITERAL = '\\.';
const PLUS_LITERAL = '\\+';
const QMARK_LITERAL = '\\?';
const SLASH_LITERAL = '\\/';
const ONE_CHAR = '(?=.)';
const QMARK = '[^/]';
const END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
const START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
const DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
const NO_DOT = `(?!${DOT_LITERAL})`;
const NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
const NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
const NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
const QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
const STAR = `${QMARK}*?`;
const SEP = '/';

const POSIX_CHARS = {
  DOT_LITERAL,
  PLUS_LITERAL,
  QMARK_LITERAL,
  SLASH_LITERAL,
  ONE_CHAR,
  QMARK,
  END_ANCHOR,
  DOTS_SLASH,
  NO_DOT,
  NO_DOTS,
  NO_DOT_SLASH,
  NO_DOTS_SLASH,
  QMARK_NO_DOT,
  STAR,
  START_ANCHOR,
  SEP
};

/**
 * Windows glob regex
 */

const WINDOWS_CHARS = {
  ...POSIX_CHARS,

  SLASH_LITERAL: `[${WIN_SLASH}]`,
  QMARK: WIN_NO_SLASH,
  STAR: `${WIN_NO_SLASH}*?`,
  DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
  NO_DOT: `(?!${DOT_LITERAL})`,
  NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
  NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
  QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
  START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
  END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
  SEP: '\\'
};

/**
 * POSIX Bracket Regex
 */

const POSIX_REGEX_SOURCE = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

module.exports = {
  MAX_LENGTH: 1024 * 64,
  POSIX_REGEX_SOURCE,

  // regular expressions
  REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
  REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
  REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
  REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
  REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
  REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,

  // Replace globs with equivalent patterns to reduce parsing time.
  REPLACEMENTS: {
    '***': '*',
    '**/**': '**',
    '**/**/**': '**'
  },

  // Digits
  CHAR_0: 48, /* 0 */
  CHAR_9: 57, /* 9 */

  // Alphabet chars.
  CHAR_UPPERCASE_A: 65, /* A */
  CHAR_LOWERCASE_A: 97, /* a */
  CHAR_UPPERCASE_Z: 90, /* Z */
  CHAR_LOWERCASE_Z: 122, /* z */

  CHAR_LEFT_PARENTHESES: 40, /* ( */
  CHAR_RIGHT_PARENTHESES: 41, /* ) */

  CHAR_ASTERISK: 42, /* * */

  // Non-alphabetic chars.
  CHAR_AMPERSAND: 38, /* & */
  CHAR_AT: 64, /* @ */
  CHAR_BACKWARD_SLASH: 92, /* \ */
  CHAR_CARRIAGE_RETURN: 13, /* \r */
  CHAR_CIRCUMFLEX_ACCENT: 94, /* ^ */
  CHAR_COLON: 58, /* : */
  CHAR_COMMA: 44, /* , */
  CHAR_DOT: 46, /* . */
  CHAR_DOUBLE_QUOTE: 34, /* " */
  CHAR_EQUAL: 61, /* = */
  CHAR_EXCLAMATION_MARK: 33, /* ! */
  CHAR_FORM_FEED: 12, /* \f */
  CHAR_FORWARD_SLASH: 47, /* / */
  CHAR_GRAVE_ACCENT: 96, /* ` */
  CHAR_HASH: 35, /* # */
  CHAR_HYPHEN_MINUS: 45, /* - */
  CHAR_LEFT_ANGLE_BRACKET: 60, /* < */
  CHAR_LEFT_CURLY_BRACE: 123, /* { */
  CHAR_LEFT_SQUARE_BRACKET: 91, /* [ */
  CHAR_LINE_FEED: 10, /* \n */
  CHAR_NO_BREAK_SPACE: 160, /* \u00A0 */
  CHAR_PERCENT: 37, /* % */
  CHAR_PLUS: 43, /* + */
  CHAR_QUESTION_MARK: 63, /* ? */
  CHAR_RIGHT_ANGLE_BRACKET: 62, /* > */
  CHAR_RIGHT_CURLY_BRACE: 125, /* } */
  CHAR_RIGHT_SQUARE_BRACKET: 93, /* ] */
  CHAR_SEMICOLON: 59, /* ; */
  CHAR_SINGLE_QUOTE: 39, /* ' */
  CHAR_SPACE: 32, /*   */
  CHAR_TAB: 9, /* \t */
  CHAR_UNDERSCORE: 95, /* _ */
  CHAR_VERTICAL_LINE: 124, /* | */
  CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279, /* \uFEFF */

  /**
   * Create EXTGLOB_CHARS
   */

  extglobChars(chars) {
    return {
      '!': { type: 'negate', open: '(?:(?!(?:', close: `))${chars.STAR})` },
      '?': { type: 'qmark', open: '(?:', close: ')?' },
      '+': { type: 'plus', open: '(?:', close: ')+' },
      '*': { type: 'star', open: '(?:', close: ')*' },
      '@': { type: 'at', open: '(?:', close: ')' }
    };
  },

  /**
   * Create GLOB_CHARS
   */

  globChars(win32) {
    return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
  }
};


/***/ }),

/***/ 3475:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const constants = __nccwpck_require__(789);
const utils = __nccwpck_require__(3625);

/**
 * Constants
 */

const {
  MAX_LENGTH,
  POSIX_REGEX_SOURCE,
  REGEX_NON_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_BACKREF,
  REPLACEMENTS
} = constants;

/**
 * Helpers
 */

const expandRange = (args, options) => {
  if (typeof options.expandRange === 'function') {
    return options.expandRange(...args, options);
  }

  args.sort();
  const value = `[${args.join('-')}]`;

  try {
    /* eslint-disable-next-line no-new */
    new RegExp(value);
  } catch (ex) {
    return args.map(v => utils.escapeRegex(v)).join('..');
  }

  return value;
};

/**
 * Create the message for a syntax error
 */

const syntaxError = (type, char) => {
  return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
};

/**
 * Parse the given input string.
 * @param {String} input
 * @param {Object} options
 * @return {Object}
 */

const parse = (input, options) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }

  input = REPLACEMENTS[input] || input;

  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;

  let len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  const bos = { type: 'bos', value: '', output: opts.prepend || '' };
  const tokens = [bos];

  const capture = opts.capture ? '' : '?:';

  // create constants based on platform, for windows or posix
  const PLATFORM_CHARS = constants.globChars(opts.windows);
  const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);

  const {
    DOT_LITERAL,
    PLUS_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOT_SLASH,
    NO_DOTS_SLASH,
    QMARK,
    QMARK_NO_DOT,
    STAR,
    START_ANCHOR
  } = PLATFORM_CHARS;

  const globstar = opts => {
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const nodot = opts.dot ? '' : NO_DOT;
  const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
  let star = opts.bash === true ? globstar(opts) : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  // minimatch options support
  if (typeof opts.noext === 'boolean') {
    opts.noextglob = opts.noext;
  }

  const state = {
    input,
    index: -1,
    start: 0,
    dot: opts.dot === true,
    consumed: '',
    output: '',
    prefix: '',
    backtrack: false,
    negated: false,
    brackets: 0,
    braces: 0,
    parens: 0,
    quotes: 0,
    globstar: false,
    tokens
  };

  input = utils.removePrefix(input, state);
  len = input.length;

  const extglobs = [];
  const braces = [];
  const stack = [];
  let prev = bos;
  let value;

  /**
   * Tokenizing helpers
   */

  const eos = () => state.index === len - 1;
  const peek = state.peek = (n = 1) => input[state.index + n];
  const advance = state.advance = () => input[++state.index] || '';
  const remaining = () => input.slice(state.index + 1);
  const consume = (value = '', num = 0) => {
    state.consumed += value;
    state.index += num;
  };

  const append = token => {
    state.output += token.output != null ? token.output : token.value;
    consume(token.value);
  };

  const negate = () => {
    let count = 1;

    while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
      advance();
      state.start++;
      count++;
    }

    if (count % 2 === 0) {
      return false;
    }

    state.negated = true;
    state.start++;
    return true;
  };

  const increment = type => {
    state[type]++;
    stack.push(type);
  };

  const decrement = type => {
    state[type]--;
    stack.pop();
  };

  /**
   * Push tokens onto the tokens array. This helper speeds up
   * tokenizing by 1) helping us avoid backtracking as much as possible,
   * and 2) helping us avoid creating extra tokens when consecutive
   * characters are plain text. This improves performance and simplifies
   * lookbehinds.
   */

  const push = tok => {
    if (prev.type === 'globstar') {
      const isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
      const isExtglob = tok.extglob === true || (extglobs.length && (tok.type === 'pipe' || tok.type === 'paren'));

      if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
        state.output = state.output.slice(0, -prev.output.length);
        prev.type = 'star';
        prev.value = '*';
        prev.output = star;
        state.output += prev.output;
      }
    }

    if (extglobs.length && tok.type !== 'paren') {
      extglobs[extglobs.length - 1].inner += tok.value;
    }

    if (tok.value || tok.output) append(tok);
    if (prev && prev.type === 'text' && tok.type === 'text') {
      prev.output = (prev.output || prev.value) + tok.value;
      prev.value += tok.value;
      return;
    }

    tok.prev = prev;
    tokens.push(tok);
    prev = tok;
  };

  const extglobOpen = (type, value) => {
    const token = { ...EXTGLOB_CHARS[value], conditions: 1, inner: '' };

    token.prev = prev;
    token.parens = state.parens;
    token.output = state.output;
    const output = (opts.capture ? '(' : '') + token.open;

    increment('parens');
    push({ type, value, output: state.output ? '' : ONE_CHAR });
    push({ type: 'paren', extglob: true, value: advance(), output });
    extglobs.push(token);
  };

  const extglobClose = token => {
    let output = token.close + (opts.capture ? ')' : '');
    let rest;

    if (token.type === 'negate') {
      let extglobStar = star;

      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
        extglobStar = globstar(opts);
      }

      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
        output = token.close = `)$))${extglobStar}`;
      }

      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
        // Any non-magical string (`.ts`) or even nested expression (`.{ts,tsx}`) can follow after the closing parenthesis.
        // In this case, we need to parse the string and use it in the output of the original pattern.
        // Suitable patterns: `/!(*.d).ts`, `/!(*.d).{ts,tsx}`, `**/!(*-dbg).@(js)`.
        //
        // Disabling the `fastpaths` option due to a problem with parsing strings as `.ts` in the pattern like `**/!(*.d).ts`.
        const expression = parse(rest, { ...options, fastpaths: false }).output;

        output = token.close = `)${expression})${extglobStar})`;
      }

      if (token.prev.type === 'bos') {
        state.negatedExtglob = true;
      }
    }

    push({ type: 'paren', extglob: true, value, output });
    decrement('parens');
  };

  /**
   * Fast paths
   */

  if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
    let backslashes = false;

    let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
      if (first === '\\') {
        backslashes = true;
        return m;
      }

      if (first === '?') {
        if (esc) {
          return esc + first + (rest ? QMARK.repeat(rest.length) : '');
        }
        if (index === 0) {
          return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
        }
        return QMARK.repeat(chars.length);
      }

      if (first === '.') {
        return DOT_LITERAL.repeat(chars.length);
      }

      if (first === '*') {
        if (esc) {
          return esc + first + (rest ? star : '');
        }
        return star;
      }
      return esc ? m : `\\${m}`;
    });

    if (backslashes === true) {
      if (opts.unescape === true) {
        output = output.replace(/\\/g, '');
      } else {
        output = output.replace(/\\+/g, m => {
          return m.length % 2 === 0 ? '\\\\' : (m ? '\\' : '');
        });
      }
    }

    if (output === input && opts.contains === true) {
      state.output = input;
      return state;
    }

    state.output = utils.wrapOutput(output, state, options);
    return state;
  }

  /**
   * Tokenize input until we reach end-of-string
   */

  while (!eos()) {
    value = advance();

    if (value === '\u0000') {
      continue;
    }

    /**
     * Escaped characters
     */

    if (value === '\\') {
      const next = peek();

      if (next === '/' && opts.bash !== true) {
        continue;
      }

      if (next === '.' || next === ';') {
        continue;
      }

      if (!next) {
        value += '\\';
        push({ type: 'text', value });
        continue;
      }

      // collapse slashes to reduce potential for exploits
      const match = /^\\+/.exec(remaining());
      let slashes = 0;

      if (match && match[0].length > 2) {
        slashes = match[0].length;
        state.index += slashes;
        if (slashes % 2 !== 0) {
          value += '\\';
        }
      }

      if (opts.unescape === true) {
        value = advance();
      } else {
        value += advance();
      }

      if (state.brackets === 0) {
        push({ type: 'text', value });
        continue;
      }
    }

    /**
     * If we're inside a regex character class, continue
     * until we reach the closing bracket.
     */

    if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
      if (opts.posix !== false && value === ':') {
        const inner = prev.value.slice(1);
        if (inner.includes('[')) {
          prev.posix = true;

          if (inner.includes(':')) {
            const idx = prev.value.lastIndexOf('[');
            const pre = prev.value.slice(0, idx);
            const rest = prev.value.slice(idx + 2);
            const posix = POSIX_REGEX_SOURCE[rest];
            if (posix) {
              prev.value = pre + posix;
              state.backtrack = true;
              advance();

              if (!bos.output && tokens.indexOf(prev) === 1) {
                bos.output = ONE_CHAR;
              }
              continue;
            }
          }
        }
      }

      if ((value === '[' && peek() !== ':') || (value === '-' && peek() === ']')) {
        value = `\\${value}`;
      }

      if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
        value = `\\${value}`;
      }

      if (opts.posix === true && value === '!' && prev.value === '[') {
        value = '^';
      }

      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * If we're inside a quoted string, continue
     * until we reach the closing double quote.
     */

    if (state.quotes === 1 && value !== '"') {
      value = utils.escapeRegex(value);
      prev.value += value;
      append({ value });
      continue;
    }

    /**
     * Double quotes
     */

    if (value === '"') {
      state.quotes = state.quotes === 1 ? 0 : 1;
      if (opts.keepQuotes === true) {
        push({ type: 'text', value });
      }
      continue;
    }

    /**
     * Parentheses
     */

    if (value === '(') {
      increment('parens');
      push({ type: 'paren', value });
      continue;
    }

    if (value === ')') {
      if (state.parens === 0 && opts.strictBrackets === true) {
        throw new SyntaxError(syntaxError('opening', '('));
      }

      const extglob = extglobs[extglobs.length - 1];
      if (extglob && state.parens === extglob.parens + 1) {
        extglobClose(extglobs.pop());
        continue;
      }

      push({ type: 'paren', value, output: state.parens ? ')' : '\\)' });
      decrement('parens');
      continue;
    }

    /**
     * Square brackets
     */

    if (value === '[') {
      if (opts.nobracket === true || !remaining().includes(']')) {
        if (opts.nobracket !== true && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('closing', ']'));
        }

        value = `\\${value}`;
      } else {
        increment('brackets');
      }

      push({ type: 'bracket', value });
      continue;
    }

    if (value === ']') {
      if (opts.nobracket === true || (prev && prev.type === 'bracket' && prev.value.length === 1)) {
        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      if (state.brackets === 0) {
        if (opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '['));
        }

        push({ type: 'text', value, output: `\\${value}` });
        continue;
      }

      decrement('brackets');

      const prevValue = prev.value.slice(1);
      if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
        value = `/${value}`;
      }

      prev.value += value;
      append({ value });

      // when literal brackets are explicitly disabled
      // assume we should match with a regex character class
      if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
        continue;
      }

      const escaped = utils.escapeRegex(prev.value);
      state.output = state.output.slice(0, -prev.value.length);

      // when literal brackets are explicitly enabled
      // assume we should escape the brackets to match literal characters
      if (opts.literalBrackets === true) {
        state.output += escaped;
        prev.value = escaped;
        continue;
      }

      // when the user specifies nothing, try to match both
      prev.value = `(${capture}${escaped}|${prev.value})`;
      state.output += prev.value;
      continue;
    }

    /**
     * Braces
     */

    if (value === '{' && opts.nobrace !== true) {
      increment('braces');

      const open = {
        type: 'brace',
        value,
        output: '(',
        outputIndex: state.output.length,
        tokensIndex: state.tokens.length
      };

      braces.push(open);
      push(open);
      continue;
    }

    if (value === '}') {
      const brace = braces[braces.length - 1];

      if (opts.nobrace === true || !brace) {
        push({ type: 'text', value, output: value });
        continue;
      }

      let output = ')';

      if (brace.dots === true) {
        const arr = tokens.slice();
        const range = [];

        for (let i = arr.length - 1; i >= 0; i--) {
          tokens.pop();
          if (arr[i].type === 'brace') {
            break;
          }
          if (arr[i].type !== 'dots') {
            range.unshift(arr[i].value);
          }
        }

        output = expandRange(range, opts);
        state.backtrack = true;
      }

      if (brace.comma !== true && brace.dots !== true) {
        const out = state.output.slice(0, brace.outputIndex);
        const toks = state.tokens.slice(brace.tokensIndex);
        brace.value = brace.output = '\\{';
        value = output = '\\}';
        state.output = out;
        for (const t of toks) {
          state.output += (t.output || t.value);
        }
      }

      push({ type: 'brace', value, output });
      decrement('braces');
      braces.pop();
      continue;
    }

    /**
     * Pipes
     */

    if (value === '|') {
      if (extglobs.length > 0) {
        extglobs[extglobs.length - 1].conditions++;
      }
      push({ type: 'text', value });
      continue;
    }

    /**
     * Commas
     */

    if (value === ',') {
      let output = value;

      const brace = braces[braces.length - 1];
      if (brace && stack[stack.length - 1] === 'braces') {
        brace.comma = true;
        output = '|';
      }

      push({ type: 'comma', value, output });
      continue;
    }

    /**
     * Slashes
     */

    if (value === '/') {
      // if the beginning of the glob is "./", advance the start
      // to the current index, and don't add the "./" characters
      // to the state. This greatly simplifies lookbehinds when
      // checking for BOS characters like "!" and "." (not "./")
      if (prev.type === 'dot' && state.index === state.start + 1) {
        state.start = state.index + 1;
        state.consumed = '';
        state.output = '';
        tokens.pop();
        prev = bos; // reset "prev" to the first token
        continue;
      }

      push({ type: 'slash', value, output: SLASH_LITERAL });
      continue;
    }

    /**
     * Dots
     */

    if (value === '.') {
      if (state.braces > 0 && prev.type === 'dot') {
        if (prev.value === '.') prev.output = DOT_LITERAL;
        const brace = braces[braces.length - 1];
        prev.type = 'dots';
        prev.output += value;
        prev.value += value;
        brace.dots = true;
        continue;
      }

      if ((state.braces + state.parens) === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
        push({ type: 'text', value, output: DOT_LITERAL });
        continue;
      }

      push({ type: 'dot', value, output: DOT_LITERAL });
      continue;
    }

    /**
     * Question marks
     */

    if (value === '?') {
      const isGroup = prev && prev.value === '(';
      if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('qmark', value);
        continue;
      }

      if (prev && prev.type === 'paren') {
        const next = peek();
        let output = value;

        if ((prev.value === '(' && !/[!=<:]/.test(next)) || (next === '<' && !/<([!=]|\w+>)/.test(remaining()))) {
          output = `\\${value}`;
        }

        push({ type: 'text', value, output });
        continue;
      }

      if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
        push({ type: 'qmark', value, output: QMARK_NO_DOT });
        continue;
      }

      push({ type: 'qmark', value, output: QMARK });
      continue;
    }

    /**
     * Exclamation
     */

    if (value === '!') {
      if (opts.noextglob !== true && peek() === '(') {
        if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
          extglobOpen('negate', value);
          continue;
        }
      }

      if (opts.nonegate !== true && state.index === 0) {
        negate();
        continue;
      }
    }

    /**
     * Plus
     */

    if (value === '+') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        extglobOpen('plus', value);
        continue;
      }

      if ((prev && prev.value === '(') || opts.regex === false) {
        push({ type: 'plus', value, output: PLUS_LITERAL });
        continue;
      }

      if ((prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace')) || state.parens > 0) {
        push({ type: 'plus', value });
        continue;
      }

      push({ type: 'plus', value: PLUS_LITERAL });
      continue;
    }

    /**
     * Plain text
     */

    if (value === '@') {
      if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
        push({ type: 'at', extglob: true, value, output: '' });
        continue;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Plain text
     */

    if (value !== '*') {
      if (value === '$' || value === '^') {
        value = `\\${value}`;
      }

      const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
      if (match) {
        value += match[0];
        state.index += match[0].length;
      }

      push({ type: 'text', value });
      continue;
    }

    /**
     * Stars
     */

    if (prev && (prev.type === 'globstar' || prev.star === true)) {
      prev.type = 'star';
      prev.star = true;
      prev.value += value;
      prev.output = star;
      state.backtrack = true;
      state.globstar = true;
      consume(value);
      continue;
    }

    let rest = remaining();
    if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
      extglobOpen('star', value);
      continue;
    }

    if (prev.type === 'star') {
      if (opts.noglobstar === true) {
        consume(value);
        continue;
      }

      const prior = prev.prev;
      const before = prior.prev;
      const isStart = prior.type === 'slash' || prior.type === 'bos';
      const afterStar = before && (before.type === 'star' || before.type === 'globstar');

      if (opts.bash === true && (!isStart || (rest[0] && rest[0] !== '/'))) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      const isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
      const isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');
      if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
        push({ type: 'star', value, output: '' });
        continue;
      }

      // strip consecutive `/**/`
      while (rest.slice(0, 3) === '/**') {
        const after = input[state.index + 4];
        if (after && after !== '/') {
          break;
        }
        rest = rest.slice(3);
        consume('/**', 3);
      }

      if (prior.type === 'bos' && eos()) {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = globstar(opts);
        state.output = prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
        prev.value += value;
        state.globstar = true;
        state.output += prior.output + prev.output;
        consume(value);
        continue;
      }

      if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
        const end = rest[1] !== void 0 ? '|$' : '';

        state.output = state.output.slice(0, -(prior.output + prev.output).length);
        prior.output = `(?:${prior.output}`;

        prev.type = 'globstar';
        prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
        prev.value += value;

        state.output += prior.output + prev.output;
        state.globstar = true;

        consume(value + advance());

        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      if (prior.type === 'bos' && rest[0] === '/') {
        prev.type = 'globstar';
        prev.value += value;
        prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
        state.output = prev.output;
        state.globstar = true;
        consume(value + advance());
        push({ type: 'slash', value: '/', output: '' });
        continue;
      }

      // remove single star from output
      state.output = state.output.slice(0, -prev.output.length);

      // reset previous token to globstar
      prev.type = 'globstar';
      prev.output = globstar(opts);
      prev.value += value;

      // reset output with globstar
      state.output += prev.output;
      state.globstar = true;
      consume(value);
      continue;
    }

    const token = { type: 'star', value, output: star };

    if (opts.bash === true) {
      token.output = '.*?';
      if (prev.type === 'bos' || prev.type === 'slash') {
        token.output = nodot + token.output;
      }
      push(token);
      continue;
    }

    if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
      token.output = value;
      push(token);
      continue;
    }

    if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
      if (prev.type === 'dot') {
        state.output += NO_DOT_SLASH;
        prev.output += NO_DOT_SLASH;

      } else if (opts.dot === true) {
        state.output += NO_DOTS_SLASH;
        prev.output += NO_DOTS_SLASH;

      } else {
        state.output += nodot;
        prev.output += nodot;
      }

      if (peek() !== '*') {
        state.output += ONE_CHAR;
        prev.output += ONE_CHAR;
      }
    }

    push(token);
  }

  while (state.brackets > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
    state.output = utils.escapeLast(state.output, '[');
    decrement('brackets');
  }

  while (state.parens > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
    state.output = utils.escapeLast(state.output, '(');
    decrement('parens');
  }

  while (state.braces > 0) {
    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
    state.output = utils.escapeLast(state.output, '{');
    decrement('braces');
  }

  if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
    push({ type: 'maybe_slash', value: '', output: `${SLASH_LITERAL}?` });
  }

  // rebuild the output if we had to backtrack at any point
  if (state.backtrack === true) {
    state.output = '';

    for (const token of state.tokens) {
      state.output += token.output != null ? token.output : token.value;

      if (token.suffix) {
        state.output += token.suffix;
      }
    }
  }

  return state;
};

/**
 * Fast paths for creating regular expressions for common glob patterns.
 * This can significantly speed up processing and has very little downside
 * impact when none of the fast paths match.
 */

parse.fastpaths = (input, options) => {
  const opts = { ...options };
  const max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
  const len = input.length;
  if (len > max) {
    throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
  }

  input = REPLACEMENTS[input] || input;

  // create constants based on platform, for windows or posix
  const {
    DOT_LITERAL,
    SLASH_LITERAL,
    ONE_CHAR,
    DOTS_SLASH,
    NO_DOT,
    NO_DOTS,
    NO_DOTS_SLASH,
    STAR,
    START_ANCHOR
  } = constants.globChars(opts.windows);

  const nodot = opts.dot ? NO_DOTS : NO_DOT;
  const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
  const capture = opts.capture ? '' : '?:';
  const state = { negated: false, prefix: '' };
  let star = opts.bash === true ? '.*?' : STAR;

  if (opts.capture) {
    star = `(${star})`;
  }

  const globstar = opts => {
    if (opts.noglobstar === true) return star;
    return `(${capture}(?:(?!${START_ANCHOR}${opts.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
  };

  const create = str => {
    switch (str) {
      case '*':
        return `${nodot}${ONE_CHAR}${star}`;

      case '.*':
        return `${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*.*':
        return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '*/*':
        return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;

      case '**':
        return nodot + globstar(opts);

      case '**/*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;

      case '**/*.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;

      case '**/.*':
        return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;

      default: {
        const match = /^(.*?)\.(\w+)$/.exec(str);
        if (!match) return;

        const source = create(match[1]);
        if (!source) return;

        return source + DOT_LITERAL + match[2];
      }
    }
  };

  const output = utils.removePrefix(input, state);
  let source = create(output);

  if (source && opts.strictSlashes !== true) {
    source += `${SLASH_LITERAL}?`;
  }

  return source;
};

module.exports = parse;


/***/ }),

/***/ 4174:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const scan = __nccwpck_require__(8543);
const parse = __nccwpck_require__(3475);
const utils = __nccwpck_require__(3625);
const constants = __nccwpck_require__(789);
const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

/**
 * Creates a matcher function from one or more glob patterns. The
 * returned function takes a string to match as its first argument,
 * and returns true if the string is a match. The returned matcher
 * function also takes a boolean as the second argument that, when true,
 * returns an object with additional information.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch(glob[, options]);
 *
 * const isMatch = picomatch('*.!(*a)');
 * console.log(isMatch('a.a')); //=> false
 * console.log(isMatch('a.b')); //=> true
 * ```
 * @name picomatch
 * @param {String|Array} `globs` One or more glob patterns.
 * @param {Object=} `options`
 * @return {Function=} Returns a matcher function.
 * @api public
 */

const picomatch = (glob, options, returnState = false) => {
  if (Array.isArray(glob)) {
    const fns = glob.map(input => picomatch(input, options, returnState));
    const arrayMatcher = str => {
      for (const isMatch of fns) {
        const state = isMatch(str);
        if (state) return state;
      }
      return false;
    };
    return arrayMatcher;
  }

  const isState = isObject(glob) && glob.tokens && glob.input;

  if (glob === '' || (typeof glob !== 'string' && !isState)) {
    throw new TypeError('Expected pattern to be a non-empty string');
  }

  const opts = options || {};
  const posix = opts.windows;
  const regex = isState
    ? picomatch.compileRe(glob, options)
    : picomatch.makeRe(glob, options, false, true);

  const state = regex.state;
  delete regex.state;

  let isIgnored = () => false;
  if (opts.ignore) {
    const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
    isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
  }

  const matcher = (input, returnObject = false) => {
    const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
    const result = { glob, state, regex, posix, input, output, match, isMatch };

    if (typeof opts.onResult === 'function') {
      opts.onResult(result);
    }

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === 'function') {
        opts.onIgnore(result);
      }
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === 'function') {
      opts.onMatch(result);
    }
    return returnObject ? result : true;
  };

  if (returnState) {
    matcher.state = state;
  }

  return matcher;
};

/**
 * Test `input` with the given `regex`. This is used by the main
 * `picomatch()` function to test the input string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.test(input, regex[, options]);
 *
 * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
 * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp} `regex`
 * @return {Object} Returns an object with matching info.
 * @api public
 */

picomatch.test = (input, regex, options, { glob, posix } = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError('Expected input to be a string');
  }

  if (input === '') {
    return { isMatch: false, output: '' };
  }

  const opts = options || {};
  const format = opts.format || (posix ? utils.toPosixSlashes : null);
  let match = input === glob;
  let output = (match && format) ? format(input) : input;

  if (match === false) {
    output = format ? format(input) : input;
    match = output === glob;
  }

  if (match === false || opts.capture === true) {
    if (opts.matchBase === true || opts.basename === true) {
      match = picomatch.matchBase(input, regex, options, posix);
    } else {
      match = regex.exec(output);
    }
  }

  return { isMatch: Boolean(match), match, output };
};

/**
 * Match the basename of a filepath.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.matchBase(input, glob[, options]);
 * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
 * ```
 * @param {String} `input` String to test.
 * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
 * @return {Boolean}
 * @api public
 */

picomatch.matchBase = (input, glob, options) => {
  const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
  return regex.test(utils.basename(input));
};

/**
 * Returns true if **any** of the given glob `patterns` match the specified `string`.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.isMatch(string, patterns[, options]);
 *
 * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
 * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
 * ```
 * @param {String|Array} str The string to test.
 * @param {String|Array} patterns One or more glob patterns to use for matching.
 * @param {Object} [options] See available [options](#options).
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

/**
 * Parse a glob pattern to create the source string for a regular
 * expression.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const result = picomatch.parse(pattern[, options]);
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
 * @api public
 */

picomatch.parse = (pattern, options) => {
  if (Array.isArray(pattern)) return pattern.map(p => picomatch.parse(p, options));
  return parse(pattern, { ...options, fastpaths: false });
};

/**
 * Scan a glob pattern to separate the pattern into segments.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.scan(input[, options]);
 *
 * const result = picomatch.scan('!./foo/*.js');
 * console.log(result);
 * { prefix: '!./',
 *   input: '!./foo/*.js',
 *   start: 3,
 *   base: 'foo',
 *   glob: '*.js',
 *   isBrace: false,
 *   isBracket: false,
 *   isGlob: true,
 *   isExtglob: false,
 *   isGlobstar: false,
 *   negated: true }
 * ```
 * @param {String} `input` Glob pattern to scan.
 * @param {Object} `options`
 * @return {Object} Returns an object with
 * @api public
 */

picomatch.scan = (input, options) => scan(input, options);

/**
 * Compile a regular expression from the `state` object returned by the
 * [parse()](#parse) method.
 *
 * @param {Object} `state`
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
 * @return {RegExp}
 * @api public
 */

picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
  if (returnOutput === true) {
    return state.output;
  }

  const opts = options || {};
  const prepend = opts.contains ? '' : '^';
  const append = opts.contains ? '' : '$';

  let source = `${prepend}(?:${state.output})${append}`;
  if (state && state.negated === true) {
    source = `^(?!${source}).*$`;
  }

  const regex = picomatch.toRegex(source, options);
  if (returnState === true) {
    regex.state = state;
  }

  return regex;
};

/**
 * Create a regular expression from a parsed glob pattern.
 *
 * ```js
 * const picomatch = require('picomatch');
 * const state = picomatch.parse('*.js');
 * // picomatch.compileRe(state[, options]);
 *
 * console.log(picomatch.compileRe(state));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `state` The object returned from the `.parse` method.
 * @param {Object} `options`
 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
  if (!input || typeof input !== 'string') {
    throw new TypeError('Expected a non-empty string');
  }

  let parsed = { negated: false, fastpaths: true };

  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
    parsed.output = parse.fastpaths(input, options);
  }

  if (!parsed.output) {
    parsed = parse(input, options);
  }

  return picomatch.compileRe(parsed, options, returnOutput, returnState);
};

/**
 * Create a regular expression from the given regex source string.
 *
 * ```js
 * const picomatch = require('picomatch');
 * // picomatch.toRegex(source[, options]);
 *
 * const { output } = picomatch.parse('*.js');
 * console.log(picomatch.toRegex(output));
 * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
 * ```
 * @param {String} `source` Regular expression source string.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

picomatch.toRegex = (source, options) => {
  try {
    const opts = options || {};
    return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
  } catch (err) {
    if (options && options.debug === true) throw err;
    return /$^/;
  }
};

/**
 * Picomatch constants.
 * @return {Object}
 */

picomatch.constants = constants;

/**
 * Expose "picomatch"
 */

module.exports = picomatch;


/***/ }),

/***/ 8543:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const utils = __nccwpck_require__(3625);
const {
  CHAR_ASTERISK,             /* * */
  CHAR_AT,                   /* @ */
  CHAR_BACKWARD_SLASH,       /* \ */
  CHAR_COMMA,                /* , */
  CHAR_DOT,                  /* . */
  CHAR_EXCLAMATION_MARK,     /* ! */
  CHAR_FORWARD_SLASH,        /* / */
  CHAR_LEFT_CURLY_BRACE,     /* { */
  CHAR_LEFT_PARENTHESES,     /* ( */
  CHAR_LEFT_SQUARE_BRACKET,  /* [ */
  CHAR_PLUS,                 /* + */
  CHAR_QUESTION_MARK,        /* ? */
  CHAR_RIGHT_CURLY_BRACE,    /* } */
  CHAR_RIGHT_PARENTHESES,    /* ) */
  CHAR_RIGHT_SQUARE_BRACKET  /* ] */
} = __nccwpck_require__(789);

const isPathSeparator = code => {
  return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
};

const depth = token => {
  if (token.isPrefix !== true) {
    token.depth = token.isGlobstar ? Infinity : 1;
  }
};

/**
 * Quickly scans a glob pattern and returns an object with a handful of
 * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
 *
 * ```js
 * const pm = require('picomatch');
 * console.log(pm.scan('foo/bar/*.js'));
 * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an object with tokens and regex source string.
 * @api public
 */

const scan = (input, options) => {
  const opts = options || {};

  const length = input.length - 1;
  const scanToEnd = opts.parts === true || opts.scanToEnd === true;
  const slashes = [];
  const tokens = [];
  const parts = [];

  let str = input;
  let index = -1;
  let start = 0;
  let lastIndex = 0;
  let isBrace = false;
  let isBracket = false;
  let isGlob = false;
  let isExtglob = false;
  let isGlobstar = false;
  let braceEscaped = false;
  let backslashes = false;
  let negated = false;
  let negatedExtglob = false;
  let finished = false;
  let braces = 0;
  let prev;
  let code;
  let token = { value: '', depth: 0, isGlob: false };

  const eos = () => index >= length;
  const peek = () => str.charCodeAt(index + 1);
  const advance = () => {
    prev = code;
    return str.charCodeAt(++index);
  };

  while (index < length) {
    code = advance();
    let next;

    if (code === CHAR_BACKWARD_SLASH) {
      backslashes = token.backslashes = true;
      code = advance();

      if (code === CHAR_LEFT_CURLY_BRACE) {
        braceEscaped = true;
      }
      continue;
    }

    if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
      braces++;

      while (eos() !== true && (code = advance())) {
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          continue;
        }

        if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (braceEscaped !== true && code === CHAR_COMMA) {
          isBrace = token.isBrace = true;
          isGlob = token.isGlob = true;
          finished = true;

          if (scanToEnd === true) {
            continue;
          }

          break;
        }

        if (code === CHAR_RIGHT_CURLY_BRACE) {
          braces--;

          if (braces === 0) {
            braceEscaped = false;
            isBrace = token.isBrace = true;
            finished = true;
            break;
          }
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (code === CHAR_FORWARD_SLASH) {
      slashes.push(index);
      tokens.push(token);
      token = { value: '', depth: 0, isGlob: false };

      if (finished === true) continue;
      if (prev === CHAR_DOT && index === (start + 1)) {
        start += 2;
        continue;
      }

      lastIndex = index + 1;
      continue;
    }

    if (opts.noext !== true) {
      const isExtglobChar = code === CHAR_PLUS
        || code === CHAR_AT
        || code === CHAR_ASTERISK
        || code === CHAR_QUESTION_MARK
        || code === CHAR_EXCLAMATION_MARK;

      if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;
        isExtglob = token.isExtglob = true;
        finished = true;
        if (code === CHAR_EXCLAMATION_MARK && index === start) {
          negatedExtglob = true;
        }

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          continue;
        }
        break;
      }
    }

    if (code === CHAR_ASTERISK) {
      if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_QUESTION_MARK) {
      isGlob = token.isGlob = true;
      finished = true;

      if (scanToEnd === true) {
        continue;
      }
      break;
    }

    if (code === CHAR_LEFT_SQUARE_BRACKET) {
      while (eos() !== true && (next = advance())) {
        if (next === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          advance();
          continue;
        }

        if (next === CHAR_RIGHT_SQUARE_BRACKET) {
          isBracket = token.isBracket = true;
          isGlob = token.isGlob = true;
          finished = true;
          break;
        }
      }

      if (scanToEnd === true) {
        continue;
      }

      break;
    }

    if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
      negated = token.negated = true;
      start++;
      continue;
    }

    if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
      isGlob = token.isGlob = true;

      if (scanToEnd === true) {
        while (eos() !== true && (code = advance())) {
          if (code === CHAR_LEFT_PARENTHESES) {
            backslashes = token.backslashes = true;
            code = advance();
            continue;
          }

          if (code === CHAR_RIGHT_PARENTHESES) {
            finished = true;
            break;
          }
        }
        continue;
      }
      break;
    }

    if (isGlob === true) {
      finished = true;

      if (scanToEnd === true) {
        continue;
      }

      break;
    }
  }

  if (opts.noext === true) {
    isExtglob = false;
    isGlob = false;
  }

  let base = str;
  let prefix = '';
  let glob = '';

  if (start > 0) {
    prefix = str.slice(0, start);
    str = str.slice(start);
    lastIndex -= start;
  }

  if (base && isGlob === true && lastIndex > 0) {
    base = str.slice(0, lastIndex);
    glob = str.slice(lastIndex);
  } else if (isGlob === true) {
    base = '';
    glob = str;
  } else {
    base = str;
  }

  if (base && base !== '' && base !== '/' && base !== str) {
    if (isPathSeparator(base.charCodeAt(base.length - 1))) {
      base = base.slice(0, -1);
    }
  }

  if (opts.unescape === true) {
    if (glob) glob = utils.removeBackslashes(glob);

    if (base && backslashes === true) {
      base = utils.removeBackslashes(base);
    }
  }

  const state = {
    prefix,
    input,
    start,
    base,
    glob,
    isBrace,
    isBracket,
    isGlob,
    isExtglob,
    isGlobstar,
    negated,
    negatedExtglob
  };

  if (opts.tokens === true) {
    state.maxDepth = 0;
    if (!isPathSeparator(code)) {
      tokens.push(token);
    }
    state.tokens = tokens;
  }

  if (opts.parts === true || opts.tokens === true) {
    let prevIndex;

    for (let idx = 0; idx < slashes.length; idx++) {
      const n = prevIndex ? prevIndex + 1 : start;
      const i = slashes[idx];
      const value = input.slice(n, i);
      if (opts.tokens) {
        if (idx === 0 && start !== 0) {
          tokens[idx].isPrefix = true;
          tokens[idx].value = prefix;
        } else {
          tokens[idx].value = value;
        }
        depth(tokens[idx]);
        state.maxDepth += tokens[idx].depth;
      }
      if (idx !== 0 || value !== '') {
        parts.push(value);
      }
      prevIndex = i;
    }

    if (prevIndex && prevIndex + 1 < input.length) {
      const value = input.slice(prevIndex + 1);
      parts.push(value);

      if (opts.tokens) {
        tokens[tokens.length - 1].value = value;
        depth(tokens[tokens.length - 1]);
        state.maxDepth += tokens[tokens.length - 1].depth;
      }
    }

    state.slashes = slashes;
    state.parts = parts;
  }

  return state;
};

module.exports = scan;


/***/ }),

/***/ 3625:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

/*global navigator*/


const {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL
} = __nccwpck_require__(789);

exports.isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
exports.hasRegexChars = str => REGEX_SPECIAL_CHARS.test(str);
exports.isRegexChar = str => str.length === 1 && exports.hasRegexChars(str);
exports.escapeRegex = str => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
exports.toPosixSlashes = str => str.replace(REGEX_BACKSLASH, '/');

exports.isWindows = () => {
  if (typeof navigator !== 'undefined' && navigator.platform) {
    const platform = navigator.platform.toLowerCase();
    return platform === 'win32' || platform === 'windows';
  }

  if (typeof process !== 'undefined' && process.platform) {
    return process.platform === 'win32';
  }

  return false;
};

exports.removeBackslashes = str => {
  return str.replace(REGEX_REMOVE_BACKSLASH, match => {
    return match === '\\' ? '' : match;
  });
};

exports.escapeLast = (input, char, lastIdx) => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

exports.removePrefix = (input, state = {}) => {
  let output = input;
  if (output.startsWith('./')) {
    output = output.slice(2);
    state.prefix = './';
  }
  return output;
};

exports.wrapOutput = (input, state = {}, options = {}) => {
  const prepend = options.contains ? '' : '^';
  const append = options.contains ? '' : '$';

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};

exports.basename = (path, { windows } = {}) => {
  const segs = path.split(windows ? /[\\/]/ : '/');
  const last = segs[segs.length - 1];

  if (last === '') {
    return segs[segs.length - 2];
  }

  return last;
};


/***/ }),

/***/ 1068:
/***/ ((module) => {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(() => {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = () => ([]);
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 1068;
module.exports = webpackEmptyAsyncContext;

/***/ }),

/***/ 5317:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("child_process");

/***/ }),

/***/ 6982:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("crypto");

/***/ }),

/***/ 9896:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");

/***/ }),

/***/ 7598:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:crypto");

/***/ }),

/***/ 857:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("os");

/***/ }),

/***/ 6928:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("path");

/***/ }),

/***/ 2018:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("tty");

/***/ }),

/***/ 496:
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"version":"1.40.1","name":"@dotenvx/dotenvx","description":"a better dotenv–from the creator of `dotenv`","author":"@motdotla","keywords":["dotenv","env"],"homepage":"https://github.com/dotenvx/dotenvx","repository":{"type":"git","url":"git+https://github.com/dotenvx/dotenvx.git"},"license":"BSD-3-Clause","files":["src/**/*","CHANGELOG.md"],"main":"src/lib/main.js","types":"src/lib/main.d.ts","exports":{".":{"types":"./src/lib/main.d.ts","require":"./src/lib/main.js","default":"./src/lib/main.js"},"./config":"./src/lib/config.js","./config.js":"./src/lib/config.js","./package.json":"./package.json"},"bin":{"dotenvx":"./src/cli/dotenvx.js","git-dotenvx":"./src/cli/dotenvx.js"},"scripts":{"standard":"standard","standard:fix":"standard --fix","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test-coverage":"tap run --show-full-coverage --timeout=60000","testshell":"bash shellspec","prerelease":"npm test && npm run testshell","release":"standard-version"},"funding":"https://dotenvx.com","dependencies":{"commander":"^11.1.0","dotenv":"^16.4.5","eciesjs":"^0.4.10","execa":"^5.1.1","fdir":"^6.2.0","ignore":"^5.3.0","object-treeify":"1.1.33","picomatch":"^4.0.2","which":"^4.0.0"},"devDependencies":{"@yao-pkg/pkg":"^5.14.2","capture-console":"^1.0.2","esbuild":"^0.24.0","proxyquire":"^2.1.3","sinon":"^14.0.1","standard":"^17.1.0","standard-version":"^9.5.0","tap":"^21.0.1"},"publishConfig":{"access":"public","provenance":true}}');

/***/ }),

/***/ 476:
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"name":"dotenv","version":"16.5.0","description":"Loads environment variables from .env file","main":"lib/main.js","types":"lib/main.d.ts","exports":{".":{"types":"./lib/main.d.ts","require":"./lib/main.js","default":"./lib/main.js"},"./config":"./config.js","./config.js":"./config.js","./lib/env-options":"./lib/env-options.js","./lib/env-options.js":"./lib/env-options.js","./lib/cli-options":"./lib/cli-options.js","./lib/cli-options.js":"./lib/cli-options.js","./package.json":"./package.json"},"scripts":{"dts-check":"tsc --project tests/types/tsconfig.json","lint":"standard","pretest":"npm run lint && npm run dts-check","test":"tap run --allow-empty-coverage --disable-coverage --timeout=60000","test:coverage":"tap run --show-full-coverage --timeout=60000 --coverage-report=lcov","prerelease":"npm test","release":"standard-version"},"repository":{"type":"git","url":"git://github.com/motdotla/dotenv.git"},"homepage":"https://github.com/motdotla/dotenv#readme","funding":"https://dotenvx.com","keywords":["dotenv","env",".env","environment","variables","config","settings"],"readmeFilename":"README.md","license":"BSD-2-Clause","devDependencies":{"@types/node":"^18.11.3","decache":"^4.6.2","sinon":"^14.0.1","standard":"^17.0.0","standard-version":"^9.5.0","tap":"^19.2.0","typescript":"^4.8.4"},"engines":{"node":">=12"},"browser":{"fs":false}}');

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  l: () => (/* binding */ sql)
});

// EXTERNAL MODULE: external "fs"
var external_fs_ = __nccwpck_require__(9896);
// EXTERNAL MODULE: external "path"
var external_path_ = __nccwpck_require__(6928);
;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres-shift@0.1.0/node_modules/postgres-shift/index.js



const join = external_path_.join

/* harmony default export */ async function postgres_shift({
  sql,
  path = join(process.cwd(), 'migrations'),
  before = null,
  after = null
}) {
  const migrations = external_fs_.readdirSync(path)
    .filter(x => external_fs_.statSync(join(path, x)).isDirectory() && x.match(/^[0-9]{5}_/))
    .sort()
    .map(x => ({
      path: join(path, x),
      migration_id: parseInt(x.slice(0, 5)),
      name: x.slice(6).replace(/-/g, ' ')
    }))

  const latest = migrations[migrations.length - 1]

  if (latest.migration_id !== migrations.length)
    throw new Error('Inconsistency in migration numbering')

  await ensureMigrationsTable()

  const current = await getCurrentMigration()
  const needed = migrations.slice(current ? current.id : 0)

  return sql.begin(next)

  async function next(sql) {
    const current = needed.shift()
    if (!current)
      return

    before && before(current)
    await run(sql, current)
    after && after(current)
    await next(sql)
  }

  async function run(sql, {
    path,
    migration_id,
    name
  }) {
    external_fs_.existsSync(join(path, 'index.sql')) && !external_fs_.existsSync(join(path, 'index.js'))
      ? await sql.file(join(path, 'index.sql'))
      : await __nccwpck_require__(1068)(join(path, 'index.js')).then(x => x.default(sql)) // eslint-disable-line

    await sql`
      insert into migrations (
        migration_id,
        name
      ) values (
        ${ migration_id },
        ${ name }
      )
    `
  }

  function getCurrentMigration() {
    return sql`
      select migration_id as id from migrations
      order by migration_id desc
      limit 1
    `.then(([x]) => x)
  }

  function ensureMigrationsTable() {
    return sql`
      select 'migrations'::regclass
    `.catch((err) => sql`
      create table migrations (
        migration_id serial primary key,
        created_at timestamp with time zone not null default now(),
        name text
      )
    `)
  }

}

// EXTERNAL MODULE: external "os"
var external_os_ = __nccwpck_require__(857);
;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/query.js
const originCache = new Map()
    , originStackCache = new Map()
    , originError = Symbol('OriginError')

const CLOSE = {}
class Query extends Promise {
  constructor(strings, args, handler, canceller, options = {}) {
    let resolve
      , reject

    super((a, b) => {
      resolve = a
      reject = b
    })

    this.tagged = Array.isArray(strings.raw)
    this.strings = strings
    this.args = args
    this.handler = handler
    this.canceller = canceller
    this.options = options

    this.state = null
    this.statement = null

    this.resolve = x => (this.active = false, resolve(x))
    this.reject = x => (this.active = false, reject(x))

    this.active = false
    this.cancelled = null
    this.executed = false
    this.signature = ''

    this[originError] = this.handler.debug
      ? new Error()
      : this.tagged && cachedError(this.strings)
  }

  get origin() {
    return (this.handler.debug
      ? this[originError].stack
      : this.tagged && originStackCache.has(this.strings)
        ? originStackCache.get(this.strings)
        : originStackCache.set(this.strings, this[originError].stack).get(this.strings)
    ) || ''
  }

  static get [Symbol.species]() {
    return Promise
  }

  cancel() {
    return this.canceller && (this.canceller(this), this.canceller = null)
  }

  simple() {
    this.options.simple = true
    this.options.prepare = false
    return this
  }

  async readable() {
    this.simple()
    this.streaming = true
    return this
  }

  async writable() {
    this.simple()
    this.streaming = true
    return this
  }

  cursor(rows = 1, fn) {
    this.options.simple = false
    if (typeof rows === 'function') {
      fn = rows
      rows = 1
    }

    this.cursorRows = rows

    if (typeof fn === 'function')
      return (this.cursorFn = fn, this)

    let prev
    return {
      [Symbol.asyncIterator]: () => ({
        next: () => {
          if (this.executed && !this.active)
            return { done: true }

          prev && prev()
          const promise = new Promise((resolve, reject) => {
            this.cursorFn = value => {
              resolve({ value, done: false })
              return new Promise(r => prev = r)
            }
            this.resolve = () => (this.active = false, resolve({ done: true }))
            this.reject = x => (this.active = false, reject(x))
          })
          this.execute()
          return promise
        },
        return() {
          prev && prev(CLOSE)
          return { done: true }
        }
      })
    }
  }

  describe() {
    this.options.simple = false
    this.onlyDescribe = this.options.prepare = true
    return this
  }

  stream() {
    throw new Error('.stream has been renamed to .forEach')
  }

  forEach(fn) {
    this.forEachFn = fn
    this.handle()
    return this
  }

  raw() {
    this.isRaw = true
    return this
  }

  values() {
    this.isRaw = 'values'
    return this
  }

  async handle() {
    !this.executed && (this.executed = true) && await 1 && this.handler(this)
  }

  execute() {
    this.handle()
    return this
  }

  then() {
    this.handle()
    return super.then.apply(this, arguments)
  }

  catch() {
    this.handle()
    return super.catch.apply(this, arguments)
  }

  finally() {
    this.handle()
    return super.finally.apply(this, arguments)
  }
}

function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs)

  const x = Error.stackTraceLimit
  Error.stackTraceLimit = 4
  originCache.set(xs, new Error())
  Error.stackTraceLimit = x
  return originCache.get(xs)
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/errors.js
class PostgresError extends Error {
  constructor(x) {
    super(x.message)
    this.name = this.constructor.name
    Object.assign(this, x)
  }
}

const Errors = {
  connection,
  postgres,
  generic,
  notSupported
}

function connection(x, options, socket) {
  const { host, port } = socket || options
  const error = Object.assign(
    new Error(('write ' + x + ' ' + (options.path || (host + ':' + port)))),
    {
      code: x,
      errno: x,
      address: options.path || host
    }, options.path ? {} : { port: port }
  )
  Error.captureStackTrace(error, connection)
  return error
}

function postgres(x) {
  const error = new PostgresError(x)
  Error.captureStackTrace(error, postgres)
  return error
}

function generic(code, message) {
  const error = Object.assign(new Error(code + ': ' + message), { code })
  Error.captureStackTrace(error, generic)
  return error
}

/* c8 ignore next 10 */
function notSupported(x) {
  const error = Object.assign(
    new Error(x + ' (B) is not supported'),
    {
      code: 'MESSAGE_NOT_SUPPORTED',
      name: x
    }
  )
  Error.captureStackTrace(error, notSupported)
  return error
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/types.js



const types = {
  string: {
    to: 25,
    from: null,             // defaults to string
    serialize: x => '' + x
  },
  number: {
    to: 0,
    from: [21, 23, 26, 700, 701],
    serialize: x => '' + x,
    parse: x => +x
  },
  json: {
    to: 114,
    from: [114, 3802],
    serialize: x => JSON.stringify(x),
    parse: x => JSON.parse(x)
  },
  boolean: {
    to: 16,
    from: 16,
    serialize: x => x === true ? 't' : 'f',
    parse: x => x === 't'
  },
  date: {
    to: 1184,
    from: [1082, 1114, 1184],
    serialize: x => (x instanceof Date ? x : new Date(x)).toISOString(),
    parse: x => new Date(x)
  },
  bytea: {
    to: 17,
    from: 17,
    serialize: x => '\\x' + Buffer.from(x).toString('hex'),
    parse: x => Buffer.from(x.slice(2), 'hex')
  }
}

class NotTagged { then() { notTagged() } catch() { notTagged() } finally() { notTagged() }}

class Identifier extends NotTagged {
  constructor(value) {
    super()
    this.value = escapeIdentifier(value)
  }
}

class Parameter extends NotTagged {
  constructor(value, type, array) {
    super()
    this.value = value
    this.type = type
    this.array = array
  }
}

class Builder extends NotTagged {
  constructor(first, rest) {
    super()
    this.first = first
    this.rest = rest
  }

  build(before, parameters, types, options) {
    const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b) => a.i - b.i).pop()
    return keyword.i === -1
      ? escapeIdentifiers(this.first, options)
      : keyword.fn(this.first, this.rest, parameters, types, options)
  }
}

function handleValue(x, parameters, types, options) {
  let value = x instanceof Parameter ? x.value : x
  if (value === undefined) {
    x instanceof Parameter
      ? x.value = options.transform.undefined
      : value = x = options.transform.undefined

    if (value === undefined)
      throw Errors.generic('UNDEFINED_VALUE', 'Undefined values are not allowed')
  }

  return '$' + (types.push(
    x instanceof Parameter
      ? (parameters.push(x.value), x.array
        ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value)
        : x.type
      )
      : (parameters.push(x), inferType(x))
  ))
}

const defaultHandlers = typeHandlers(types)

function stringify(q, string, value, parameters, types, options) { // eslint-disable-line
  for (let i = 1; i < q.strings.length; i++) {
    string += (stringifyValue(string, value, parameters, types, options)) + q.strings[i]
    value = q.args[i]
  }

  return string
}

function stringifyValue(string, value, parameters, types, o) {
  return (
    value instanceof Builder ? value.build(string, parameters, types, o) :
    value instanceof Query ? fragment(value, parameters, types, o) :
    value instanceof Identifier ? value.value :
    value && value[0] instanceof Query ? value.reduce((acc, x) => acc + ' ' + fragment(x, parameters, types, o), '') :
    handleValue(value, parameters, types, o)
  )
}

function fragment(q, parameters, types, options) {
  q.fragment = true
  return stringify(q, q.strings[0], q.args[0], parameters, types, options)
}

function valuesBuilder(first, parameters, types, columns, options) {
  return first.map(row =>
    '(' + columns.map(column =>
      stringifyValue('values', row[column], parameters, types, options)
    ).join(',') + ')'
  ).join(',')
}

function values(first, rest, parameters, types, options) {
  const multi = Array.isArray(first[0])
  const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first)
  return valuesBuilder(multi ? first : [first], parameters, types, columns, options)
}

function types_select(first, rest, parameters, types, options) {
  typeof first === 'string' && (first = [first].concat(rest))
  if (Array.isArray(first))
    return escapeIdentifiers(first, options)

  let value
  const columns = rest.length ? rest.flat() : Object.keys(first)
  return columns.map(x => {
    value = first[x]
    return (
      value instanceof Query ? fragment(value, parameters, types, options) :
      value instanceof Identifier ? value.value :
      handleValue(value, parameters, types, options)
    ) + ' as ' + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x)
  }).join(',')
}

const builders = Object.entries({
  values,
  in: (...xs) => {
    const x = values(...xs)
    return x === '()' ? '(null)' : x
  },
  select: types_select,
  as: types_select,
  returning: types_select,
  '\\(': types_select,

  update(first, rest, parameters, types, options) {
    return (rest.length ? rest.flat() : Object.keys(first)).map(x =>
      escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) +
      '=' + stringifyValue('values', first[x], parameters, types, options)
    )
  },

  insert(first, rest, parameters, types, options) {
    const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first)
    return '(' + escapeIdentifiers(columns, options) + ')values' +
    valuesBuilder(Array.isArray(first) ? first : [first], parameters, types, columns, options)
  }
}).map(([x, fn]) => ([new RegExp('((?:^|[\\s(])' + x + '(?:$|[\\s(]))(?![\\s\\S]*\\1)', 'i'), fn]))

function notTagged() {
  throw Errors.generic('NOT_TAGGED_CALL', 'Query not called as a tagged template literal')
}

const serializers = defaultHandlers.serializers
const parsers = defaultHandlers.parsers

const END = {}

function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0])
  return typeof x === 'string' ? 1009 : 0
}

const mergeUserTypes = function(types) {
  const user = typeHandlers(types || {})
  return {
    serializers: Object.assign({}, serializers, user.serializers),
    parsers: Object.assign({}, parsers, user.parsers)
  }
}

function typeHandlers(types) {
  return Object.keys(types).reduce((acc, k) => {
    types[k].from && [].concat(types[k].from).forEach(x => acc.parsers[x] = types[k].parse)
    if (types[k].serialize) {
      acc.serializers[types[k].to] = types[k].serialize
      types[k].from && [].concat(types[k].from).forEach(x => acc.serializers[x] = types[k].serialize)
    }
    return acc
  }, { parsers: {}, serializers: {} })
}

function escapeIdentifiers(xs, { transform: { column } }) {
  return xs.map(x => escapeIdentifier(column.to ? column.to(x) : x)).join(',')
}

const escapeIdentifier = function escape(str) {
  return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"'
}

const inferType = function inferType(x) {
  return (
    x instanceof Parameter ? x.type :
    x instanceof Date ? 1184 :
    x instanceof Uint8Array ? 17 :
    (x === true || x === false) ? 16 :
    typeof x === 'bigint' ? 20 :
    Array.isArray(x) ? inferType(x[0]) :
    0
  )
}

const escapeBackslash = /\\/g
const escapeQuote = /"/g

function arrayEscape(x) {
  return x
    .replace(escapeBackslash, '\\\\')
    .replace(escapeQuote, '\\"')
}

const arraySerializer = function arraySerializer(xs, serializer, options, typarray) {
  if (Array.isArray(xs) === false)
    return xs

  if (!xs.length)
    return '{}'

  const first = xs[0]
  // Only _box (1020) has the ';' delimiter for arrays, all other types use the ',' delimiter
  const delimiter = typarray === 1020 ? ';' : ','

  if (Array.isArray(first) && !first.type)
    return '{' + xs.map(x => arraySerializer(x, serializer, options, typarray)).join(delimiter) + '}'

  return '{' + xs.map(x => {
    if (x === undefined) {
      x = options.transform.undefined
      if (x === undefined)
        throw Errors.generic('UNDEFINED_VALUE', 'Undefined values are not allowed')
    }

    return x === null
      ? 'null'
      : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : '' + x) + '"'
  }).join(delimiter) + '}'
}

const arrayParserState = {
  i: 0,
  char: null,
  str: '',
  quoted: false,
  last: 0
}

const arrayParser = function arrayParser(x, parser, typarray) {
  arrayParserState.i = arrayParserState.last = 0
  return arrayParserLoop(arrayParserState, x, parser, typarray)
}

function arrayParserLoop(s, x, parser, typarray) {
  const xs = []
  // Only _box (1020) has the ';' delimiter for arrays, all other types use the ',' delimiter
  const delimiter = typarray === 1020 ? ';' : ','
  for (; s.i < x.length; s.i++) {
    s.char = x[s.i]
    if (s.quoted) {
      if (s.char === '\\') {
        s.str += x[++s.i]
      } else if (s.char === '"') {
        xs.push(parser ? parser(s.str) : s.str)
        s.str = ''
        s.quoted = x[s.i + 1] === '"'
        s.last = s.i + 2
      } else {
        s.str += s.char
      }
    } else if (s.char === '"') {
      s.quoted = true
    } else if (s.char === '{') {
      s.last = ++s.i
      xs.push(arrayParserLoop(s, x, parser, typarray))
    } else if (s.char === '}') {
      s.quoted = false
      s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i))
      s.last = s.i + 1
      break
    } else if (s.char === delimiter && s.p !== '}' && s.p !== '"') {
      xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i))
      s.last = s.i + 1
    }
    s.p = s.char
  }
  s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1))
  return xs
}

const toCamel = x => {
  let str = x[0]
  for (let i = 1; i < x.length; i++)
    str += x[i] === '_' ? x[++i].toUpperCase() : x[i]
  return str
}

const toPascal = x => {
  let str = x[0].toUpperCase()
  for (let i = 1; i < x.length; i++)
    str += x[i] === '_' ? x[++i].toUpperCase() : x[i]
  return str
}

const toKebab = x => x.replace(/_/g, '-')

const fromCamel = x => x.replace(/([A-Z])/g, '_$1').toLowerCase()
const fromPascal = x => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, '_$1')).toLowerCase()
const fromKebab = x => x.replace(/-/g, '_')

function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === 'object' && x !== null && (column.type === 114 || column.type === 3802)
      ? Array.isArray(x)
        ? x.map(x => jsonTransform(x, column))
        : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {})
      : x
  }
}

toCamel.column = { from: toCamel }
toCamel.value = { from: createJsonTransform(toCamel) }
fromCamel.column = { to: fromCamel }

const camel = { ...toCamel }
camel.column.to = fromCamel

toPascal.column = { from: toPascal }
toPascal.value = { from: createJsonTransform(toPascal) }
fromPascal.column = { to: fromPascal }

const pascal = { ...toPascal }
pascal.column.to = fromPascal

toKebab.column = { from: toKebab }
toKebab.value = { from: createJsonTransform(toKebab) }
fromKebab.column = { to: fromKebab }

const kebab = { ...toKebab }
kebab.column.to = fromKebab

;// CONCATENATED MODULE: external "net"
const external_net_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("net");
;// CONCATENATED MODULE: external "tls"
const external_tls_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("tls");
// EXTERNAL MODULE: external "crypto"
var external_crypto_ = __nccwpck_require__(6982);
;// CONCATENATED MODULE: external "stream"
const external_stream_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("stream");
;// CONCATENATED MODULE: external "perf_hooks"
const external_perf_hooks_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("perf_hooks");
;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/result.js
class Result extends Array {
  constructor() {
    super()
    Object.defineProperties(this, {
      count: { value: null, writable: true },
      state: { value: null, writable: true },
      command: { value: null, writable: true },
      columns: { value: null, writable: true },
      statement: { value: null, writable: true }
    })
  }

  static get [Symbol.species]() {
    return Array
  }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/queue.js
/* harmony default export */ const src_queue = (Queue);

function Queue(initial = []) {
  let xs = initial.slice()
  let index = 0

  return {
    get length() {
      return xs.length - index
    },
    remove: (x) => {
      const index = xs.indexOf(x)
      return index === -1
        ? null
        : (xs.splice(index, 1), x)
    },
    push: (x) => (xs.push(x), x),
    shift: () => {
      const out = xs[index++]

      if (index === xs.length) {
        index = 0
        xs = []
      } else {
        xs[index - 1] = undefined
      }

      return out
    }
  }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/bytes.js
const size = 256
let buffer = Buffer.allocUnsafe(size)

const messages = 'BCcDdEFfHPpQSX'.split('').reduce((acc, x) => {
  const v = x.charCodeAt(0)
  acc[x] = () => {
    buffer[0] = v
    b.i = 5
    return b
  }
  return acc
}, {})

const b = Object.assign(bytes_reset, messages, {
  N: String.fromCharCode(0),
  i: 0,
  inc(x) {
    b.i += x
    return b
  },
  str(x) {
    const length = Buffer.byteLength(x)
    fit(length)
    b.i += buffer.write(x, b.i, length, 'utf8')
    return b
  },
  i16(x) {
    fit(2)
    buffer.writeUInt16BE(x, b.i)
    b.i += 2
    return b
  },
  i32(x, i) {
    if (i || i === 0) {
      buffer.writeUInt32BE(x, i)
      return b
    }
    fit(4)
    buffer.writeUInt32BE(x, b.i)
    b.i += 4
    return b
  },
  z(x) {
    fit(x)
    buffer.fill(0, b.i, b.i + x)
    b.i += x
    return b
  },
  raw(x) {
    buffer = Buffer.concat([buffer.subarray(0, b.i), x])
    b.i = buffer.length
    return b
  },
  end(at = 1) {
    buffer.writeUInt32BE(b.i - at, at)
    const out = buffer.subarray(0, b.i)
    b.i = 0
    buffer = Buffer.allocUnsafe(size)
    return out
  }
})

/* harmony default export */ const bytes = (b);

function fit(x) {
  if (buffer.length - b.i < x) {
    const prev = buffer
        , length = prev.length

    buffer = Buffer.allocUnsafe(length + (length >> 1) + x)
    prev.copy(buffer)
  }
}

function bytes_reset() {
  b.i = 0
  return b
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/connection.js













/* harmony default export */ const src_connection = (Connection);

let uid = 1

const Sync = bytes().S().end()
    , Flush = bytes().H().end()
    , SSLRequest = bytes().i32(8).i32(80877103).end(8)
    , ExecuteUnnamed = Buffer.concat([bytes().E().str(bytes.N).i32(0).end(), Sync])
    , DescribeUnnamed = bytes().D().str('S').str(bytes.N).end()
    , noop = () => { /* noop */ }

const retryRoutines = new Set([
  'FetchPreparedStatement',
  'RevalidateCachedQuery',
  'transformAssignedExpr'
])

const errorFields = {
  83  : 'severity_local',    // S
  86  : 'severity',          // V
  67  : 'code',              // C
  77  : 'message',           // M
  68  : 'detail',            // D
  72  : 'hint',              // H
  80  : 'position',          // P
  112 : 'internal_position', // p
  113 : 'internal_query',    // q
  87  : 'where',             // W
  115 : 'schema_name',       // s
  116 : 'table_name',        // t
  99  : 'column_name',       // c
  100 : 'data type_name',    // d
  110 : 'constraint_name',   // n
  70  : 'file',              // F
  76  : 'line',              // L
  82  : 'routine'            // R
}

function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
  const {
    ssl,
    max,
    user,
    host,
    port,
    database,
    parsers,
    transform,
    onnotice,
    onnotify,
    onparameter,
    max_pipeline,
    keep_alive,
    backoff,
    target_session_attrs
  } = options

  const sent = src_queue()
      , id = uid++
      , backend = { pid: null, secret: null }
      , idleTimer = timer(end, options.idle_timeout)
      , lifeTimer = timer(end, options.max_lifetime)
      , connectTimer = timer(connectTimedOut, options.connect_timeout)

  let socket = null
    , cancelMessage
    , result = new Result()
    , incoming = Buffer.alloc(0)
    , needsTypes = options.fetch_types
    , backendParameters = {}
    , statements = {}
    , statementId = Math.random().toString(36).slice(2)
    , statementCount = 1
    , closedDate = 0
    , remaining = 0
    , hostIndex = 0
    , retries = 0
    , length = 0
    , delay = 0
    , rows = 0
    , serverSignature = null
    , nextWriteTimer = null
    , terminated = false
    , incomings = null
    , results = null
    , initial = null
    , ending = null
    , stream = null
    , chunk = null
    , ended = null
    , nonce = null
    , query = null
    , final = null

  const connection = {
    queue: queues.closed,
    idleTimer,
    connect(query) {
      initial = query || true
      reconnect()
    },
    terminate,
    execute,
    cancel,
    end,
    count: 0,
    id
  }

  queues.closed && queues.closed.push(connection)

  return connection

  async function createSocket() {
    let x
    try {
      x = options.socket
        ? (await Promise.resolve(options.socket(options)))
        : new external_net_namespaceObject.Socket()
    } catch (e) {
      error(e)
      return
    }
    x.on('error', error)
    x.on('close', closed)
    x.on('drain', drain)
    return x
  }

  async function cancel({ pid, secret }, resolve, reject) {
    try {
      cancelMessage = bytes().i32(16).i32(80877102).i32(pid).i32(secret).end(16)
      await connect()
      socket.once('error', reject)
      socket.once('close', resolve)
    } catch (error) {
      reject(error)
    }
  }

  function execute(q) {
    if (terminated)
      return queryError(q, Errors.connection('CONNECTION_DESTROYED', options))

    if (q.cancelled)
      return

    try {
      q.state = backend
      query
        ? sent.push(q)
        : (query = q, query.active = true)

      build(q)
      return write(toBuffer(q))
        && !q.describeFirst
        && !q.cursorFn
        && sent.length < max_pipeline
        && (!q.options.onexecute || q.options.onexecute(connection))
    } catch (error) {
      sent.length === 0 && write(Sync)
      errored(error)
      return true
    }
  }

  function toBuffer(q) {
    if (q.parameters.length >= 65534)
      throw Errors.generic('MAX_PARAMETERS_EXCEEDED', 'Max number of parameters (65534) exceeded')

    return q.options.simple
      ? bytes().Q().str(q.statement.string + bytes.N).end()
      : q.describeFirst
        ? Buffer.concat([describe(q), Flush])
        : q.prepare
          ? q.prepared
            ? prepared(q)
            : Buffer.concat([describe(q), prepared(q)])
          : unnamed(q)
  }

  function describe(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
      Describe('S', q.statement.name)
    ])
  }

  function prepared(q) {
    return Buffer.concat([
      Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
      q.cursorFn
        ? Execute('', q.cursorRows)
        : ExecuteUnnamed
    ])
  }

  function unnamed(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types),
      DescribeUnnamed,
      prepared(q)
    ])
  }

  function build(q) {
    const parameters = []
        , types = []

    const string = stringify(q, q.strings[0], q.args[0], parameters, types, options)

    !q.tagged && q.args.forEach(x => handleValue(x, parameters, types, options))

    q.prepare = options.prepare && ('prepare' in q.options ? q.options.prepare : true)
    q.string = string
    q.signature = q.prepare && types + string
    q.onlyDescribe && (delete statements[q.signature])
    q.parameters = q.parameters || parameters
    q.prepared = q.prepare && q.signature in statements
    q.describeFirst = q.onlyDescribe || (parameters.length && !q.prepared)
    q.statement = q.prepared
      ? statements[q.signature]
      : { string, types, name: q.prepare ? statementId + statementCount++ : '' }

    typeof options.debug === 'function' && options.debug(id, string, parameters, types)
  }

  function write(x, fn) {
    chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x)
    if (fn || chunk.length >= 1024)
      return nextWrite(fn)
    nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite))
    return true
  }

  function nextWrite(fn) {
    const x = socket.write(chunk, fn)
    nextWriteTimer !== null && clearImmediate(nextWriteTimer)
    chunk = nextWriteTimer = null
    return x
  }

  function connectTimedOut() {
    errored(Errors.connection('CONNECT_TIMEOUT', options, socket))
    socket.destroy()
  }

  async function secure() {
    write(SSLRequest)
    const canSSL = await new Promise(r => socket.once('data', x => r(x[0] === 83))) // S

    if (!canSSL && ssl === 'prefer')
      return connected()

    socket.removeAllListeners()
    socket = external_tls_namespaceObject.connect({
      socket,
      servername: external_net_namespaceObject.isIP(socket.host) ? undefined : socket.host,
      ...(ssl === 'require' || ssl === 'allow' || ssl === 'prefer'
        ? { rejectUnauthorized: false }
        : ssl === 'verify-full'
          ? {}
          : typeof ssl === 'object'
            ? ssl
            : {}
      )
    })
    socket.on('secureConnect', connected)
    socket.on('error', error)
    socket.on('close', closed)
    socket.on('drain', drain)
  }

  /* c8 ignore next 3 */
  function drain() {
    !query && onopen(connection)
  }

  function data(x) {
    if (incomings) {
      incomings.push(x)
      remaining -= x.length
      if (remaining >= 0)
        return
    }

    incoming = incomings
      ? Buffer.concat(incomings, length - remaining)
      : incoming.length === 0
        ? x
        : Buffer.concat([incoming, x], incoming.length + x.length)

    while (incoming.length > 4) {
      length = incoming.readUInt32BE(1)
      if (length >= incoming.length) {
        remaining = length - incoming.length
        incomings = [incoming]
        break
      }

      try {
        handle(incoming.subarray(0, length + 1))
      } catch (e) {
        query && (query.cursorFn || query.describeFirst) && write(Sync)
        errored(e)
      }
      incoming = incoming.subarray(length + 1)
      remaining = 0
      incomings = null
    }
  }

  async function connect() {
    terminated = false
    backendParameters = {}
    socket || (socket = await createSocket())

    if (!socket)
      return

    connectTimer.start()

    if (options.socket)
      return ssl ? secure() : connected()

    socket.on('connect', ssl ? secure : connected)

    if (options.path)
      return socket.connect(options.path)

    socket.ssl = ssl
    socket.connect(port[hostIndex], host[hostIndex])
    socket.host = host[hostIndex]
    socket.port = port[hostIndex]

    hostIndex = (hostIndex + 1) % port.length
  }

  function reconnect() {
    setTimeout(connect, closedDate ? closedDate + delay - external_perf_hooks_namespaceObject.performance.now() : 0)
  }

  function connected() {
    try {
      statements = {}
      needsTypes = options.fetch_types
      statementId = Math.random().toString(36).slice(2)
      statementCount = 1
      lifeTimer.start()
      socket.on('data', data)
      keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1000 * keep_alive)
      const s = StartupMessage()
      write(s)
    } catch (err) {
      error(err)
    }
  }

  function error(err) {
    if (connection.queue === queues.connecting && options.host[retries + 1])
      return

    errored(err)
    while (sent.length)
      queryError(sent.shift(), err)
  }

  function errored(err) {
    stream && (stream.destroy(err), stream = null)
    query && queryError(query, err)
    initial && (queryError(initial, err), initial = null)
  }

  function queryError(query, err) {
    'query' in err || 'parameters' in err || Object.defineProperties(err, {
      stack: { value: err.stack + query.origin.replace(/.*\n/, '\n'), enumerable: options.debug },
      query: { value: query.string, enumerable: options.debug },
      parameters: { value: query.parameters, enumerable: options.debug },
      args: { value: query.args, enumerable: options.debug },
      types: { value: query.statement && query.statement.types, enumerable: options.debug }
    })
    query.reject(err)
  }

  function end() {
    return ending || (
      !connection.reserved && onend(connection),
      !connection.reserved && !initial && !query && sent.length === 0
        ? (terminate(), new Promise(r => socket && socket.readyState !== 'closed' ? socket.once('close', r) : r()))
        : ending = new Promise(r => ended = r)
    )
  }

  function terminate() {
    terminated = true
    if (stream || query || initial || sent.length)
      error(Errors.connection('CONNECTION_DESTROYED', options))

    clearImmediate(nextWriteTimer)
    if (socket) {
      socket.removeListener('data', data)
      socket.removeListener('connect', connected)
      socket.readyState === 'open' && socket.end(bytes().X().end())
    }
    ended && (ended(), ending = ended = null)
  }

  async function closed(hadError) {
    incoming = Buffer.alloc(0)
    remaining = 0
    incomings = null
    clearImmediate(nextWriteTimer)
    socket.removeListener('data', data)
    socket.removeListener('connect', connected)
    idleTimer.cancel()
    lifeTimer.cancel()
    connectTimer.cancel()

    socket.removeAllListeners()
    socket = null

    if (initial)
      return reconnect()

    !hadError && (query || sent.length) && error(Errors.connection('CONNECTION_CLOSED', options, socket))
    closedDate = external_perf_hooks_namespaceObject.performance.now()
    hadError && options.shared.retries++
    delay = (typeof backoff === 'function' ? backoff(options.shared.retries) : backoff) * 1000
    onclose(connection, Errors.connection('CONNECTION_CLOSED', options, socket))
  }

  /* Handlers */
  function handle(xs, x = xs[0]) {
    (
      x === 68 ? DataRow :                   // D
      x === 100 ? CopyData :                 // d
      x === 65 ? NotificationResponse :      // A
      x === 83 ? ParameterStatus :           // S
      x === 90 ? ReadyForQuery :             // Z
      x === 67 ? CommandComplete :           // C
      x === 50 ? BindComplete :              // 2
      x === 49 ? ParseComplete :             // 1
      x === 116 ? ParameterDescription :     // t
      x === 84 ? RowDescription :            // T
      x === 82 ? Authentication :            // R
      x === 110 ? NoData :                   // n
      x === 75 ? BackendKeyData :            // K
      x === 69 ? ErrorResponse :             // E
      x === 115 ? PortalSuspended :          // s
      x === 51 ? CloseComplete :             // 3
      x === 71 ? CopyInResponse :            // G
      x === 78 ? NoticeResponse :            // N
      x === 72 ? CopyOutResponse :           // H
      x === 99 ? CopyDone :                  // c
      x === 73 ? EmptyQueryResponse :        // I
      x === 86 ? FunctionCallResponse :      // V
      x === 118 ? NegotiateProtocolVersion : // v
      x === 87 ? CopyBothResponse :          // W
      /* c8 ignore next */
      UnknownMessage
    )(xs)
  }

  function DataRow(x) {
    let index = 7
    let length
    let column
    let value

    const row = query.isRaw ? new Array(query.statement.columns.length) : {}
    for (let i = 0; i < query.statement.columns.length; i++) {
      column = query.statement.columns[i]
      length = x.readInt32BE(index)
      index += 4

      value = length === -1
        ? null
        : query.isRaw === true
          ? x.subarray(index, index += length)
          : column.parser === undefined
            ? x.toString('utf8', index, index += length)
            : column.parser.array === true
              ? column.parser(x.toString('utf8', index + 1, index += length))
              : column.parser(x.toString('utf8', index, index += length))

      query.isRaw
        ? (row[i] = query.isRaw === true
          ? value
          : transform.value.from ? transform.value.from(value, column) : value)
        : (row[column.name] = transform.value.from ? transform.value.from(value, column) : value)
    }

    query.forEachFn
      ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result)
      : (result[rows++] = transform.row.from ? transform.row.from(row) : row)
  }

  function ParameterStatus(x) {
    const [k, v] = x.toString('utf8', 5, x.length - 1).split(bytes.N)
    backendParameters[k] = v
    if (options.parameters[k] !== v) {
      options.parameters[k] = v
      onparameter && onparameter(k, v)
    }
  }

  function ReadyForQuery(x) {
    query && query.options.simple && query.resolve(results || result)
    query = results = null
    result = new Result()
    connectTimer.cancel()

    if (initial) {
      if (target_session_attrs) {
        if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
          return fetchState()
        else if (tryNext(target_session_attrs, backendParameters))
          return terminate()
      }

      if (needsTypes) {
        initial === true && (initial = null)
        return fetchArrayTypes()
      }

      initial !== true && execute(initial)
      options.shared.retries = retries = 0
      initial = null
      return
    }

    while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
      Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject)

    if (query)
      return // Consider opening if able and sent.length < 50

    connection.reserved
      ? !connection.reserved.release && x[5] === 73 // I
        ? ending
          ? terminate()
          : (connection.reserved = null, onopen(connection))
        : connection.reserved()
      : ending
        ? terminate()
        : onopen(connection)
  }

  function CommandComplete(x) {
    rows = 0

    for (let i = x.length - 1; i > 0; i--) {
      if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
        result.count = +x.toString('utf8', i + 1, x.length - 1)
      if (x[i - 1] >= 65) {
        result.command = x.toString('utf8', 5, i)
        result.state = backend
        break
      }
    }

    final && (final(), final = null)

    if (result.command === 'BEGIN' && max !== 1 && !connection.reserved)
      return errored(Errors.generic('UNSAFE_TRANSACTION', 'Only use sql.begin, sql.reserved or max: 1'))

    if (query.options.simple)
      return BindComplete()

    if (query.cursorFn) {
      result.count && query.cursorFn(result)
      write(Sync)
    }

    query.resolve(result)
  }

  function ParseComplete() {
    query.parsing = false
  }

  function BindComplete() {
    !result.statement && (result.statement = query.statement)
    result.columns = query.statement.columns
  }

  function ParameterDescription(x) {
    const length = x.readUInt16BE(5)

    for (let i = 0; i < length; ++i)
      !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4))

    query.prepare && (statements[query.signature] = query.statement)
    query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false)
  }

  function RowDescription(x) {
    if (result.command) {
      results = results || [result]
      results.push(result = new Result())
      result.count = null
      query.statement.columns = null
    }

    const length = x.readUInt16BE(5)
    let index = 7
    let start

    query.statement.columns = Array(length)

    for (let i = 0; i < length; ++i) {
      start = index
      while (x[index++] !== 0);
      const table = x.readUInt32BE(index)
      const number = x.readUInt16BE(index + 4)
      const type = x.readUInt32BE(index + 6)
      query.statement.columns[i] = {
        name: transform.column.from
          ? transform.column.from(x.toString('utf8', start, index - 1))
          : x.toString('utf8', start, index - 1),
        parser: parsers[type],
        table,
        number,
        type
      }
      index += 18
    }

    result.statement = query.statement
    if (query.onlyDescribe)
      return (query.resolve(query.statement), write(Sync))
  }

  async function Authentication(x, type = x.readUInt32BE(5)) {
    (
      type === 3 ? AuthenticationCleartextPassword :
      type === 5 ? AuthenticationMD5Password :
      type === 10 ? SASL :
      type === 11 ? SASLContinue :
      type === 12 ? SASLFinal :
      type !== 0 ? UnknownAuth :
      noop
    )(x, type)
  }

  /* c8 ignore next 5 */
  async function AuthenticationCleartextPassword() {
    const payload = await Pass()
    write(
      bytes().p().str(payload).z(1).end()
    )
  }

  async function AuthenticationMD5Password(x) {
    const payload = 'md5' + (
      await md5(
        Buffer.concat([
          Buffer.from(await md5((await Pass()) + user)),
          x.subarray(9)
        ])
      )
    )
    write(
      bytes().p().str(payload).z(1).end()
    )
  }

  async function SASL() {
    nonce = (await external_crypto_.randomBytes(18)).toString('base64')
    bytes().p().str('SCRAM-SHA-256' + bytes.N)
    const i = bytes.i
    write(bytes.inc(4).str('n,,n=*,r=' + nonce).i32(bytes.i - i - 4, i).end())
  }

  async function SASLContinue(x) {
    const res = x.toString('utf8', 9).split(',').reduce((acc, x) => (acc[x[0]] = x.slice(2), acc), {})

    const saltedPassword = await external_crypto_.pbkdf2Sync(
      await Pass(),
      Buffer.from(res.s, 'base64'),
      parseInt(res.i), 32,
      'sha256'
    )

    const clientKey = await hmac(saltedPassword, 'Client Key')

    const auth = 'n=*,r=' + nonce + ','
               + 'r=' + res.r + ',s=' + res.s + ',i=' + res.i
               + ',c=biws,r=' + res.r

    serverSignature = (await hmac(await hmac(saltedPassword, 'Server Key'), auth)).toString('base64')

    const payload = 'c=biws,r=' + res.r + ',p=' + xor(
      clientKey, Buffer.from(await hmac(await sha256(clientKey), auth))
    ).toString('base64')

    write(
      bytes().p().str(payload).end()
    )
  }

  function SASLFinal(x) {
    if (x.toString('utf8', 9).split(bytes.N, 1)[0].slice(2) === serverSignature)
      return
    /* c8 ignore next 5 */
    errored(Errors.generic('SASL_SIGNATURE_MISMATCH', 'The server did not return the correct signature'))
    socket.destroy()
  }

  function Pass() {
    return Promise.resolve(typeof options.pass === 'function'
      ? options.pass()
      : options.pass
    )
  }

  function NoData() {
    result.statement = query.statement
    result.statement.columns = []
    if (query.onlyDescribe)
      return (query.resolve(query.statement), write(Sync))
  }

  function BackendKeyData(x) {
    backend.pid = x.readUInt32BE(5)
    backend.secret = x.readUInt32BE(9)
  }

  async function fetchArrayTypes() {
    needsTypes = false
    const types = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute)
    types.forEach(({ oid, typarray }) => addArrayType(oid, typarray))
  }

  function addArrayType(oid, typarray) {
    if (!!options.parsers[typarray] && !!options.serializers[typarray]) return
    const parser = options.parsers[oid]
    options.shared.typeArrayMap[oid] = typarray
    options.parsers[typarray] = (xs) => arrayParser(xs, parser, typarray)
    options.parsers[typarray].array = true
    options.serializers[typarray] = (xs) => arraySerializer(xs, options.serializers[oid], options, typarray)
  }

  function tryNext(x, xs) {
    return (
      (x === 'read-write' && xs.default_transaction_read_only === 'on') ||
      (x === 'read-only' && xs.default_transaction_read_only === 'off') ||
      (x === 'primary' && xs.in_hot_standby === 'on') ||
      (x === 'standby' && xs.in_hot_standby === 'off') ||
      (x === 'prefer-standby' && xs.in_hot_standby === 'off' && options.host[retries])
    )
  }

  function fetchState() {
    const query = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true })
    query.resolve = ([[a], [b]]) => {
      backendParameters.default_transaction_read_only = a.transaction_read_only
      backendParameters.in_hot_standby = b.pg_is_in_recovery ? 'on' : 'off'
    }
    query.execute()
  }

  function ErrorResponse(x) {
    query && (query.cursorFn || query.describeFirst) && write(Sync)
    const error = Errors.postgres(parseError(x))
    query && query.retried
      ? errored(query.retried)
      : query && query.prepared && retryRoutines.has(error.routine)
        ? retry(query, error)
        : errored(error)
  }

  function retry(q, error) {
    delete statements[q.signature]
    q.retried = error
    execute(q)
  }

  function NotificationResponse(x) {
    if (!onnotify)
      return

    let index = 9
    while (x[index++] !== 0);
    onnotify(
      x.toString('utf8', 9, index - 1),
      x.toString('utf8', index, x.length - 1)
    )
  }

  async function PortalSuspended() {
    try {
      const x = await Promise.resolve(query.cursorFn(result))
      rows = 0
      x === CLOSE
        ? write(Close(query.portal))
        : (result = new Result(), write(Execute('', query.cursorRows)))
    } catch (err) {
      write(Sync)
      query.reject(err)
    }
  }

  function CloseComplete() {
    result.count && query.cursorFn(result)
    query.resolve(result)
  }

  function CopyInResponse() {
    stream = new external_stream_namespaceObject.Writable({
      autoDestroy: true,
      write(chunk, encoding, callback) {
        socket.write(bytes().d().raw(chunk).end(), callback)
      },
      destroy(error, callback) {
        callback(error)
        socket.write(bytes().f().str(error + bytes.N).end())
        stream = null
      },
      final(callback) {
        socket.write(bytes().c().end())
        final = callback
      }
    })
    query.resolve(stream)
  }

  function CopyOutResponse() {
    stream = new external_stream_namespaceObject.Readable({
      read() { socket.resume() }
    })
    query.resolve(stream)
  }

  /* c8 ignore next 3 */
  function CopyBothResponse() {
    stream = new external_stream_namespaceObject.Duplex({
      autoDestroy: true,
      read() { socket.resume() },
      /* c8 ignore next 11 */
      write(chunk, encoding, callback) {
        socket.write(bytes().d().raw(chunk).end(), callback)
      },
      destroy(error, callback) {
        callback(error)
        socket.write(bytes().f().str(error + bytes.N).end())
        stream = null
      },
      final(callback) {
        socket.write(bytes().c().end())
        final = callback
      }
    })
    query.resolve(stream)
  }

  function CopyData(x) {
    stream && (stream.push(x.subarray(5)) || socket.pause())
  }

  function CopyDone() {
    stream && stream.push(null)
    stream = null
  }

  function NoticeResponse(x) {
    onnotice
      ? onnotice(parseError(x))
      : console.log(parseError(x)) // eslint-disable-line

  }

  /* c8 ignore next 3 */
  function EmptyQueryResponse() {
    /* noop */
  }

  /* c8 ignore next 3 */
  function FunctionCallResponse() {
    errored(Errors.notSupported('FunctionCallResponse'))
  }

  /* c8 ignore next 3 */
  function NegotiateProtocolVersion() {
    errored(Errors.notSupported('NegotiateProtocolVersion'))
  }

  /* c8 ignore next 3 */
  function UnknownMessage(x) {
    console.error('Postgres.js : Unknown Message:', x[0]) // eslint-disable-line
  }

  /* c8 ignore next 3 */
  function UnknownAuth(x, type) {
    console.error('Postgres.js : Unknown Auth:', type) // eslint-disable-line
  }

  /* Messages */
  function Bind(parameters, types, statement = '', portal = '') {
    let prev
      , type

    bytes().B().str(portal + bytes.N).str(statement + bytes.N).i16(0).i16(parameters.length)

    parameters.forEach((x, i) => {
      if (x === null)
        return bytes.i32(0xFFFFFFFF)

      type = types[i]
      parameters[i] = x = type in options.serializers
        ? options.serializers[type](x)
        : '' + x

      prev = bytes.i
      bytes.inc(4).str(x).i32(bytes.i - prev - 4, prev)
    })

    bytes.i16(0)

    return bytes.end()
  }

  function Parse(str, parameters, types, name = '') {
    bytes().P().str(name + bytes.N).str(str + bytes.N).i16(parameters.length)
    parameters.forEach((x, i) => bytes.i32(types[i] || 0))
    return bytes.end()
  }

  function Describe(x, name = '') {
    return bytes().D().str(x).str(name + bytes.N).end()
  }

  function Execute(portal = '', rows = 0) {
    return Buffer.concat([
      bytes().E().str(portal + bytes.N).i32(rows).end(),
      Flush
    ])
  }

  function Close(portal = '') {
    return Buffer.concat([
      bytes().C().str('P').str(portal + bytes.N).end(),
      bytes().S().end()
    ])
  }

  function StartupMessage() {
    return cancelMessage || bytes().inc(4).i16(3).z(2).str(
      Object.entries(Object.assign({
        user,
        database,
        client_encoding: 'UTF8'
      },
        options.connection
      )).filter(([, v]) => v).map(([k, v]) => k + bytes.N + v).join(bytes.N)
    ).z(2).end(0)
  }

}

function parseError(x) {
  const error = {}
  let start = 5
  for (let i = 5; i < x.length - 1; i++) {
    if (x[i] === 0) {
      error[errorFields[x[start]]] = x.toString('utf8', start + 1, i)
      start = i + 1
    }
  }
  return error
}

function md5(x) {
  return external_crypto_.createHash('md5').update(x).digest('hex')
}

function hmac(key, x) {
  return external_crypto_.createHmac('sha256', key).update(x).digest()
}

function sha256(x) {
  return external_crypto_.createHash('sha256').update(x).digest()
}

function xor(a, b) {
  const length = Math.max(a.length, b.length)
  const buffer = Buffer.allocUnsafe(length)
  for (let i = 0; i < length; i++)
    buffer[i] = a[i] ^ b[i]
  return buffer
}

function timer(fn, seconds) {
  seconds = typeof seconds === 'function' ? seconds() : seconds
  if (!seconds)
    return { cancel: noop, start: noop }

  let timer
  return {
    cancel() {
      timer && (clearTimeout(timer), timer = null)
    },
    start() {
      timer && clearTimeout(timer)
      timer = setTimeout(done, seconds * 1000, arguments)
    }
  }

  function done(args) {
    fn.apply(null, args)
    timer = null
  }
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/subscribe.js
const subscribe_noop = () => { /* noop */ }

function Subscribe(postgres, options) {
  const subscribers = new Map()
      , slot = 'postgresjs_' + Math.random().toString(36).slice(2)
      , state = {}

  let connection
    , stream
    , ended = false

  const sql = subscribe.sql = postgres({
    ...options,
    transform: { column: {}, value: {}, row: {} },
    max: 1,
    fetch_types: false,
    idle_timeout: null,
    max_lifetime: null,
    connection: {
      ...options.connection,
      replication: 'database'
    },
    onclose: async function() {
      if (ended)
        return
      stream = null
      state.pid = state.secret = undefined
      connected(await init(sql, slot, options.publications))
      subscribers.forEach(event => event.forEach(({ onsubscribe }) => onsubscribe()))
    },
    no_subscribe: true
  })

  const end = sql.end
      , close = sql.close

  sql.end = async() => {
    ended = true
    stream && (await new Promise(r => (stream.once('close', r), stream.end())))
    return end()
  }

  sql.close = async() => {
    stream && (await new Promise(r => (stream.once('close', r), stream.end())))
    return close()
  }

  return subscribe

  async function subscribe(event, fn, onsubscribe = subscribe_noop, onerror = subscribe_noop) {
    event = parseEvent(event)

    if (!connection)
      connection = init(sql, slot, options.publications)

    const subscriber = { fn, onsubscribe }
    const fns = subscribers.has(event)
      ? subscribers.get(event).add(subscriber)
      : subscribers.set(event, new Set([subscriber])).get(event)

    const unsubscribe = () => {
      fns.delete(subscriber)
      fns.size === 0 && subscribers.delete(event)
    }

    return connection.then(x => {
      connected(x)
      onsubscribe()
      stream && stream.on('error', onerror)
      return { unsubscribe, state, sql }
    })
  }

  function connected(x) {
    stream = x.stream
    state.pid = x.state.pid
    state.secret = x.state.secret
  }

  async function init(sql, slot, publications) {
    if (!publications)
      throw new Error('Missing publication names')

    const xs = await sql.unsafe(
      `CREATE_REPLICATION_SLOT ${ slot } TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
    )

    const [x] = xs

    const stream = await sql.unsafe(
      `START_REPLICATION SLOT ${ slot } LOGICAL ${
        x.consistent_point
      } (proto_version '1', publication_names '${ publications }')`
    ).writable()

    const state = {
      lsn: Buffer.concat(x.consistent_point.split('/').map(x => Buffer.from(('00000000' + x).slice(-8), 'hex')))
    }

    stream.on('data', data)
    stream.on('error', error)
    stream.on('close', sql.close)

    return { stream, state: xs.state }

    function error(e) {
      console.error('Unexpected error during logical streaming - reconnecting', e) // eslint-disable-line
    }

    function data(x) {
      if (x[0] === 0x77) {
        parse(x.subarray(25), state, sql.options.parsers, handle, options.transform)
      } else if (x[0] === 0x6b && x[17]) {
        state.lsn = x.subarray(1, 9)
        pong()
      }
    }

    function handle(a, b) {
      const path = b.relation.schema + '.' + b.relation.table
      call('*', a, b)
      call('*:' + path, a, b)
      b.relation.keys.length && call('*:' + path + '=' + b.relation.keys.map(x => a[x.name]), a, b)
      call(b.command, a, b)
      call(b.command + ':' + path, a, b)
      b.relation.keys.length && call(b.command + ':' + path + '=' + b.relation.keys.map(x => a[x.name]), a, b)
    }

    function pong() {
      const x = Buffer.alloc(34)
      x[0] = 'r'.charCodeAt(0)
      x.fill(state.lsn, 1)
      x.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2000, 0, 1)) * BigInt(1000), 25)
      stream.write(x)
    }
  }

  function call(x, a, b) {
    subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b, x))
  }
}

function Time(x) {
  return new Date(Date.UTC(2000, 0, 1) + Number(x / BigInt(1000)))
}

function parse(x, state, parsers, handle, transform) {
  const char = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc)

  Object.entries({
    R: x => {  // Relation
      let i = 1
      const r = state[x.readUInt32BE(i)] = {
        schema: x.toString('utf8', i += 4, i = x.indexOf(0, i)) || 'pg_catalog',
        table: x.toString('utf8', i + 1, i = x.indexOf(0, i + 1)),
        columns: Array(x.readUInt16BE(i += 2)),
        keys: []
      }
      i += 2

      let columnIndex = 0
        , column

      while (i < x.length) {
        column = r.columns[columnIndex++] = {
          key: x[i++],
          name: transform.column.from
            ? transform.column.from(x.toString('utf8', i, i = x.indexOf(0, i)))
            : x.toString('utf8', i, i = x.indexOf(0, i)),
          type: x.readUInt32BE(i += 1),
          parser: parsers[x.readUInt32BE(i)],
          atttypmod: x.readUInt32BE(i += 4)
        }

        column.key && r.keys.push(column)
        i += 4
      }
    },
    Y: () => { /* noop */ }, // Type
    O: () => { /* noop */ }, // Origin
    B: x => { // Begin
      state.date = Time(x.readBigInt64BE(9))
      state.lsn = x.subarray(1, 9)
    },
    I: x => { // Insert
      let i = 1
      const relation = state[x.readUInt32BE(i)]
      const { row } = tuples(x, relation.columns, i += 7, transform)

      handle(row, {
        command: 'insert',
        relation
      })
    },
    D: x => { // Delete
      let i = 1
      const relation = state[x.readUInt32BE(i)]
      i += 4
      const key = x[i] === 75
      handle(key || x[i] === 79
        ? tuples(x, relation.columns, i += 3, transform).row
        : null
      , {
        command: 'delete',
        relation,
        key
      })
    },
    U: x => { // Update
      let i = 1
      const relation = state[x.readUInt32BE(i)]
      i += 4
      const key = x[i] === 75
      const xs = key || x[i] === 79
        ? tuples(x, relation.columns, i += 3, transform)
        : null

      xs && (i = xs.i)

      const { row } = tuples(x, relation.columns, i + 3, transform)

      handle(row, {
        command: 'update',
        relation,
        key,
        old: xs && xs.row
      })
    },
    T: () => { /* noop */ }, // Truncate,
    C: () => { /* noop */ }  // Commit
  }).reduce(char, {})[x[0]](x)
}

function tuples(x, columns, xi, transform) {
  let type
    , column
    , value

  const row = transform.raw ? new Array(columns.length) : {}
  for (let i = 0; i < columns.length; i++) {
    type = x[xi++]
    column = columns[i]
    value = type === 110 // n
      ? null
      : type === 117 // u
        ? undefined
        : column.parser === undefined
          ? x.toString('utf8', xi + 4, xi += 4 + x.readUInt32BE(xi))
          : column.parser.array === true
            ? column.parser(x.toString('utf8', xi + 5, xi += 4 + x.readUInt32BE(xi)))
            : column.parser(x.toString('utf8', xi + 4, xi += 4 + x.readUInt32BE(xi)))

    transform.raw
      ? (row[i] = transform.raw === true
        ? value
        : transform.value.from ? transform.value.from(value, column) : value)
      : (row[column.name] = transform.value.from
        ? transform.value.from(value, column)
        : value
      )
  }

  return { i: xi, row: transform.row.from ? transform.row.from(row) : row }
}

function parseEvent(x) {
  const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || []

  if (!xs)
    throw new Error('Malformed subscribe pattern: ' + x)

  const [, command, path, key] = xs

  return (command || '*')
       + (path ? ':' + (path.indexOf('.') === -1 ? 'public.' + path : path) : '')
       + (key ? '=' + key : '')
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/large.js


function largeObject(sql, oid, mode = 0x00020000 | 0x00040000) {
  return new Promise(async(resolve, reject) => {
    await sql.begin(async sql => {
      let finish
      !oid && ([{ oid }] = await sql`select lo_creat(-1) as oid`)
      const [{ fd }] = await sql`select lo_open(${ oid }, ${ mode }) as fd`

      const lo = {
        writable,
        readable,
        close     : () => sql`select lo_close(${ fd })`.then(finish),
        tell      : () => sql`select lo_tell64(${ fd })`,
        read      : (x) => sql`select loread(${ fd }, ${ x }) as data`,
        write     : (x) => sql`select lowrite(${ fd }, ${ x })`,
        truncate  : (x) => sql`select lo_truncate64(${ fd }, ${ x })`,
        seek      : (x, whence = 0) => sql`select lo_lseek64(${ fd }, ${ x }, ${ whence })`,
        size      : () => sql`
          select
            lo_lseek64(${ fd }, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
      }

      resolve(lo)

      return new Promise(async r => finish = r)

      async function readable({
        highWaterMark = 2048 * 8,
        start = 0,
        end = Infinity
      } = {}) {
        let max = end - start
        start && await lo.seek(start)
        return new external_stream_namespaceObject.Readable({
          highWaterMark,
          async read(size) {
            const l = size > max ? size - max : size
            max -= size
            const [{ data }] = await lo.read(l)
            this.push(data)
            if (data.length < size)
              this.push(null)
          }
        })
      }

      async function writable({
        highWaterMark = 2048 * 8,
        start = 0
      } = {}) {
        start && await lo.seek(start)
        return new external_stream_namespaceObject.Writable({
          highWaterMark,
          write(chunk, encoding, callback) {
            lo.write(chunk).then(() => callback(), callback)
          }
        })
      }
    }).catch(reject)
  })
}

;// CONCATENATED MODULE: ./node_modules/.pnpm/postgres@3.4.5/node_modules/postgres/src/index.js












Object.assign(Postgres, {
  PostgresError: PostgresError,
  toPascal: toPascal,
  pascal: pascal,
  toCamel: toCamel,
  camel: camel,
  toKebab: toKebab,
  kebab: kebab,
  fromPascal: fromPascal,
  fromCamel: fromCamel,
  fromKebab: fromKebab,
  BigInt: {
    to: 20,
    from: [20],
    parse: x => BigInt(x), // eslint-disable-line
    serialize: x => x.toString()
  }
})

/* harmony default export */ const src = (Postgres);

function Postgres(a, b) {
  const options = parseOptions(a, b)
      , subscribe = options.no_subscribe || Subscribe(Postgres, { ...options })

  let ending = false

  const queries = src_queue()
      , connecting = src_queue()
      , reserved = src_queue()
      , closed = src_queue()
      , ended = src_queue()
      , open = src_queue()
      , busy = src_queue()
      , full = src_queue()
      , queues = { connecting, reserved, closed, ended, open, busy, full }

  const connections = [...Array(options.max)].map(() => src_connection(options, queues, { onopen, onend, onclose }))

  const sql = Sql(handler)

  Object.assign(sql, {
    get parameters() { return options.parameters },
    largeObject: largeObject.bind(null, sql),
    subscribe,
    CLOSE: CLOSE,
    END: CLOSE,
    PostgresError: PostgresError,
    options,
    reserve,
    listen,
    begin,
    close,
    end
  })

  return sql

  function Sql(handler) {
    handler.debug = options.debug

    Object.entries(options.types).reduce((acc, [name, type]) => {
      acc[name] = (x) => new Parameter(x, type.to)
      return acc
    }, typed)

    Object.assign(sql, {
      types: typed,
      typed,
      unsafe,
      notify,
      array,
      json,
      file
    })

    return sql

    function typed(value, type) {
      return new Parameter(value, type)
    }

    function sql(strings, ...args) {
      const query = strings && Array.isArray(strings.raw)
        ? new Query(strings, args, handler, cancel)
        : typeof strings === 'string' && !args.length
          ? new Identifier(options.transform.column.to ? options.transform.column.to(strings) : strings)
          : new Builder(strings, args)
      return query
    }

    function unsafe(string, args = [], options = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options = args, args = [])
      const query = new Query([string], args, handler, cancel, {
        prepare: false,
        ...options,
        simple: 'simple' in options ? options.simple : args.length === 0
      })
      return query
    }

    function file(path, args = [], options = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options = args, args = [])
      const query = new Query([], args, (query) => {
        external_fs_.readFile(path, 'utf8', (err, string) => {
          if (err)
            return query.reject(err)

          query.strings = [string]
          handler(query)
        })
      }, cancel, {
        ...options,
        simple: 'simple' in options ? options.simple : args.length === 0
      })
      return query
    }
  }

  async function listen(name, fn, onlisten) {
    const listener = { fn, onlisten }

    const sql = listen.sql || (listen.sql = Postgres({
      ...options,
      max: 1,
      idle_timeout: null,
      max_lifetime: null,
      fetch_types: false,
      onclose() {
        Object.entries(listen.channels).forEach(([name, { listeners }]) => {
          delete listen.channels[name]
          Promise.all(listeners.map(l => listen(name, l.fn, l.onlisten).catch(() => { /* noop */ })))
        })
      },
      onnotify(c, x) {
        c in listen.channels && listen.channels[c].listeners.forEach(l => l.fn(x))
      }
    }))

    const channels = listen.channels || (listen.channels = {})
        , exists = name in channels

    if (exists) {
      channels[name].listeners.push(listener)
      const result = await channels[name].result
      listener.onlisten && listener.onlisten()
      return { state: result.state, unlisten }
    }

    channels[name] = { result: sql`listen ${
      sql.unsafe('"' + name.replace(/"/g, '""') + '"')
    }`, listeners: [listener] }
    const result = await channels[name].result
    listener.onlisten && listener.onlisten()
    return { state: result.state, unlisten }

    async function unlisten() {
      if (name in channels === false)
        return

      channels[name].listeners = channels[name].listeners.filter(x => x !== listener)
      if (channels[name].listeners.length)
        return

      delete channels[name]
      return sql`unlisten ${
        sql.unsafe('"' + name.replace(/"/g, '""') + '"')
      }`
    }
  }

  async function notify(channel, payload) {
    return await sql`select pg_notify(${ channel }, ${ '' + payload })`
  }

  async function reserve() {
    const queue = src_queue()
    const c = open.length
      ? open.shift()
      : await new Promise(r => {
        queries.push({ reserve: r })
        closed.length && connect(closed.shift())
      })

    move(c, reserved)
    c.reserved = () => queue.length
      ? c.execute(queue.shift())
      : move(c, reserved)
    c.reserved.release = true

    const sql = Sql(handler)
    sql.release = () => {
      c.reserved = null
      onopen(c)
    }

    return sql

    function handler(q) {
      c.queue === full
        ? queue.push(q)
        : c.execute(q) || move(c, full)
    }
  }

  async function begin(options, fn) {
    !fn && (fn = options, options = '')
    const queries = src_queue()
    let savepoints = 0
      , connection
      , prepare = null

    try {
      await sql.unsafe('begin ' + options.replace(/[^a-z ]/ig, ''), [], { onexecute }).execute()
      return await Promise.race([
        scope(connection, fn),
        new Promise((_, reject) => connection.onclose = reject)
      ])
    } catch (error) {
      throw error
    }

    async function scope(c, fn, name) {
      const sql = Sql(handler)
      sql.savepoint = savepoint
      sql.prepare = x => prepare = x.replace(/[^a-z0-9$-_. ]/gi)
      let uncaughtError
        , result

      name && await sql`savepoint ${ sql(name) }`
      try {
        result = await new Promise((resolve, reject) => {
          const x = fn(sql)
          Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject)
        })

        if (uncaughtError)
          throw uncaughtError
      } catch (e) {
        await (name
          ? sql`rollback to ${ sql(name) }`
          : sql`rollback`
        )
        throw e instanceof PostgresError && e.code === '25P02' && uncaughtError || e
      }

      if (!name) {
        prepare
          ? await sql`prepare transaction '${ sql.unsafe(prepare) }'`
          : await sql`commit`
      }

      return result

      function savepoint(name, fn) {
        if (name && Array.isArray(name.raw))
          return savepoint(sql => sql.apply(sql, arguments))

        arguments.length === 1 && (fn = name, name = null)
        return scope(c, fn, 's' + savepoints++ + (name ? '_' + name : ''))
      }

      function handler(q) {
        q.catch(e => uncaughtError || (uncaughtError = e))
        c.queue === full
          ? queries.push(q)
          : c.execute(q) || move(c, full)
      }
    }

    function onexecute(c) {
      connection = c
      move(c, reserved)
      c.reserved = () => queries.length
        ? c.execute(queries.shift())
        : move(c, reserved)
    }
  }

  function move(c, queue) {
    c.queue.remove(c)
    queue.push(c)
    c.queue = queue
    queue === open
      ? c.idleTimer.start()
      : c.idleTimer.cancel()
    return c
  }

  function json(x) {
    return new Parameter(x, 3802)
  }

  function array(x, type) {
    if (!Array.isArray(x))
      return array(Array.from(arguments))

    return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options.shared.typeArrayMap)
  }

  function handler(query) {
    if (ending)
      return query.reject(Errors.connection('CONNECTION_ENDED', options, options))

    if (open.length)
      return go(open.shift(), query)

    if (closed.length)
      return connect(closed.shift(), query)

    busy.length
      ? go(busy.shift(), query)
      : queries.push(query)
  }

  function go(c, query) {
    return c.execute(query)
      ? move(c, busy)
      : move(c, full)
  }

  function cancel(query) {
    return new Promise((resolve, reject) => {
      query.state
        ? query.active
          ? src_connection(options).cancel(query.state, resolve, reject)
          : query.cancelled = { resolve, reject }
        : (
          queries.remove(query),
          query.cancelled = true,
          query.reject(Errors.generic('57014', 'canceling statement due to user request')),
          resolve()
        )
    })
  }

  async function end({ timeout = null } = {}) {
    if (ending)
      return ending

    await 1
    let timer
    return ending = Promise.race([
      new Promise(r => timeout !== null && (timer = setTimeout(destroy, timeout * 1000, r))),
      Promise.all(connections.map(c => c.end()).concat(
        listen.sql ? listen.sql.end({ timeout: 0 }) : [],
        subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
      ))
    ]).then(() => clearTimeout(timer))
  }

  async function close() {
    await Promise.all(connections.map(c => c.end()))
  }

  async function destroy(resolve) {
    await Promise.all(connections.map(c => c.terminate()))
    while (queries.length)
      queries.shift().reject(Errors.connection('CONNECTION_DESTROYED', options))
    resolve()
  }

  function connect(c, query) {
    move(c, connecting)
    c.connect(query)
    return c
  }

  function onend(c) {
    move(c, ended)
  }

  function onopen(c) {
    if (queries.length === 0)
      return move(c, open)

    let max = Math.ceil(queries.length / (connecting.length + 1))
      , ready = true

    while (ready && queries.length && max-- > 0) {
      const query = queries.shift()
      if (query.reserve)
        return query.reserve(c)

      ready = c.execute(query)
    }

    ready
      ? move(c, busy)
      : move(c, full)
  }

  function onclose(c, e) {
    move(c, closed)
    c.reserved = null
    c.onclose && (c.onclose(e), c.onclose = null)
    options.onclose && options.onclose(c.id)
    queries.length && connect(c, queries.shift())
  }
}

function parseOptions(a, b) {
  if (a && a.shared)
    return a

  const env = process.env // eslint-disable-line
      , o = (!a || typeof a === 'string' ? b : a) || {}
      , { url, multihost } = parseUrl(a)
      , query = [...url.searchParams].reduce((a, [b, c]) => (a[b] = c, a), {})
      , host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || 'localhost'
      , port = o.port || url.port || env.PGPORT || 5432
      , user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername()

  o.no_prepare && (o.prepare = false)
  query.sslmode && (query.ssl = query.sslmode, delete query.sslmode)
  'timeout' in o && (console.log('The timeout option is deprecated, use idle_timeout instead'), o.idle_timeout = o.timeout) // eslint-disable-line
  query.sslrootcert === 'system' && (query.ssl = 'verify-full')

  const ints = ['idle_timeout', 'connect_timeout', 'max_lifetime', 'max_pipeline', 'backoff', 'keep_alive']
  const defaults = {
    max             : 10,
    ssl             : false,
    idle_timeout    : null,
    connect_timeout : 30,
    max_lifetime    : max_lifetime,
    max_pipeline    : 100,
    backoff         : backoff,
    keep_alive      : 60,
    prepare         : true,
    debug           : false,
    fetch_types     : true,
    publications    : 'alltables',
    target_session_attrs: null
  }

  return {
    host            : Array.isArray(host) ? host : host.split(',').map(x => x.split(':')[0]),
    port            : Array.isArray(port) ? port : host.split(',').map(x => parseInt(x.split(':')[1] || port)),
    path            : o.path || host.indexOf('/') > -1 && host + '/.s.PGSQL.' + port,
    database        : o.database || o.db || (url.pathname || '').slice(1) || env.PGDATABASE || user,
    user            : user,
    pass            : o.pass || o.password || url.password || env.PGPASSWORD || '',
    ...Object.entries(defaults).reduce(
      (acc, [k, d]) => {
        const value = k in o ? o[k] : k in query
          ? (query[k] === 'disable' || query[k] === 'false' ? false : query[k])
          : env['PG' + k.toUpperCase()] || d
        acc[k] = typeof value === 'string' && ints.includes(k)
          ? +value
          : value
        return acc
      },
      {}
    ),
    connection      : {
      application_name: 'postgres.js',
      ...o.connection,
      ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
    },
    types           : o.types || {},
    target_session_attrs: tsa(o, url, env),
    onnotice        : o.onnotice,
    onnotify        : o.onnotify,
    onclose         : o.onclose,
    onparameter     : o.onparameter,
    socket          : o.socket,
    transform       : parseTransform(o.transform || { undefined: undefined }),
    parameters      : {},
    shared          : { retries: 0, typeArrayMap: {} },
    ...mergeUserTypes(o.types)
  }
}

function tsa(o, url, env) {
  const x = o.target_session_attrs || url.searchParams.get('target_session_attrs') || env.PGTARGETSESSIONATTRS
  if (!x || ['read-write', 'read-only', 'primary', 'standby', 'prefer-standby'].includes(x))
    return x

  throw new Error('target_session_attrs ' + x + ' is not supported')
}

function backoff(retries) {
  return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20)
}

function max_lifetime() {
  return 60 * (30 + Math.random() * 30)
}

function parseTransform(x) {
  return {
    undefined: x.undefined,
    column: {
      from: typeof x.column === 'function' ? x.column : x.column && x.column.from,
      to: x.column && x.column.to
    },
    value: {
      from: typeof x.value === 'function' ? x.value : x.value && x.value.from,
      to: x.value && x.value.to
    },
    row: {
      from: typeof x.row === 'function' ? x.row : x.row && x.row.from,
      to: x.row && x.row.to
    }
  }
}

function parseUrl(url) {
  if (!url || typeof url !== 'string')
    return { url: { searchParams: new Map() } }

  let host = url
  host = host.slice(host.indexOf('://') + 3).split(/[?/]/)[0]
  host = decodeURIComponent(host.slice(host.indexOf('@') + 1))

  const urlObj = new URL(url.replace(host, host.split(',')[0]))

  return {
    url: {
      username: decodeURIComponent(urlObj.username),
      password: decodeURIComponent(urlObj.password),
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams
    },
    multihost: host.indexOf(',') > -1 && host
  }
}

function osUsername() {
  try {
    return external_os_.userInfo().username // eslint-disable-line
  } catch (_) {
    return process.env.USERNAME || process.env.USER || process.env.LOGNAME  // eslint-disable-line
  }
}

;// CONCATENATED MODULE: external "util"
const external_util_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("util");
;// CONCATENATED MODULE: external "url"
const external_url_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("url");
// EXTERNAL MODULE: ./node_modules/.pnpm/@dotenvx+dotenvx@1.40.1/node_modules/@dotenvx/dotenvx/src/lib/config.js
var config = __nccwpck_require__(6129);
;// CONCATENATED MODULE: ./scripts/migrate.mjs






const {
    PGHOST,
    PGPORT,
    PGDATABASE,
    PGUSERNAME,
    PGPASSWORD,
    PG_RDS_IAM_AUTH,
    PGSSLMODE,
} = process.env;
console.log(PGHOST, PGPORT, PGDATABASE, PGUSERNAME, PG_RDS_IAM_AUTH)


/**
 * 
 * @param {string} sslstring 
 * @returns {sslstring is 'require' | 'allow' | 'prefer' | 'verify-full'}
 */
const isValidSSLValue = (sslstring) => ['require', 'allow', 'prefer', 'verify-full'].includes(sslstring)
/**
 * 
 * @param {string|undefined} sslstring 
 */
const validSSLValue = (sslstring) => {
  return sslstring ? isValidSSLValue(sslstring) ? sslstring : undefined : undefined
}
const sql = src({
    host: PGHOST,
    port: Number(PGPORT),
    database: PGDATABASE,
    user: PGUSERNAME,
    password: PG_RDS_IAM_AUTH ? () => {
      const signer = new Signer({
        hostname: PGHOST || '',
        port: parseInt(PGPORT || ''),
        username: PGUSER || '',
      })
      return signer.getAuthToken()
    } : PGPASSWORD,
    ssl: validSSLValue(PGSSLMODE),
    idle_timeout: 1,
});

// this is neccesary to make sure ncc picks up the migrations, yet for some reason
// it generates a bad url
console.log(__nccwpck_require__.ab + "migrations")
postgres_shift({
    sql,
    path: (0,external_url_namespaceObject.fileURLToPath)(import.meta.resolve('./migrations')),
    before: ({ migration_id, name }) => {
        console.log('Migrating', migration_id, name);
    },
})
    .then(() => console.log('All good'))
    .catch((err) => {
        console.error('Failed', err);
        process.exit(1);
    });
var __webpack_exports__sql = __webpack_exports__.l;
export { __webpack_exports__sql as sql };
