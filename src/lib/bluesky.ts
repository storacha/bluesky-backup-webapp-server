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

export async function backup(profile: ProfileViewBasic, agent: Agent, storachaClient: Client){
    const accountDid = profile.did
    
    // TODO
    //const commitRev = await agent.com.atproto.sync.getLatestCommit({ did: accountDid })
    //localDb.SetLatestCommit(accountDid, commitRev)

    console.log("backing up repo")
    const repoRes = await agent.com.atproto.sync.getRepo({ did: accountDid })
    console.log(repoRes)
    const storachaRepoCid = await storachaClient.uploadCAR(new Blob([repoRes.data]))
    console.log("REPO ID", storachaRepoCid)
    
    // TODO
    // await localDb.AddRepo(accountDid, repoStorachaCid)
    
    let blobCursor: string | undefined = undefined
    
    do {
        const listedBlobs = await agent.com.atproto.sync.listBlobs({
            did: accountDid,
            cursor: blobCursor,
        })
        console.log(`backing up ${listedBlobs.data.cids.length} blobs`)
        for (const cid of listedBlobs.data.cids) {
            console.log("backing up blob", cid)
            const blobRes = await agent.com.atproto.sync.getBlob({
                did: accountDid,
                cid,
            })
    
            const storachaBlobCid = await storachaClient.uploadFile(new Blob([blobRes.data]))
            console.log(storachaBlobCid)
            
            // TODO
            // await localDb.AddBlob(accountDid, blobStorachaCid)
        }
    
        blobCursor = listedBlobs.data.cursor
    
    } while (blobCursor)
}