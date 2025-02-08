import { bskyAuthClient } from "@/instances";
import { Agent } from "@atproto/api";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { OAuthSession } from "@atproto/oauth-client-browser";
import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  JSX,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BskyAuthContextProps = {
  authenticated: boolean;
  session?: OAuthSession;
  state?: string;
  userProfile?: ProfileViewBasic;
};

const BskyAuthContext = createContext<BskyAuthContextProps>({
  authenticated: false,
});

type Props = {
  children: JSX.Element | JSX.Element[] | ReactNode;
};

export const BskyAuthProvider = ({ children }: Props) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [session, setSession] = useState<OAuthSession>();
  const [state, setState] = useState<string>();

  const bskyAgent = useMemo(() => {
    if (!authenticated || !session) return;
    return new Agent(session);
  }, [authenticated, session]);

  const { data: userProfile } = useQuery({
    queryKey: ["bsky", "profile"],
    queryFn: async () => {
      if (!authenticated || !bskyAgent) return;
      const result = (
        await bskyAgent.getProfile({ actor: bskyAgent.assertDid })
      ).data;
      return result;
    },
    enabled: authenticated && !!bskyAgent,
  });

  useEffect(() => {
    const initBsky = async () => {
      const result = await bskyAuthClient.init();

      if (result) {
        const { session, state } = result as {
          session: OAuthSession;
          state: string | null;
        };

        if (state != null) {
          console.log(
            `${session.sub} was successfully authenticated (state: ${state})`
          );
          setAuthenticated(true);
          setSession(session);
          setState(state);
        } else {
          console.log(`${session.sub} was restored (last active session)`);
          setAuthenticated(true);
          setSession(session);
        }
      }
    };

    initBsky();
  }, []);

  return (
    <BskyAuthContext.Provider
      value={{
        authenticated,
        session,
        state,
        userProfile,
      }}
    >
      {children}
    </BskyAuthContext.Provider>
  );
};

export const useBskyAuthContext = () => {
  return useContext(BskyAuthContext);
};
