import BackupButton from "@/components/BackupButton";
import BlueskyAuthenticator from "@/components/BlueskyAuthenticator";
import StorachaAuthenticator from "@/components/StorachaAuthenticator";

export default function Home () {
  return (
    <div className="bg-white/80 p-10 h-screen">
      <h1 className="text-2xl mb-8">Bluesky Backups</h1>
      <div className="mb-4">
        <h4 className="text-lg">Bluesky Auth</h4>
        <BlueskyAuthenticator />
      </div>

      <div className="mb-4">
        <h4 className="text-lg">Storacha Auth</h4>
        <StorachaAuthenticator />
      </div>

      <BackupButton />
    </div>
  )
}
