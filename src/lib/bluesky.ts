import { Agent } from "@atproto/api";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OAuthClientMetadataInput } from "@atproto/oauth-client-browser";
import { CARLink, Client } from "@w3ui/react";
import { BackupMetadataStore } from "./backupMetadataStore";

const ensureTrailingSlash = (s: string) => s.endsWith('/') ? s : s.concat('/')

export const blueskyClientUri = ensureTrailingSlash(process.env.NEXT_PUBLIC_BLUESKY_CLIENT_URI || "https://localhost:3000/")

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

export interface BackupOptions {
    eventTarget?: EventTarget
}

export async function initializeBackup (profile: ProfileViewBasic, metadataStore: BackupMetadataStore): Promise<number> {
    const accountDid = profile.did
    return await metadataStore.addBackup(accountDid)
}

export async function backupRepo (backupId: number, profile: ProfileViewBasic, agent: Agent, storachaClient: Client, metadataStore: BackupMetadataStore, { eventTarget }: BackupOptions = {}) {
    const accountDid = profile.did

    const commitResp = await agent.com.atproto.sync.getLatestCommit({ did: accountDid })
    const latestCommit = commitResp.data.rev

    console.log("backing up repo")
    eventTarget?.dispatchEvent(new CustomEvent('repo:fetching', { detail: { did: accountDid } }))
    const repoRes = await agent.com.atproto.sync.getRepo({ did: accountDid })
    console.log("got repo with headers", repoRes.headers)

    eventTarget?.dispatchEvent(new CustomEvent('repo:uploading'))
    let storachaRepoCid: CARLink | undefined;
    const storachaUploadCid = await storachaClient.uploadCAR(new Blob([repoRes.data]), {
        onShardStored: (carMetadata) => {
            storachaRepoCid = carMetadata.cid
        },
        // set shard size to 4 GiB - the maximum shard size
        shardSize: 1024 * 1024 * 1024 * 4
    })
    eventTarget?.dispatchEvent(new CustomEvent('repo:uploaded', { detail: { cid: storachaRepoCid } }))
    if (storachaRepoCid) {
        await metadataStore.addRepo(storachaRepoCid.toString(), storachaUploadCid.toString(), backupId, accountDid, latestCommit)
    } else {
        console.warn("Uploaded CAR but did not find a CID, this is very surprising and your backup cannot be recorded!")
    }
    console.log("repo backed up")
}

export async function backupPrefs (backupId: number, profile: ProfileViewBasic, agent: Agent, storachaClient: Client, metadataStore: BackupMetadataStore, { eventTarget }: BackupOptions = {}) {
    const accountDid = profile.did

    eventTarget?.dispatchEvent(new CustomEvent('prefs:fetching', { detail: { did: accountDid } }))
    const prefs = await agent.app.bsky.actor.getPreferences()

    eventTarget?.dispatchEvent(new CustomEvent('prefs:uploading'))
    const blob = new Blob([JSON.stringify(prefs.data)], { type: "application/json" })

    const storachaPrefsUploadCid = await storachaClient.uploadFile(blob)
    eventTarget?.dispatchEvent(new CustomEvent('prefs:uploaded', { detail: { cid: storachaPrefsUploadCid } }))
    await metadataStore.addPrefsDoc(storachaPrefsUploadCid.toString(), backupId, accountDid)
    console.log("prefs backed up")
}

export async function backupBlobs (backupId: number, profile: ProfileViewBasic, agent: Agent, storachaClient: Client, metadataStore: BackupMetadataStore, { eventTarget }: BackupOptions = {}) {
    const accountDid = profile.did
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
            await metadataStore.addBlob(storachaBlobCid.toString(), backupId, accountDid, { contentType: blobRes.headers['content-type'] })
            i++
        }

        blobCursor = listedBlobs.data.cursor
        eventTarget?.dispatchEvent(new CustomEvent('blobs:uploaded'))

    } while (blobCursor)
    console.log("blobs backed up")
}