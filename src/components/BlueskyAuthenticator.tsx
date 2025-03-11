"use client";

import { useBskyAuthContext } from "@/contexts";
import { REQUIRED_ATPROTO_SCOPE } from "@/lib/constants";
import { useCallback, useState } from "react";

export default function BlueskyAuthenticator () {
  const { initialized, authenticated, bskyAuthClient, userProfile, session } = useBskyAuthContext();

  const [handle, setHandle] = useState<string>("");

  const signIn = useCallback(async () => {
    if (!bskyAuthClient) return;
    try {
      await bskyAuthClient.signIn(handle, {
        scope: REQUIRED_ATPROTO_SCOPE,
      });
    } catch (err) {
      console.log(err);
    }
  }, [handle, bskyAuthClient]);

  return (
    <div>
      {initialized ? (
        authenticated ? (
          <div>
            Authenticated to Bluesky as {userProfile?.handle} on {session?.serverMetadata.issuer}
          </div>
        ) : (
          <div>
            <input
              onChange={(e) => {
                e.preventDefault();
                setHandle(e.target.value);
              }}
              value={handle}
              placeholder="Full Bluesky Handle (eg, racha.bsky.social)"
              className="px-2 py-1 border rounded-s-lg w-82 hover:bg-white outline-none"
            />
            <button
              onClick={signIn}
              className="px-2 py-1 border rounded-e-lg cursor-pointer hover:bg-white">
              Sign in
            </button>
          </div>
        )) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
