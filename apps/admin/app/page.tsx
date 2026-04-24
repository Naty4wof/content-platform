
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-black">
      <div className="bg-white dark:bg-zinc-900 p-10 rounded-xl shadow-md flex flex-col gap-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Admin Dashboard
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400">
          This is the admin panel for managing articles.
        </p>

        <div className="flex gap-4">
          <p>HI there this is the admin</p>
        </div>
      </div>
    </div>
  );
}