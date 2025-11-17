export function AppFooter() {
  const version = import.meta.env.VITE_APP_VERSION;

  return (
    <footer className="border-t bg-white dark:bg-slate-950">
      <div className="container flex h-12 items-center justify-between text-xs text-muted-foreground">
        <p>© 2025 Tasks</p>
        <p>v{version}</p>
      </div>
    </footer>
  );
}
