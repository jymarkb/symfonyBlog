type Props = {
  variant: 'empty' | 'nudge';
  onSignIn: () => void;
};

export function DiscussionGate({ variant, onSignIn }: Props) {
  if (variant === 'nudge') {
    return (
      <div className="discussion-gate">
        <div className="discussion-gate-left">
          <div className="gate-avatars">
            <div className="gate-avatar a" aria-hidden="true">J</div>
            <div className="gate-avatar b" aria-hidden="true">S</div>
            <div className="gate-avatar c" aria-hidden="true">A</div>
          </div>
          <span className="gate-message">Join the conversation.</span>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => void onSignIn()}
          aria-label="Sign in to comment"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="discussion-gate">
      <div className="discussion-gate-left">
        <div className="gate-avatars">
          <div className="gate-avatar" style={{ opacity: 0.5 }} aria-hidden="true" />
          <div className="gate-avatar" style={{ opacity: 0.3 }} aria-hidden="true" />
        </div>
        <span className="gate-message">Sign in to join the discussion.</span>
      </div>
      <button
        className="btn btn-sm btn-primary"
        onClick={() => void onSignIn()}
        aria-label="Sign in to comment"
      >
        Sign in
      </button>
    </div>
  );
}
