import { strengthLabel } from "@/features/auth/lib/validation";

interface Props {
  password: string;
  strength: 0 | 1 | 2 | 3 | 4;
}

export function PasswordStrengthHint({ password, strength }: Props) {
  if (!password) return null;

  return (
    <>
      <div aria-hidden="true" className={`strength s-${strength}`}>
        <i />
        <i />
        <i />
        <i />
      </div>
      <span className="hint">
        Strength: {strengthLabel(strength)}.
        {strength < 3 ? " Try a passphrase." : strength === 4 ? " Excellent!" : " Nice."}
      </span>
    </>
  );
}
