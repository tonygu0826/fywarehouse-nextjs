'use client';

import { useState, FormEvent } from 'react';
import type { ShipmentStatus } from '@/lib/borderconnect';
import styles from './Tracking.module.css';

type TrackingTexts = {
  inputPlaceholder: string;
  buttonText: string;
  loadingText: string;
  errorGeneric: string;
  ccnLabel: string;
  statusLabel: string;
  transactionLabel: string;
  officeLabel: string;
  timestampLabel: string;
  releasedText: string;
  acceptedText: string;
  notOnFileText: string;
  pendingText: string;
  errorText: string;
};

type Props = {
  texts: TrackingTexts;
};

const STATUS_ICONS: Record<string, string> = {
  released: '\u2713',
  accepted: '\u231B',
  not_on_file: '\u26A0',
  pending: '\u231B',
  error: '\u2717',
  held: '\u26D4',
  examination: '\u{1F50D}',
};

const STATUS_STYLES: Record<string, string> = {
  released: 'statusReleased',
  accepted: 'statusAccepted',
  not_on_file: 'statusNotOnFile',
  pending: 'statusPending',
  error: 'statusError',
  held: 'statusError',
  examination: 'statusNotOnFile',
};

export function TrackingClient({ texts }: Props) {
  // Auth state
  const [authed, setAuthed] = useState(false);
  const [authCcn, setAuthCcn] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tracking state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShipmentStatus | null>(null);
  const [error, setError] = useState('');

  // ── Login: validate CCN format then query ──
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    const trimmed = authCcn.trim().toUpperCase();
    if (!trimmed || trimmed.length < 8) {
      setAuthError('Please enter a valid CCN (minimum 8 characters).');
      return;
    }

    // Validate format: must be alphanumeric (dash allowed in first 4 chars)
    if (!/^[A-Z0-9-]{8,25}$/.test(trimmed)) {
      setAuthError('Invalid CCN format. Only letters, numbers, and dashes are allowed.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ccn: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError('Connection error. Please try again.');
      } else {
        // Login successful — show result regardless of status
        setAuthed(true);
        setAuthCcn(trimmed);
        setResult(data.data);
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }

  // ── Track another CCN after login ──
  const [searchCcn, setSearchCcn] = useState('');

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = searchCcn.trim();
    if (!trimmed || trimmed.length < 4) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ccn: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || texts.errorGeneric);
      } else {
        setResult(data.data);
      }
    } catch {
      setError(texts.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setAuthed(false);
    setAuthCcn('');
    setResult(null);
    setError('');
    setSearchCcn('');
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'released': return texts.releasedText;
      case 'accepted': return texts.acceptedText;
      case 'not_on_file': return texts.notOnFileText;
      case 'pending': return texts.pendingText;
      case 'error': return texts.errorText;
      case 'held': return 'Held by CBSA';
      case 'examination': return 'Examination Required';
      default: return status;
    }
  }

  // ── Login Screen ──
  if (!authed) {
    return (
      <div className={styles.searchSection}>
        <div className={styles.searchCard}>
          <div className={styles.loginHeader}>
            <div className={styles.lockIcon}>🔒</div>
            <h3 className={styles.loginTitle}>Secure Shipment Access</h3>
            <p className={styles.loginDesc}>
              Enter your Cargo Control Number (CCN) to verify your identity and access shipment tracking.
            </p>
          </div>
          <form className={styles.searchForm} onSubmit={handleLogin}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Enter your CCN to login..."
                value={authCcn}
                onChange={(e) => setAuthCcn(e.target.value)}
                disabled={authLoading}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              className={styles.searchButton}
              disabled={authLoading || authCcn.trim().length < 8}
            >
              {authLoading ? '...' : 'Login'}
            </button>
          </form>
          {authError && <p className={styles.authError}>{authError}</p>}
        </div>
      </div>
    );
  }

  // ── Authenticated: Tracking Dashboard ──
  return (
    <>
      {/* Session bar */}
      <div className={styles.sessionBar}>
        <span className={styles.sessionText}>
          🔓 Logged in with: <strong>{authCcn.trim().toUpperCase()}</strong>
        </span>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Search another CCN */}
      <div className={styles.searchSection}>
        <div className={styles.searchCard}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={texts.inputPlaceholder}
                value={searchCcn}
                onChange={(e) => setSearchCcn(e.target.value)}
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <button
              type="submit"
              className={styles.searchButton}
              disabled={loading || searchCcn.trim().length < 4}
            >
              {loading ? '...' : texts.buttonText}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      {(loading || result || error) && (
        <div className={styles.resultSection}>
          {loading && (
            <div className={styles.loadingWrapper}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>{texts.loadingText}</p>
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          {result && !loading && (
            <div className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <div className={`${styles.statusIcon} ${styles[STATUS_STYLES[result.status]]}`}>
                  {STATUS_ICONS[result.status]}
                </div>
                <div>
                  <h3 className={styles.statusTitle}>{getStatusText(result.status)}</h3>
                  <p className={styles.statusSubtitle}>{result.statusText}</p>
                </div>
              </div>
              <div className={styles.resultDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{texts.ccnLabel}</span>
                  <span className={styles.detailValue}>{result.ccn}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>{texts.statusLabel}</span>
                  <span className={styles.detailValue}>{getStatusText(result.status)}</span>
                </div>
                {result.transactionNumber && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{texts.transactionLabel}</span>
                    <span className={styles.detailValue}>{result.transactionNumber}</span>
                  </div>
                )}
                {result.releaseOffice && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{texts.officeLabel}</span>
                    <span className={styles.detailValue}>{result.releaseOfficeName ? `${result.releaseOfficeName} (${result.releaseOffice})` : result.releaseOffice}</span>
                  </div>
                )}
                {result.driverName && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Driver</span>
                    <span className={styles.detailValue}>{result.driverName}</span>
                  </div>
                )}
                {result.serviceOption && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Service</span>
                    <span className={styles.detailValue}>{result.serviceOption}</span>
                  </div>
                )}
                {result.deliveryInstructions && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Instructions</span>
                    <span className={styles.detailValue}>{result.deliveryInstructions}</span>
                  </div>
                )}
                {result.timestamp && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>{texts.timestampLabel}</span>
                    <span className={styles.detailValue}>
                      {new Date(result.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
