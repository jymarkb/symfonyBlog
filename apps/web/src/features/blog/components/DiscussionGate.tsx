type Props = {
  onSignIn: () => void;
};

export function DiscussionGate({ onSignIn }: Props) {
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
