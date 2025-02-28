import { Agent } from "@atproto/api";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OAuthClientMetadataInput } from "@atproto/oauth-client-browser";
import { Client } from "@w3ui/react";

export const blueskyClientUri = process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI || "https://localhost:3000/"

export const blueskyClientMetadata: OAuthClientMetadataInput = {
    "client_id": `${blueskyClientUri}bluesky-client-metadata`,
    "client_name": "Local Dev App",
    "client_uri": blueskyClientUri,
    "application_type": "web",
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "redirect_uris": [blueskyClientUri],
    "token_endpoint_auth_method": "none",
    "scope": "atproto transition:generic",
    "dpop_bound_access_tokens": true
}

export interface BackupMetadataStore {
    setLatestCommit: (accountDid: string, commitRev: string) => Promise<void>
    addRepo: (cid: string, backupId: number, accountDid: string) => Promise<void>
    addBlob: (cid: string, backupId: number, accountDid: string) => Promise<void>
    addBackup: (accountDid: string) => Promise<number>
}

export interface BackupOptions {
    eventTarget?: EventTarget
}

export async function backup (profile: ProfileViewBasic, agent: Agent, storachaClient: Client, metadataStore: BackupMetadataStore, { eventTarget }: BackupOptions = {}) {
    const accountDid = profile.did
    const backupId = await metadataStore.addBackup(accountDid)

    const commitResp = await agent.com.atproto.sync.getLatestCommit({ did: accountDid })
    await metadataStore.setLatestCommit(accountDid, commitResp.data.rev)

    console.log("backing up repo")
    eventTarget?.dispatchEvent(new CustomEvent('repo:fetching', { detail: { did: accountDid } }))
    const repoRes = await agent.com.atproto.sync.getRepo({ did: accountDid })
    console.log("got repo with headers", repoRes.headers)

    eventTarget?.dispatchEvent(new CustomEvent('repo:uploading'))
    const storachaRepoCid = await storachaClient.uploadCAR(new Blob([repoRes.data]))
    eventTarget?.dispatchEvent(new CustomEvent('repo:uploaded', { detail: { cid: storachaRepoCid } }))


    await metadataStore.addRepo(storachaRepoCid.toString(), backupId, accountDid)

    let blobCursor: string | undefined = undefined

    do {
        eventTarget?.dispatchEvent(new CustomEvent('blobs:listing'))

        const listedBlobs = await agent.com.atproto.sync.listBlobs({
            did: accountDid,
            cursor: blobCursor,
        })
        eventTarget?.dispatchEvent(new CustomEvent('blobs:listed', { detail: { count: listedBlobs.data.cids.length } }))

        console.log(`backing up ${listedBlobs.data.cids.length} blobs`)
        let i = 0
        for (const cid of listedBlobs.data.cids) {
            console.log("backing up blob", cid)
            eventTarget?.dispatchEvent(new CustomEvent('blob:fetching', { detail: { cid, i, count: listedBlobs.data.cids.length } }))

            const blobRes = await agent.com.atproto.sync.getBlob({
                did: accountDid,
                cid,
            })

            eventTarget?.dispatchEvent(new CustomEvent('blob:uploading', { detail: { cid, i, count: listedBlobs.data.cids.length } }))
            const storachaBlobCid = await storachaClient.uploadFile(new Blob([blobRes.data]))
            eventTarget?.dispatchEvent(new CustomEvent('blob:uploaded', { detail: { cid: storachaBlobCid, i, count: listedBlobs.data.cids.length } }))

            await metadataStore.addBlob(storachaBlobCid.toString(), backupId, accountDid)
            i++
        }

        blobCursor = listedBlobs.data.cursor
        eventTarget?.dispatchEvent(new CustomEvent('blobs:uploaded'))

    } while (blobCursor)
}