import Link from "next/link";
import { SiteFooter, SiteHeader, SkipLink } from "./components/site-chrome";

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="home" />
      <main id="main" className="mx-auto flex max-w-6xl flex-1 flex-col px-6 py-24">
        <p className="micro">Missing page</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          That route is not on this sheet.
        </h1>
        <Link href="/" className="btn btn-primary mt-8 w-fit">
          Back to Foulcopy
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
