export function Hero() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight">HookHub</h1>
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
        Community hooks for Claude Code, filterable by the event they react to. Every card links to the hook&apos;s
        GitHub repository.
      </p>
    </header>
  );
}
