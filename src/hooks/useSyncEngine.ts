import { useEffect } from "react";
import { onNetworkStatusChange } from "~/lib/mobile/native-service";
import { processSyncQueue, type TRPCClient } from "~/lib/mobile/sync-engine";
import { api } from "~/trpc/react";

interface AppListener {
  remove(): void;
}

export const useSyncEngine = () => {
  const utils = api.useUtils();

  useEffect(() => {
    const trpcClient = utils as unknown as TRPCClient;
    void processSyncQueue(trpcClient);

    let unsubscribeNetwork: (() => void) | undefined;
    void onNetworkStatusChange((status) => {
      if (status.connected) {
        console.log("[SyncEngine] Network connection established, processing sync queue...");
        void processSyncQueue(trpcClient);
      }
    }).then((unsub) => {
      unsubscribeNetwork = unsub;
    });

    let appListener: AppListener | undefined;
    void import("@capacitor/app").then(({ App }) => {
      void App.addListener("appStateChange", (state) => {
        if (state.isActive) {
          console.log("[SyncEngine] App foregrounded, processing sync queue...");
          void processSyncQueue(trpcClient);
        }
      }).then((listener) => {
        appListener = listener;
      });
    });

    return () => {
      if (unsubscribeNetwork) unsubscribeNetwork();
      if (appListener) appListener.remove();
    };
  }, [utils]);
};
