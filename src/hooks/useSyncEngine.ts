import { useEffect } from "react";
import { onNetworkStatusChange } from "~/lib/mobile/native-service";
import { processSyncQueue } from "~/lib/mobile/sync-engine";
import { api } from "~/trpc/react";

export const useSyncEngine = () => {
  const utils = api.useUtils();

  useEffect(() => {
    void processSyncQueue(utils);

    let unsubscribeNetwork: (() => void) | undefined;
    onNetworkStatusChange((status) => {
      if (status.connected) {
        console.log("[SyncEngine] Network connection established, processing sync queue...");
        void processSyncQueue(utils);
      }
    }).then((unsub) => {
      unsubscribeNetwork = unsub;
    });

    let appListener: any;
    import("@capacitor/app").then(({ App }) => {
      App.addListener("appStateChange", (state) => {
        if (state.isActive) {
          console.log("[SyncEngine] App foregrounded, processing sync queue...");
          void processSyncQueue(utils);
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
