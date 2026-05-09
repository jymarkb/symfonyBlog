import { useState } from "react";

export function NewsletterBlock() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="newsletter">
        <h4>Get new essays in your inbox</h4>
        <p className="nl-meta">✓ Confirmation sent.</p>
      </div>
    );
  }

  return (
    <div className="newsletter">
      <h4>Get new essays in your inbox</h4>
      <p>
        One email when something new is published. No tracking, no funnel, no
        sequence — just the post.
      </p>
      <form className="nl-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="you@somewhere.com" />
        <button type="submit" className="btn btn-primary">
          Subscribe
        </button>
        <div className="nl-meta">2,841 subscribers · unsubscribe any time</div>
      </form>
    </div>
  );
}
