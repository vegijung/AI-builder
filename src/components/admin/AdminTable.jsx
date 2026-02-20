import { useState } from 'react';
import { theme } from '../../styles/theme';

export function AdminTable({ title, columns, rows, onSave, onDelete, renderCustomCell }) {
  const [editingRow, setEditingRow] = useState(null); // index or 'new'
  const [editData, setEditData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startEdit = (row, index) => {
    setEditingRow(index);
    setEditData({ ...row });
    setError('');
  };

  const startNew = () => {
    const empty = {};
    columns.forEach(c => { empty[c.key] = c.default ?? ''; });
    setEditingRow('new');
    setEditData(empty);
    setError('');
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditData({});
    setError('');
  };

  const handleSave = async () => {
    // Validate required fields
    const missing = columns.filter(c => c.required && !editData[c.key]);
    if (missing.length) {
      setError(`Required: ${missing.map(c => c.label).join(', ')}`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(editData, editingRow === 'new');
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    setSaving(true);
    try {
      await onDelete(row);
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    padding: '4px 8px', borderRadius: theme.radii.md,
    border: '1px solid ' + theme.colors.borderMedium,
    fontSize: theme.typography.sizes.lg, fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>
          {title}
          <span style={{ fontWeight: theme.typography.weights.medium, color: theme.colors.textMuted, fontSize: theme.typography.sizes.lg, marginLeft: 8 }}>
            ({rows.length})
          </span>
        </h3>
        <button onClick={startNew} disabled={editingRow !== null} style={{
          padding: '6px 14px', borderRadius: theme.radii.lg, border: 'none',
          background: editingRow !== null ? theme.colors.surfaceMuted : theme.colors.primary,
          color: editingRow !== null ? theme.colors.textMuted : '#fff',
          fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
          cursor: editingRow !== null ? 'default' : 'pointer', fontFamily: 'inherit',
          transition: `all ${theme.transitions.fast}`,
        }}>
          + Add
        </button>
      </div>

      {error && (
        <div style={{
          padding: '6px 12px', borderRadius: theme.radii.md, marginBottom: 8,
          background: '#D9407015', color: '#D94070', fontSize: theme.typography.sizes.lg,
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
        borderRadius: theme.radii.xl, overflow: 'hidden', boxShadow: theme.shadows.card,
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: theme.typography.sizes.lg }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + theme.colors.borderMedium }}>
                {columns.map(c => (
                  <th key={c.key} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold,
                    fontSize: theme.typography.sizes.base, textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {c.label}
                  </th>
                ))}
                <th style={{ width: 100, padding: '8px 12px' }} />
              </tr>
            </thead>
            <tbody>
              {editingRow === 'new' && (
                <tr style={{ background: theme.colors.primary + '08', borderBottom: '1px solid ' + theme.colors.borderLight }}>
                  {columns.map(c => (
                    <td key={c.key} style={{ padding: '6px 12px' }}>
                      {renderCustomCell && renderCustomCell(c, editData, setEditData) ? (
                        renderCustomCell(c, editData, setEditData)
                      ) : c.type === 'select' ? (
                        <select value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={inputStyle}>
                          <option value="">Select...</option>
                          {(c.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : c.type === 'number' ? (
                        <input type="number" value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: Number(e.target.value) })} style={inputStyle} />
                      ) : c.type === 'color' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="color" value={editData[c.key] || '#888888'} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={{ width: 32, height: 28, border: 'none', cursor: 'pointer' }} />
                          <input type="text" value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={{ ...inputStyle, width: 80 }} />
                        </div>
                      ) : (
                        <input type="text" value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={inputStyle} autoFocus={c === columns[0]} />
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                    <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, background: theme.colors.activityPrimary, color: '#fff', marginRight: 4 }}>Save</button>
                    <button onClick={cancelEdit} style={{ ...btnStyle, background: theme.colors.surfaceMuted, color: theme.colors.textMuted }}>Cancel</button>
                  </td>
                </tr>
              )}
              {rows.map((row, i) => {
                const isEditing = editingRow === i;
                return (
                  <tr key={i} style={{
                    borderBottom: '1px solid ' + theme.colors.borderLight,
                    background: isEditing ? theme.colors.primary + '08' : 'transparent',
                    transition: `background ${theme.transitions.fast}`,
                  }}>
                    {columns.map(c => (
                      <td key={c.key} style={{ padding: '8px 12px', color: theme.colors.textSecondary }}>
                        {isEditing ? (
                          renderCustomCell && renderCustomCell(c, editData, setEditData) ? (
                            renderCustomCell(c, editData, setEditData)
                          ) : c.type === 'select' ? (
                            <select value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={inputStyle}>
                              <option value="">Select...</option>
                              {(c.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : c.type === 'number' ? (
                            <input type="number" value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: Number(e.target.value) })} style={inputStyle} />
                          ) : c.type === 'color' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input type="color" value={editData[c.key] || '#888888'} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={{ width: 32, height: 28, border: 'none', cursor: 'pointer' }} />
                              <input type="text" value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={{ ...inputStyle, width: 80 }} />
                            </div>
                          ) : (
                            <input type="text" value={editData[c.key] || ''} onChange={e => setEditData({ ...editData, [c.key]: e.target.value })} style={inputStyle} />
                          )
                        ) : (
                          c.render ? c.render(row[c.key], row) : (
                            c.type === 'color' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 14, height: 14, borderRadius: 3, background: row[c.key] }} />
                                {row[c.key]}
                              </span>
                            ) : row[c.key]
                          )
                        )}
                      </td>
                    ))}
                    <td style={{ padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      {isEditing ? (
                        <>
                          <button onClick={handleSave} disabled={saving} style={{ ...btnStyle, background: theme.colors.activityPrimary, color: '#fff', marginRight: 4 }}>Save</button>
                          <button onClick={cancelEdit} style={{ ...btnStyle, background: theme.colors.surfaceMuted, color: theme.colors.textMuted }}>Cancel</button>
                        </>
                      ) : confirmDelete === i ? (
                        <>
                          <button onClick={() => handleDelete(row)} disabled={saving} style={{ ...btnStyle, background: '#D94070', color: '#fff', marginRight: 4 }}>Confirm</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ ...btnStyle, background: theme.colors.surfaceMuted, color: theme.colors.textMuted }}>No</button>
                        </>
                      ) : editingRow === null ? (
                        <>
                          <button onClick={() => startEdit(row, i)} style={{ ...btnStyle, background: theme.colors.surfaceMuted, color: theme.colors.textSecondary, marginRight: 4 }}>Edit</button>
                          <button onClick={() => setConfirmDelete(i)} style={{ ...btnStyle, background: 'transparent', color: theme.colors.textMuted }}>&#128465;</button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && editingRow !== 'new' && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ padding: 24, textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.typography.sizes.lg }}>
                    No items yet. Click "+ Add" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '4px 10px', borderRadius: theme.radii.md, border: 'none',
  fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: `all ${theme.transitions.fast}`,
};
