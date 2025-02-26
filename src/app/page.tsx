import BlueskyAuthenticator from "@/components/BlueskyAuthenticator";
import StorachaAuthenticator from "@/components/StorachaAuthenticator";

export default function Home () {
  return (
    <div>
      <h1>Bluesky Backup Webapp</h1>
      <p>Lets get started</p>
      <h4>Bluesky Auth</h4>
      <BlueskyAuthenticator />

      <h4>Storacha Auth</h4>
      <StorachaAuthenticator />
    </div>
  )
}
