import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isNative } from "~/lib/mobile/native-service";

export const useDeepLinks = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isNative()) return;

    let appListener: any;
    import("@capacitor/app").then(({ App }) => {
      App.addListener("appUrlOpen", (data: any) => {
        console.log("[DeepLinks] Received deep link URL:", data.url);
        try {
          // data.url format is expected to be: msns://lms/reports/{examId} or msns://lms/approvals/{poId}
          const rawUrl = data.url;
          if (rawUrl.startsWith("msns://lms/reports/")) {
            const examId = rawUrl.substring("msns://lms/reports/".length);
            if (examId) {
              console.log("[DeepLinks] Routing to reports:", examId);
              router.push(`/student/reports/${examId}`);
            }
          } else if (rawUrl.startsWith("msns://lms/approvals/")) {
            const poId = rawUrl.substring("msns://lms/approvals/".length);
            if (poId) {
              console.log("[DeepLinks] Routing to approvals:", poId);
              router.push(`/admin/erp/purchase-orders?poId=${poId}`);
            }
          }
        } catch (err) {
          console.error("[DeepLinks] Error parsing deep link URL:", err);
        }
      }).then((listener) => {
        appListener = listener;
      });
    });

    return () => {
      if (appListener) appListener.remove();
    };
  }, [router]);
};
