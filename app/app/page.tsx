import type { Metadata } from "next";
import { SiteFooter, SiteHeader, SkipLink } from "../components/site-chrome";
import { Pad } from "../components/pad";

export const metadata: Metadata = {
  title: "Pad · Foulcopy",
  description:
    "Record a take and read the spoken vs send ready DIFF. 16 kHz mono PCM through one AssemblyAI Dictation POST.",
  alternates: { canonical: "/app" },
};

export default function AppPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="app" />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Record a take, then read the DIFF
          </h1>
          <div className="mt-6">
            <Pad />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
