import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { ClassFeeTable } from "~/components/tables/ClassFee";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Coins, Receipt } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ classId: string; sessionId: string }>;
};

export default async function FeeDetailsPage({ searchParams }: PageProps) {
  const searchProps = await searchParams;

  const breadcrumbs = [
    { href: "/clerk", label: "Dashboard" },
    { href: "/clerk/sessions", label: "Sessions" },
    {
      href: `/clerk/sessions/${searchProps.sessionId}`,
      label: "Session Details",
    },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <PageHeader breadcrumbs={breadcrumbs} />

        <div className="container mx-auto flex-1 px-4 py-8 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1920px] space-y-6 duration-700 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
              <h1 className="flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-foreground">
                <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 shadow-lg shadow-emerald-900/20">
                  <Coins className="h-6 w-6 text-emerald-400" />
                </span>
                Fee Details
              </h1>
              <p className="ml-1 max-w-2xl text-muted-foreground">
                Manage fee structures, update amounts, and track payment records
                for this specific class within the active session.
              </p>
            </div>

            {/* Main Card */}
            <Card className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-card shadow-2xl backdrop-blur-xl">
              <CardHeader className="border-b border-emerald-500/10 bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                      <Receipt className="h-5 w-5 text-emerald-400" />
                      Class Fee Registry
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Detailed breakdown of fees assigned to this class.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)] w-full">
                  <div className="p-6">
                    <ClassFeeTable
                      sessionId={searchProps.sessionId}
                      classId={searchProps.classId}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
