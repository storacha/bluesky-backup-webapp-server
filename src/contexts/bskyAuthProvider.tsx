import { Agent } from "@atproto/api";
import { ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import {
  OAuthSession,
  BrowserOAuthClient,
} from "@atproto/oauth-client-browser";
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
  bskyAuthClient?: BrowserOAuthClient;
};

const BskyAuthContext = createContext<BskyAuthContextProps>({
  authenticated: false,
});

type Props = {
  children: JSX.Element | JSX.Element[] | ReactNode;
};

export const BskyAuthProvider = ({ children }: Props) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [bskyAuthClient, setBskyAuthClient] = useState<BrowserOAuthClient>();
  const [session, setSession] = useState<OAuthSession>();
  const [state, setState] = useState<string>();

  const bskyAgent = useMemo(() => {
    if (!authenticated || !session) return;
    const agent = new Agent(session);
    return agent;
  }, [authenticated, session]);

  const { data: userProfile } = useQuery({
    queryKey: ["bsky", "profile"],
    queryFn: async () => {
      if (!authenticated || !bskyAgent || !bskyAgent.did) return;
      const result = (await bskyAgent.getProfile({ actor: bskyAgent.did }))
        .data;
      return result;
    },
    enabled: authenticated && !!bskyAgent,
  });

  useEffect(() => {
    const initBsky = async () => {
      const bskyAuthClient = await BrowserOAuthClient.load({
        clientId: "https://spread-accurately-group-misc.trycloudflare.com/",
        handleResolver: "https://bsky.social",
      });
      setBskyAuthClient(bskyAuthClient);

      const result = await bskyAuthClient.init(true);

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
        bskyAuthClient,
      }}
    >
      {children}
    </BskyAuthContext.Provider>
  );
};

export const useBskyAuthContext = () => {
  return useContext(BskyAuthContext);
};
