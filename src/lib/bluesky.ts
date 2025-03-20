import { Agent } from "@atproto/api";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OAuthClientMetadataInput } from "@atproto/oauth-client-browser";
import { CARLink, Client } from "@w3ui/react";
import { BackupMetadataStore } from "./backupMetadataStore";
import { hydrateSymkey, Key } from "@/contexts/keychain";

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
    encryptionKey?: Key
}

export async function initializeBackup (profile: ProfileViewBasic, metadataStore: BackupMetadataStore): Promise<number> {
    const accountDid = profile.did
    return await metadataStore.addBackup(accountDid)
}

/**
 * Hydrate the encryption key from the Key metadata and use
 * it to AES-GCM decrypt the data. A random 12 byte nonce is taken from the front
 * of the given buffer and the rest of the data is passed to the decryption
 * algorithm.
 */
export async function decrypt (key: Key, buffer: ArrayBuffer): Promise<ArrayBuffer> {
    const decryptionKey = await hydrateSymkey(key)
    const iv = buffer.slice(0, 12)
    const encryptedBytes = buffer.slice(12)
    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, decryptionKey, encryptedBytes)
}

/**
 * Hydrate the encryption key from the Key metadata and use
 * it to AES-GCM encrypt the data. A random 12 byte nonce is generated
 * and prepended to the ArrayBuffer returned by `encrypt`, and the resulting
 * data is returned as a Blob.
 */
export async function encrypt (key: Key, blob: Blob): Promise<Blob> {
    const encryptionKey = await hydrateSymkey(key)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    return new Blob([iv, await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        encryptionKey,
        await blob.arrayBuffer()
    )])
}

export async function backupRepo (
    backupId: number,
    profile: ProfileViewBasic, agent: Agent,
    storachaClient: Client,
    metadataStore: BackupMetadataStore,
    { eventTarget, encryptionKey }: BackupOptions = {}
) {
    const accountDid = profile.did

    const commitResp = await agent.com.atproto.sync.getLatestCommit({ did: accountDid })
    const latestCommit = commitResp.data.rev

    console.log("backing up repo")
    eventTarget?.dispatchEvent(new CustomEvent('repo:fetching', { detail: { did: accountDid } }))
    const repoRes = await agent.com.atproto.sync.getRepo({ did: accountDid })
    console.log("got repo with headers", repoRes.headers)
    let blob = new Blob([repoRes.data])
    if (encryptionKey) {
        blob = await encrypt(encryptionKey, blob)
    }
    eventTarget?.dispatchEvent(new CustomEvent('repo:uploading'))
    let storachaRepoCid: CARLink | undefined;
    const storachaUploadCid = encryptionKey ?
        await storachaClient.uploadFile(blob) :
        await storachaClient.uploadCAR(blob, {
            onShardStored: (carMetadata) => {
                storachaRepoCid = carMetadata.cid
            },
            // set shard size to 4 GiB - the maximum shard size
            shardSize: 1024 * 1024 * 1024 * 4
        })
    eventTarget?.dispatchEvent(new CustomEvent('repo:uploaded', { detail: { cid: storachaRepoCid } }))
    await metadataStore.addRepo(storachaUploadCid.toString(), backupId, accountDid, latestCommit, { encryptedWith: encryptionKey?.id, repoCid: storachaRepoCid?.toString() })

    console.log("repo backed up")
}

export async function backupPrefs (backupId: number, profile: ProfileViewBasic, agent: Agent, storachaClient: Client, metadataStore: BackupMetadataStore, { eventTarget, encryptionKey }: BackupOptions = {}) {
    const accountDid = profile.did

    eventTarget?.dispatchEvent(new CustomEvent('prefs:fetching', { detail: { did: accountDid } }))
    const prefs = await agent.app.bsky.actor.getPreferences()

    eventTarget?.dispatchEvent(new CustomEvent('prefs:uploading'))
    let blob = new Blob([new TextEncoder().encode(JSON.stringify(prefs.data))], { type: "application/json" })
    if (encryptionKey?.symkeyCid && encryptionKey?.keyPair?.privateKey) {
        blob = await encrypt(encryptionKey, blob)
    }
    const storachaPrefsUploadCid = await storachaClient.uploadFile(blob)
    eventTarget?.dispatchEvent(new CustomEvent('prefs:uploaded', { detail: { cid: storachaPrefsUploadCid } }))
    await metadataStore.addPrefsDoc(storachaPrefsUploadCid.toString(), backupId, accountDid, { encryptedWith: encryptionKey?.id })
    console.log("prefs backed up")
}

export async function backupBlobs (
    backupId: number,
    profile: ProfileViewBasic, agent: Agent,
    storachaClient: Client,
    metadataStore: BackupMetadataStore,
    { eventTarget, encryptionKey }: BackupOptions = {}
) {
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
            let blob = new Blob([blobRes.data])
            if (encryptionKey) {
                blob = await encrypt(encryptionKey, blob)
            }
            eventTarget?.dispatchEvent(new CustomEvent('blob:uploading', { detail: { cid, i, count: listedBlobs.data.cids.length } }))
            const storachaBlobCid = await storachaClient.uploadFile(blob)
            eventTarget?.dispatchEvent(new CustomEvent('blob:uploaded', { detail: { cid: storachaBlobCid, i, count: listedBlobs.data.cids.length } }))
            await metadataStore.addBlob(
                storachaBlobCid.toString(), backupId, accountDid,
                {
                    contentType: blobRes.headers['content-type'],
                    encryptedWith: encryptionKey?.id
                }
            )
            i++
        }

        blobCursor = listedBlobs.data.cursor
        eventTarget?.dispatchEvent(new CustomEvent('blobs:uploaded'))

    } while (blobCursor)
    console.log("blobs backed up")
}