import { useState } from "react";

import { deleteAccount } from "@/features/profile/api/profileApi";
import { supabase } from "@/lib/auth/supabaseClient";
import { getAccessToken } from "@/lib/auth/getAccessToken";
import { logError } from "@/lib/utils/logError";

export function ProfileDangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleRequestDelete() {
    setConfirming(true);
  }

  function handleCancel() {
    setConfirming(false);
    setError(null);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      await deleteAccount(accessToken);
      await supabase.auth.signOut();
      window.location.replace("/");
    } catch (error) {
      logError(error);
      setError("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="danger-section">
      <h2>Delete account</h2>
      <p>
        Permanently removes your account, comment history, and reading data. This cannot be undone.
        Your comments on public posts will be anonymised.
      </p>
      {error && <div className="form-alert">{error}</div>}
      {confirming ? (
        <div>
          <p>
            <strong>Are you sure?</strong> This action is permanent and cannot be reversed.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-sm"
              disabled={isDeleting}
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-danger"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              type="button"
            >
              {isDeleting ? "Deleting…" : "Yes, delete my account"}
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-sm btn-danger"
          onClick={handleRequestDelete}
          type="button"
        >
          Delete my account
        </button>
      )}
    </div>
  );
}
