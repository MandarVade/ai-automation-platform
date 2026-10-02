import React from 'react';
import { ModelScoreBreakdown } from '../../types/model';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown?: ModelScoreBreakdown;
  allCandidates?: ModelScoreBreakdown[];
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  allCandidates = []
}) => {
  if (!isOpen || !breakdown) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              AUTONOMOUS MODEL SELECTION
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>
              Why {breakdown.modelName}?
            </h3>
          </div>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Winner Overview Card */}
          <div
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span className={`location-badge ${breakdown.location}`} style={{ marginRight: '8px' }}>
                  {breakdown.location}
                </span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Selected Model</span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: 'var(--status-success)', fontWeight: 700 }}>
                Score: {breakdown.totalScore} / 100
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {breakdown.reasons.map((reason, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--status-success)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Factors Breakdown Table */}
          <div>
            <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
              MULTI-FACTOR EVALUATION SCORE MATRIX
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}
            >
              <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '4px' }}>
                <div className="stat-label">Capability Fit</div>
                <div className="stat-value">{breakdown.capabilityFit}%</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '4px' }}>
                <div className="stat-label">Model Quality</div>
                <div className="stat-value">{breakdown.accuracyScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '4px' }}>
                <div className="stat-label">Latency Fit</div>
                <div className="stat-value">{breakdown.latencyScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '4px' }}>
                <div className="stat-label">Hardware Fit</div>
                <div className="stat-value">{breakdown.hardwareFitScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '4px' }}>
                <div className="stat-label">Battery Profile</div>
                <div className="stat-value">{breakdown.batteryFitScore}%</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '4px' }}>
                <div className="stat-label">RAM Headroom</div>
                <div className="stat-value">{breakdown.memoryFitScore}%</div>
              </div>
            </div>
          </div>

          {/* Other Candidates Comparison */}
          {allCandidates.length > 1 && (
            <div>
              <h4 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                COMPETING CANDIDATES EVALUATED ({allCandidates.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {allCandidates.map((c) => (
                  <div
                    key={c.modelId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: c.selected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-app)',
                      border: c.selected ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: c.selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {c.modelName} {c.selected && '★ (Chosen)'}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Location: {c.location} | Penalty: -{c.resourcePenalty}
                        {c.disqualificationReason && (
                          <span style={{ color: 'var(--status-error)', marginLeft: '8px' }}>
                            {c.disqualificationReason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {c.disqualificationReason ? 'DISQUALIFIED' : `${c.totalScore} pts`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
