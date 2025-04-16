import { getCloudflareContext } from '@opennextjs/cloudflare'
import { AgentData } from '@storacha/access/agent'
import { Client as StorachaClient } from '@storacha/client/types'
import type { DID } from '@ucanto/interface'
import { ed25519 } from '@ucanto/principal'
import { DurableObject } from 'cloudflare:workers'
import { Agent as AtprotoAgent } from '@atproto/api'
import { createClient as createAtprotoClient } from 'bluesky-backup-app-atproto-client'

// const receiptsEndpoint = URL.parse('https://up.storacha.network/receipt/')

// if (!process.env.SERVER_IDENTITY_PRIVATE_KEY)
//   throw new Error('SERVER_IDENTITY_PRIVATE_KEY must be set')
// const SERVER_IDENTITY_PRIVATE_KEY = process.env.SERVER_IDENTITY_PRIVATE_KEY

// const SERVER_DID = 'did:web:bsky.staging.storacha.network'

// const serverIdentity = ed25519.Signer.parse(
//   SERVER_IDENTITY_PRIVATE_KEY
// ).withDID(
//   // FIXME: createStorachaClient() thinks a principal has to be a `did:key`,
//   // which is a bit silly. All DIDs have keys, and any `Signer` has its private
//   // key loaded.
//   SERVER_DID as DID<'key'>
// )

export class BackupDO extends DurableObject<CloudflareEnv> {
  private repoStatus: 'not-started' | 'in-progress' | 'failed' | 'success'

  constructor(ctx: DurableObjectState, env: CloudflareEnv) {
    console.log('env', Object.keys(env))
    super(ctx, env)
    this.repoStatus = 'not-started'
  }

  async begin({
    account,
    atpDid,
    storachaSpaceDid,
  }: {
    account: string
    atpDid: DID
    storachaSpaceDid: DID<'key'>
  }) {
    // const atprotoClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI

    // if (!atprotoClientUri) {
    //   throw new Error('NEXT_PUBLIC_BLUESKY_CLIENT_URI must be provided')
    // }

    const atpClient = createAtprotoClient({
      atprotoClientUri,
      account,
      sessionStoreKV: BLUESKY_AUTH_SESSION_STORE,
      stateStoreKV: BLUESKY_AUTH_STATE_STORE,
    })
    const atpSession = await atpClient.restore(atpDid)
    const atpAgent = new AtprotoAgent(atpSession)

    // const principal = process.env.STORACHA_PRINCIPAL

    // if (!receiptsEndpoint) throw new Error('RECEIPTS_ENDPOINT must be set')

    // const serviceConnection = connect<Service>({
    //   id: DID.parse('did:web:web3.storage'),
    //   codec: CAR.outbound,
    //   channel: HTTP.open<Service>({
    //     url: new URL('https://up.web3.storage'),
    //     method: 'POST',
    //   }),
    // })

    // const serviceConf: ServiceConf = {
    //   access: serviceConnection,
    //   upload: serviceConnection,
    //   filecoin: serviceConnection,
    //   gateway: gatewayServiceConnection(),
    // }

    // const storachaClient = createStorachaClient({
    //   store: {
    //     async close() {},
    //     async open() { },

    //   },
    //   serviceConf,
    //   receiptsEndpoint,
    //   principal: serverIdentity,
    // })

    const agentData = new AgentData({
      principal: serverIdentity,
      delegations: new Map(),
      meta: {
        name: 'bluesky-backups',
        type: 'service',
        description: 'Bluesky Backups Service',
      },
      spaces: new Map(),
      currentSpace: storachaSpaceDid,
    })
    const storachaClient = new StorachaClient(agentData)

    void this.backUpRepo({ atpAgent, atpDid, storachaClient })

    return 'Hello, World!'
  }

  private async backUpRepo({
    atpAgent,
    atpDid,
    // storachaClient,
  }: {
    atpAgent: AtprotoAgent
    atpDid: string
    storachaClient: StorachaClient
  }) {
    this.repoStatus = 'in-progress'
    const repoRes = await atpAgent.com.atproto.sync.getRepo({ did: atpDid })

    if (!repoRes.success) {
      this.repoStatus = 'failed'
    }

    console.log('repoRes', repoRes)

    // await storachaClient.uploadCAR(new Blob([repoRes.data]), {
    //   // onShardStored: (carMetadata) => {
    //   //   storachaRepoCid = carMetadata.cid
    //   // },
    //   // set shard size to 4 GiB - the maximum shard size
    //   shardSize: 1024 * 1024 * 1024 * 4,
    // })
  }
}
