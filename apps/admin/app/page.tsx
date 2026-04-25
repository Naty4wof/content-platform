import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_70%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success">Admin</Badge>
            <Badge variant="subtle">Shared UI connected</Badge>
          </div>

          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Admin workspace built from shared primitives.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              This page is now using the monorepo UI package, so the same
              button, card, badge, and code styles can move into client and
              editor without duplication.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button>Open content queue</Button>
            <Button variant="secondary">Review drafts</Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Content ready</CardTitle>
              <CardDescription>
                Drafts waiting for review and publishing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">24</div>
              <p className="mt-2 text-sm text-slate-600">
                Items in the moderation queue.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="warning">Needs review</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing status</CardTitle>
              <CardDescription>
                Last release and current health.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">98%</div>
              <p className="mt-2 text-sm text-slate-600">
                Successful publishes this week.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="success">Healthy</Badge>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shared UI preview</CardTitle>
              <CardDescription>
                Same primitives will drive every app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">
                Use the package root import from <code>@repo/ui</code> and keep
                the visual language consistent across the monorepo.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="ghost">
                View component source
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
}
