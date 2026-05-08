interface Props {
  eyebrow: string;
  heading: string;
  em: string;
  lede: string;
}

export function AuthIntro({ eyebrow, heading, em, lede }: Props) {
  return (
    <>
      <div className="eyebrow mb-4">{eyebrow}</div>
      <h1>
        {heading} <em>{em}</em>.
      </h1>
      <p className="lede">{lede}</p>
    </>
  );
}
