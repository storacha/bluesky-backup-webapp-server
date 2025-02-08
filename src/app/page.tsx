"use client";

import { useBskyAuthContext } from "@/contexts/bskyAuthProvider";
import { bskyAuthClient } from "@/instances";
import { useCallback, useState } from "react";

export default function Home() {
  const { authenticated } = useBskyAuthContext();

  const [handle, setHandle] = useState<string>("");

  const signIn = useCallback(async () => {
    try {
      await bskyAuthClient.signIn(handle, {
        display: "popup",
      });
    } catch (err) {
      console.log(err);
    }
  }, [handle]);

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
