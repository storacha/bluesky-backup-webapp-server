"use client";

import { useBskyAuthContext } from "@/contexts/bluesky";
import { useCallback, useState } from "react";

export default function Home() {
  const { authenticated, bskyAuthClient } = useBskyAuthContext();

  const [handle, setHandle] = useState<string>("");

  const signIn = useCallback(async () => {
    if (!bskyAuthClient) return;
    try {
      await bskyAuthClient.signIn(handle, {
        scope: "atproto transition:generic",
      });
    } catch (err) {
      console.log(err);
    }
  }, [handle, bskyAuthClient]);

  return (
    <>
      <h1>Blusky Backup Webapp</h1>
      <p>Lets get started</p>
      <div>
        <h4>Bluesky Auth</h4>
        <div>{authenticated ? "Auth" : "Not auth"}</div>
        <input
          onChange={(e) => {
            e.preventDefault();
            setHandle(e.target.value);
          }}
          value={handle}
          placeholder="Handler"
        />
        <button onClick={signIn}>Sign in</button>
      </div>
    </>
  );
}
