export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          Public data, explored responsibly.{" "}
          <a
            className="underline decoration-border underline-offset-4 transition-colors hover:text-accent"
            href="https://github.com/aceyq/repeat-signal/blob/main/docs/ETHICS.md"
            target="_blank"
            rel="noreferrer"
          >
            Data limitations &amp; ethics
          </a>
        </p>
        <a
          className="underline decoration-border underline-offset-4 transition-colors hover:text-accent"
          href="https://github.com/aceyq/repeat-signal"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
