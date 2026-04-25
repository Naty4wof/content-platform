import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Code,
} from "@repo/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eff6ff_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
          <Badge variant="subtle">Client portal</Badge>
          <div className="mt-5 max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Reusable UI for the customer-facing app.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              This app can now share the same component package as admin, while
              still keeping its own layout and content.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Browse updates</Button>
            <Button variant="secondary">Contact support</Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Developer notes</CardTitle>
            <CardDescription>
              What the client app imports from the shared package.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Import components from <Code>@repo/ui</Code> and keep
              page-specific logic in the app folder.
            </p>
            <div className="rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
              <code>Button</code>, <code>Card</code>, <code>Badge</code>, and{" "}
              <code>Code</code>
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="success">Ready to extend</Badge>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
