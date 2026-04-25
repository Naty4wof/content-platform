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
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,_#fff7ed,_#f8fafc_60%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-amber-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="warning">Editor</Badge>
            <Badge variant="subtle">Content tools</Badge>
          </div>

          <div className="mt-5 max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              A focused workspace for writing and shaping content.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              The editor app can now use the same shared UI system while keeping
              its own workflow-specific surface.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button>Start editing</Button>
            <Button variant="secondary">Open preview</Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Shared patterns</CardTitle>
            <CardDescription>
              Keep component styling consistent across the monorepo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Build on <Code>Button</Code>, <Code>Card</Code>,{" "}
              <Code>Badge</Code>, and
              <Code>Code</Code> before introducing editor-specific pieces.
            </p>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
              This gives you a single design language now and a safer way to
              expand later.
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="success">Reusable</Badge>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
