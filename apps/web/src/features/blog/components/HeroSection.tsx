type Props = {
  total?: number;
};

export function HeroSection({ total }: Props) {
  return (
    <section className="hs">
      <div className="hs-inner">
        <h1 className="hs-h1">
          Notes on building web software<br />
          the <em>slow</em>, deliberate way.
        </h1>
        <p className="hs-p">
          Long-form pieces on web engineering and the practice of building things well. No fluff.
        </p>
        <div className="hs-actions">
          <a href="/archive" className="btn btn-primary">Browse essays</a>
          <a href="/about" className="btn">About me</a>
        </div>
        {total !== undefined && (
          <p className="hs-stat">{total} essays and counting</p>
        )}
      </div>
    </section>
  );
}
