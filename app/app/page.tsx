import { SiteFooter, SiteHeader, SkipLink } from "../components/site-chrome";
import { Pad } from "../components/pad";

export default function AppPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="app" />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Pad</h1>
          <div className="mt-6">
            <Pad />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
