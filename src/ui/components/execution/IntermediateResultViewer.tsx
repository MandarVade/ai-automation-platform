import React, { useState } from 'react';
import { Button } from '../ui';
import { Copy, Check, Code, FileText, Image as ImageIcon, Eye } from 'lucide-react';

export interface IntermediateResultViewerProps {
  data: any;
  title?: string;
  className?: string;
}

/**
 * Result-first output viewer for intermediate step data.
 * Intelligently renders readable text, structured key-value pairs,
 * images, or arrays, with raw JSON available via progressive disclosure.
 */
export const IntermediateResultViewer: React.FC<IntermediateResultViewerProps> = ({
  data,
  title = 'Step Result',
  className = '',
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (data === undefined || data === null) {
    return (
      <div className={`el-result-viewer el-result-viewer--empty ${className}`.trim()}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          No output data produced for this step yet.
        </span>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Image Data detection
  const isImagePayload =
    typeof data === 'object' &&
    data !== null &&
    (data.image || (data.type === 'IMAGE' && typeof data.data === 'string'));
  const imageUrl = isImagePayload ? data.image || data.data : null;

  // 2. String/Text Output
  const isStringOutput = typeof data === 'string';

  // 3. Array Output
  const isArrayOutput = Array.isArray(data);

  // 4. Structured Object
  const isObjectOutput = typeof data === 'object' && data !== null && !isArrayOutput && !isImagePayload;

  return (
    <div className={`el-result-viewer ${className}`.trim()}>
      <div className="el-result-viewer__header">
        <span className="el-result-viewer__title">
          {isImagePayload ? (
            <ImageIcon size={12} aria-hidden="true" />
          ) : isStringOutput ? (
            <FileText size={12} aria-hidden="true" />
          ) : (
            <Code size={12} aria-hidden="true" />
          )}
          <span>{title}</span>
        </span>

        <div className="el-result-viewer__actions">
          {/* Toggle between Structured View and Raw JSON */}
          {(isObjectOutput || isArrayOutput) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRawJson((prev) => !prev)}
              aria-label={showRawJson ? 'Switch to readable structured view' : 'Switch to raw JSON view'}
              className="el-result-viewer__toggle-btn"
            >
              {showRawJson ? 'Formatted View' : 'Raw JSON'}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label="Copy output data"
            title="Copy to clipboard"
            className="el-result-viewer__copy-btn"
          >
            {copied ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      <div className="el-result-viewer__body">
        {showRawJson ? (
          // Progressive Disclosure: Raw JSON
          <pre className="el-result-viewer__raw-code" tabIndex={0} aria-label="Raw JSON output">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        ) : isImagePayload && imageUrl ? (
          // Image Preview
          <div className="el-result-viewer__image-wrapper">
            <img
              src={imageUrl}
              alt={data.fileName || 'Execution step image output'}
              className="el-result-viewer__image"
            />
            {data.fileName && (
              <span className="el-result-viewer__image-caption">{data.fileName}</span>
            )}
          </div>
        ) : isStringOutput ? (
          // Human-Readable Text
          <div className="el-result-viewer__text-box">
            <pre className="el-result-viewer__text-content">{data}</pre>
          </div>
        ) : isArrayOutput ? (
          // Human-Readable List
          <div className="el-result-viewer__list">
            {data.map((item, idx) => (
              <div key={idx} className="el-result-viewer__list-item">
                <span className="el-result-viewer__list-idx">{idx + 1}.</span>
                <span className="el-result-viewer__list-val">
                  {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                </span>
              </div>
            ))}
          </div>
        ) : isObjectOutput ? (
          // Human-Readable Structured Key-Value Grid
          <div className="el-result-viewer__kv-grid">
            {Object.entries(data).map(([key, val]) => {
              if (key === 'image' || key === 'rawText') return null;
              const displayVal =
                typeof val === 'object' && val !== null
                  ? JSON.stringify(val)
                  : String(val);

              return (
                <div key={key} className="el-result-viewer__kv-row">
                  <span className="el-result-viewer__kv-key">{key}</span>
                  <span className="el-result-viewer__kv-val">{displayVal}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <pre className="el-result-viewer__raw-code">
            <code>{String(data)}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
