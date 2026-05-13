import { useEffect, useState } from 'react';

import { fetchExperimentReport } from '@/features/auth/api/experimentAdminApi';
import type { ExperimentVariantReport } from '@/features/auth/authTypes';
import { getAccessToken } from '@/lib/auth/getAccessToken';

export default function ExperimentsPage() {
  const [rows, setRows] = useState<ExperimentVariantReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = await getAccessToken();
        const data = await fetchExperimentReport('auth_gate', token);
        if (!cancelled) {
          setRows(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load experiment data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1>Experiment Dashboard</h1>

      {loading && <p>Loading&hellip;</p>}

      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && rows !== null && rows.length === 0 && (
        <p>No data yet.</p>
      )}

      {!loading && !error && rows !== null && rows.length > 0 && (
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={thStyle}>Variant</th>
              <th style={thStyle}>Triggered</th>
              <th style={thStyle}>Converted</th>
              <th style={thStyle}>Dismissed</th>
              <th style={thStyle}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.variant}>
                <td style={tdStyle}>{row.variant}</td>
                <td style={tdStyle}>{row.triggered}</td>
                <td style={tdStyle}>{row.converted}</td>
                <td style={tdStyle}>{row.dismissed}</td>
                <td style={tdStyle}>{row.conversion_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #e5e7eb',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};
