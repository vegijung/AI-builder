import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { theme } from '../../styles/theme';
import { syncFromExcel } from '../../services/dataService';

const MAX_ROWS = 500;

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const bbSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('building'))];
        const ucSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('use'))];

        if (!bbSheet) return reject(new Error('No sheet found containing "Building" in its name.'));
        if (!ucSheet) return reject(new Error('No sheet found containing "Use" in its name.'));

        const bbRaw = XLSX.utils.sheet_to_json(bbSheet, { defval: '' });
        const ucRaw = XLSX.utils.sheet_to_json(ucSheet, { defval: '' });

        resolve({ bbRaw, ucRaw });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

function findColumn(row, candidates) {
  for (const c of candidates) {
    const key = Object.keys(row).find(k => k.toLowerCase().trim() === c.toLowerCase());
    if (key !== undefined) return key;
  }
  return null;
}

function transformBuildingBlocks(bbRaw) {
  if (bbRaw.length === 0) return { blocks: [], errors: ['Building Blocks sheet is empty.'] };
  if (bbRaw.length > MAX_ROWS) return { blocks: [], errors: [`Building Blocks sheet has ${bbRaw.length} rows (max ${MAX_ROWS}).`] };
  const errors = [];
  const sample = bbRaw[0];
  const nameCol = findColumn(sample, ['name']);
  const catCol = findColumn(sample, ['category']);
  const scoreCol = findColumn(sample, ['score', 'maturity']);

  if (!nameCol) errors.push('Building Blocks sheet: "Name" column not found.');
  if (!catCol) errors.push('Building Blocks sheet: "Category" column not found.');
  if (!scoreCol) errors.push('Building Blocks sheet: "Score" / "Maturity" column not found.');
  if (errors.length > 0) return { blocks: [], errors };

  const blocks = [];
  bbRaw.forEach((row, i) => {
    const name = String(row[nameCol] || '').trim();
    const category = String(row[catCol] || '').trim();
    const maturity = parseInt(row[scoreCol], 10);

    if (!name) return;
    if (name.length > 200) { errors.push(`Row ${i + 2}: Building block name exceeds 200 characters.`); return; }
    if (!category) { errors.push(`Row ${i + 2}: Building block "${name}" has no category.`); return; }
    if (category.length > 200) { errors.push(`Row ${i + 2}: Category name exceeds 200 characters.`); return; }
    if (isNaN(maturity) || maturity < 1 || maturity > 5) {
      errors.push(`Row ${i + 2}: Building block "${name}" has invalid score "${row[scoreCol]}" (must be 1-5).`);
      return;
    }
    blocks.push({ name, category, maturity });
  });

  return { blocks, errors };
}

function transformUseCases(ucRaw) {
  if (ucRaw.length === 0) return { useCases: [], errors: ['Use Cases sheet is empty.'] };
  if (ucRaw.length > MAX_ROWS) return { useCases: [], errors: [`Use Cases sheet has ${ucRaw.length} rows (max ${MAX_ROWS}).`] };
  const errors = [];
  const sample = ucRaw[0];
  const nameCol = findColumn(sample, ['use case', 'usecase', 'name']);
  const typeCol = findColumn(sample, ['type']);
  const actCol = findColumn(sample, ['activity']);

  if (!nameCol) errors.push('Use Cases sheet: "Use Case" column not found.');
  if (!typeCol) errors.push('Use Cases sheet: "Type" column not found.');
  if (!actCol) errors.push('Use Cases sheet: "Activity" column not found.');
  if (errors.length > 0) return { useCases: [], errors };

  const blockCols = Object.keys(sample)
    .filter(k => k.toLowerCase().startsWith('building block'))
    .sort();

  const useCases = [];
  ucRaw.forEach((row, i) => {
    const name = String(row[nameCol] || '').trim();
    const activityType = String(row[typeCol] || '').trim();
    const valueChainArea = String(row[actCol] || '').trim();

    if (!name) return;
    if (name.length > 200) { errors.push(`Row ${i + 2}: Use case name exceeds 200 characters.`); return; }
    if (!activityType || !['Primary', 'Support'].includes(activityType)) {
      errors.push(`Row ${i + 2}: Use case "${name}" has invalid type "${activityType}" (must be Primary or Support).`);
      return;
    }
    if (!valueChainArea) { errors.push(`Row ${i + 2}: Use case "${name}" has no activity.`); return; }
    if (valueChainArea.length > 200) { errors.push(`Row ${i + 2}: Activity name exceeds 200 characters.`); return; }

    const buildingBlocks = blockCols
      .map(col => String(row[col] || '').trim())
      .filter(Boolean);

    useCases.push({ name, activityType, valueChainArea, buildingBlocks });
  });

  return { useCases, errors };
}

function validate(blocks, useCases, existingCategories, existingVCAs) {
  const warnings = [];
  const categoryNames = Object.keys(existingCategories);
  const vcaNames = existingVCAs.map(v => v.name || v);

  const blockNameSet = new Set(blocks.map(b => b.name));

  blocks.forEach(b => {
    if (!categoryNames.includes(b.category)) {
      warnings.push(`Building block "${b.name}" references unknown category "${b.category}". It must be added to Categories first.`);
    }
  });

  useCases.forEach(uc => {
    if (!vcaNames.includes(uc.valueChainArea)) {
      warnings.push(`Use case "${uc.name}" references unknown value chain area "${uc.valueChainArea}". It must be added to Value Chain first.`);
    }
    uc.buildingBlocks.forEach(bn => {
      if (!blockNameSet.has(bn)) {
        warnings.push(`Use case "${uc.name}" references building block "${bn}" which is not in the Building Blocks sheet.`);
      }
    });
  });

  return warnings;
}

function computeDiff(blocks, useCases, existingBlocks, existingUseCases) {
  const existingBBNames = new Set(existingBlocks.map(b => b.name));
  const existingUCNames = new Set(existingUseCases.map(u => u.name));
  const newBBNames = new Set(blocks.map(b => b.name));
  const newUCNames = new Set(useCases.map(u => u.name));

  return {
    blocksNew: blocks.filter(b => !existingBBNames.has(b.name)).length,
    blocksUpdated: blocks.filter(b => existingBBNames.has(b.name)).length,
    blocksRemoved: existingBlocks.filter(b => !newBBNames.has(b.name)).length,
    ucNew: useCases.filter(u => !existingUCNames.has(u.name)).length,
    ucUpdated: useCases.filter(u => existingUCNames.has(u.name)).length,
    ucRemoved: existingUseCases.filter(u => !newUCNames.has(u.name)).length,
  };
}

export function ExcelUpload({ categories, buildingBlocks, useCases, valueChainAreas, onComplete, onCancel }) {
  const [step, setStep] = useState('upload'); // upload | preview | syncing | done | error
  const [parsedBlocks, setParsedBlocks] = useState([]);
  const [parsedUCs, setParsedUCs] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [diff, setDiff] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const processFile = useCallback(async (file) => {
    setFileName(file.name);
    setParseErrors([]);
    setValidationWarnings([]);

    try {
      const { bbRaw, ucRaw } = await parseExcel(file);
      const { blocks, errors: bbErrors } = transformBuildingBlocks(bbRaw);
      const { useCases: ucs, errors: ucErrors } = transformUseCases(ucRaw);
      const allErrors = [...bbErrors, ...ucErrors];

      if (allErrors.length > 0) {
        setParseErrors(allErrors);
        setParsedBlocks(blocks);
        setParsedUCs(ucs);
        if (blocks.length === 0 && ucs.length === 0) return;
      }

      const warnings = validate(blocks, ucs, categories, valueChainAreas);
      setValidationWarnings(warnings);
      setParsedBlocks(blocks);
      setParsedUCs(ucs);
      setDiff(computeDiff(blocks, ucs, buildingBlocks, useCases));
      setStep('preview');
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  }, [categories, valueChainAreas, buildingBlocks, useCases]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleSync = async () => {
    setStep('syncing');
    try {
      const result = await syncFromExcel(parsedBlocks, parsedUCs);
      setSyncResult(result);
      setStep('done');
    } catch (err) {
      setErrorMsg(err.message);
      setStep('error');
    }
  };

  const hasBlockingErrors = validationWarnings.some(w =>
    w.includes('unknown category') || w.includes('unknown value chain area')
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(42,37,32,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
    }} onClick={(e) => { if (e.target === e.currentTarget && step !== 'syncing') onCancel(); }}>
      <div style={{
        background: theme.colors.surface, borderRadius: theme.radii.xl,
        padding: 28, width: 620, maxHeight: '85vh', overflowY: 'auto',
        boxShadow: theme.shadows.elevated,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>
            Excel Upload
          </h3>
          {step !== 'syncing' && (
            <button onClick={onCancel} style={{
              background: 'none', border: 'none', fontSize: 20, color: theme.colors.textMuted,
              cursor: 'pointer', padding: 4, lineHeight: 1,
            }}>&times;</button>
          )}
        </div>

        {/* UPLOAD STEP */}
        {step === 'upload' && (
          <div>
            <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginTop: 0, marginBottom: 16 }}>
              Upload an Excel file with two sheets: <strong>Building Blocks</strong> (Name, Category, Score) and <strong>Use Cases</strong> (Use Case, Type, Activity, Building Block 1-6).
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragging ? theme.colors.primary : theme.colors.borderMedium}`,
                borderRadius: theme.radii.xl, padding: 40, textAlign: 'center',
                background: dragging ? theme.colors.primary + '08' : theme.colors.surfaceAlt,
                transition: `all ${theme.transitions.fast}`, cursor: 'pointer',
              }}
              onClick={() => document.getElementById('excel-file-input').click()}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>&#128196;</div>
              <p style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary, margin: '0 0 4px' }}>
                Drop your .xlsx file here
              </p>
              <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted, margin: 0 }}>
                or click to browse
              </p>
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {/* PREVIEW STEP */}
        {step === 'preview' && (
          <div>
            <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginTop: 0, marginBottom: 12 }}>
              Parsed <strong>{fileName}</strong>
            </p>

            {/* Diff summary */}
            {diff && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16,
              }}>
                <div style={{ background: theme.colors.surfaceAlt, borderRadius: theme.radii.lg, padding: 14 }}>
                  <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Building Blocks
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Stat value={diff.blocksNew} label="New" color="#50D8A8" />
                    <Stat value={diff.blocksUpdated} label="Updated" color={theme.colors.primary} />
                    <Stat value={diff.blocksRemoved} label="Removed" color="#D94070" />
                  </div>
                </div>
                <div style={{ background: theme.colors.surfaceAlt, borderRadius: theme.radii.lg, padding: 14 }}>
                  <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Use Cases
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Stat value={diff.ucNew} label="New" color="#50D8A8" />
                    <Stat value={diff.ucUpdated} label="Updated" color={theme.colors.primary} />
                    <Stat value={diff.ucRemoved} label="Removed" color="#D94070" />
                  </div>
                </div>
              </div>
            )}

            {/* Parse errors */}
            {parseErrors.length > 0 && (
              <MessageBox type="error" title={`${parseErrors.length} parsing error${parseErrors.length > 1 ? 's' : ''}`} items={parseErrors} />
            )}

            {/* Validation warnings */}
            {validationWarnings.length > 0 && (
              <MessageBox
                type={hasBlockingErrors ? 'error' : 'warning'}
                title={`${validationWarnings.length} validation issue${validationWarnings.length > 1 ? 's' : ''}`}
                items={validationWarnings}
              />
            )}

            {hasBlockingErrors && (
              <p style={{ fontSize: theme.typography.sizes.lg, color: '#D94070', fontWeight: theme.typography.weights.semibold, marginTop: 8 }}>
                Fix the errors above (add missing categories or value chain areas) before syncing.
              </p>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={handleSync} disabled={hasBlockingErrors} style={{
                padding: '10px 24px', borderRadius: theme.radii.lg, border: 'none',
                background: hasBlockingErrors ? theme.colors.borderMedium : theme.colors.textPrimary,
                color: hasBlockingErrors ? theme.colors.textDisabled : theme.colors.primary,
                fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
                cursor: hasBlockingErrors ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}>
                Apply Changes
              </button>
              <button onClick={onCancel} style={{
                padding: '10px 24px', borderRadius: theme.radii.lg,
                border: '1px solid ' + theme.colors.borderStrong,
                background: theme.colors.surface, color: theme.colors.textTertiary,
                fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.semibold,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SYNCING STEP */}
        {step === 'syncing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12, animation: 'spin 1s linear infinite' }}>&#9881;</div>
            <p style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary }}>
              Syncing data to Supabase...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* DONE STEP */}
        {step === 'done' && syncResult && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#9989;</div>
            <p style={{ fontSize: 16, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 16 }}>
              Sync complete!
            </p>
            <div style={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', textAlign: 'left', marginBottom: 20 }}>
              <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>Blocks upserted:</span>
              <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textSecondary }}>{syncResult.blocksUpserted}</span>
              <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>Blocks removed:</span>
              <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: syncResult.blocksRemoved > 0 ? '#D94070' : theme.colors.textSecondary }}>{syncResult.blocksRemoved}</span>
              <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>Use cases upserted:</span>
              <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textSecondary }}>{syncResult.useCasesUpserted}</span>
              <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>Use cases removed:</span>
              <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: syncResult.useCasesRemoved > 0 ? '#D94070' : theme.colors.textSecondary }}>{syncResult.useCasesRemoved}</span>
            </div>
            <div>
              <button onClick={onComplete} style={{
                padding: '10px 28px', borderRadius: theme.radii.lg, border: 'none',
                background: theme.colors.textPrimary, color: theme.colors.primary,
                fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* ERROR STEP */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>&#10060;</div>
            <p style={{ fontSize: 16, fontWeight: theme.typography.weights.bold, color: '#D94070', marginBottom: 8 }}>
              Something went wrong
            </p>
            <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginBottom: 20 }}>
              {errorMsg}
            </p>
            <button onClick={onCancel} style={{
              padding: '10px 24px', borderRadius: theme.radii.lg,
              border: '1px solid ' + theme.colors.borderStrong,
              background: theme.colors.surface, color: theme.colors.textTertiary,
              fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.semibold,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ value, label, color }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: theme.colors.textMuted }}>{label}</div>
    </div>
  );
}

function MessageBox({ type, title, items }) {
  const isError = type === 'error';
  const bg = isError ? '#D9407010' : '#FBB74010';
  const border = isError ? '#D9407030' : '#FBB74030';
  const titleColor = isError ? '#D94070' : '#F47B20';

  return (
    <div style={{
      background: bg, border: '1px solid ' + border, borderRadius: theme.radii.lg,
      padding: 12, marginBottom: 10,
    }}>
      <div style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: titleColor, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ maxHeight: 120, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={i} style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textTertiary, padding: '2px 0' }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
