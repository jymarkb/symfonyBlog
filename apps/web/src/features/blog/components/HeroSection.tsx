export function HeroSection() {
  return (
    <section className="shell py-20 md:py-32">
      <p className="section-eyebrow mb-6">Independent tech writing</p>

      <h1 className="h-display max-w-3xl text-5xl md:text-7xl">
        Deep dives for{" "}
        <span className="text-accent-gradient">engineers who build</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-3">
        Practical guides, architecture breakdowns, and honest opinions on the
        tools that actually matter — written by practitioners, not pundits.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <a href="/blog" className="btn btn-primary">
          Read the blog
        </a>
        <a href="/blog#tags" className="btn btn-ghost">
          Browse topics
        </a>
      </div>
    </section>
  );
}
