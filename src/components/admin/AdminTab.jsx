import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { AdminTable } from './AdminTable';
import { BlockMultiSelect } from './BlockMultiSelect';
import { ExcelUpload } from './ExcelUpload';
import { SectionLabel } from '../shared/SectionLabel';
import {
  upsertCategory, deleteCategory,
  upsertBuildingBlock, deleteBuildingBlock,
  upsertValueChainArea, deleteValueChainArea,
  upsertUseCase, deleteUseCase,
  fetchAssessmentLeads, deleteAssessmentLead,
} from '../../services/dataService';
import { isSupabaseConfigured } from '../../services/supabase';
import { READINESS_DIMENSIONS } from '../../data/constants';
import { theme } from '../../styles/theme';

export function AdminTab({ onSignOut, userEmail }) {
  const { categories, buildingBlocks, useCases, valueChainAreas, valueChainShortLabels, categoryNames, refetch } = useData();
  const [activeSection, setActiveSection] = useState('useCases');
  const [showUpload, setShowUpload] = useState(false);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [expandedLead, setExpandedLead] = useState(null);

  const supabaseReady = isSupabaseConfigured();

  const loadLeads = useCallback(async () => {
    if (!supabaseReady) return;
    setLeadsLoading(true);
    try {
      const data = await fetchAssessmentLeads();
      setLeads(data);
    } catch (e) {
      console.error('Failed to load leads:', e.message);
    } finally {
      setLeadsLoading(false);
    }
  }, [supabaseReady]);

  useEffect(() => {
    if (activeSection === 'leads') loadLeads();
  }, [activeSection, loadLeads]);

  const handleDeleteLead = async (id) => {
    try {
      await deleteAssessmentLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      if (expandedLead === id) setExpandedLead(null);
    } catch (e) {
      console.error('Failed to delete lead:', e.message);
    }
  };

  // Prepare data rows
  const categoryRows = useMemo(() =>
    Object.entries(categories).map(([name, { color, abbr }], i) => ({ name, color, abbr, sort_order: i })),
    [categories]
  );

  const vcaRows = useMemo(() =>
    Object.entries(valueChainShortLabels).map(([name, shortLabel], i) => ({ name, shortLabel, sort_order: i })),
    [valueChainShortLabels]
  );

  const blockRows = useMemo(() =>
    buildingBlocks.map((b, i) => ({ name: b.name, category: b.category, maturity: b.maturity, sort_order: i })),
    [buildingBlocks]
  );

  const ucRows = useMemo(() =>
    useCases.map((uc, i) => ({
      name: uc.name, activityType: uc.activityType, valueChainArea: uc.valueChainArea,
      buildingBlocks: uc.buildingBlocks, sort_order: i,
    })),
    [useCases]
  );

  const allBlockNames = useMemo(() => buildingBlocks.map(b => b.name), [buildingBlocks]);
  const vcaNames = useMemo(() => Object.keys(valueChainShortLabels), [valueChainShortLabels]);

  // CRUD handlers
  const handleSaveCategory = async (data) => {
    await upsertCategory(data);
    await refetch();
  };
  const handleDeleteCategory = async (row) => {
    await deleteCategory(row.name);
    await refetch();
  };

  const handleSaveVCA = async (data) => {
    await upsertValueChainArea(data);
    await refetch();
  };
  const handleDeleteVCA = async (row) => {
    await deleteValueChainArea(row.name);
    await refetch();
  };

  const handleSaveBlock = async (data) => {
    await upsertBuildingBlock(data);
    await refetch();
  };
  const handleDeleteBlock = async (row) => {
    await deleteBuildingBlock(row.name);
    await refetch();
  };

  const handleSaveUC = async (data) => {
    await upsertUseCase(data);
    await refetch();
  };
  const handleDeleteUC = async (row) => {
    await deleteUseCase(row.name);
    await refetch();
  };

  const sections = [
    { id: 'useCases', label: 'Use Cases', count: useCases.length },
    { id: 'blocks', label: 'Building Blocks', count: buildingBlocks.length },
    { id: 'categories', label: 'Categories', count: categoryNames.length },
    { id: 'valueChain', label: 'Value Chain', count: vcaNames.length },
    ...(supabaseReady ? [{ id: 'leads', label: 'Leads', count: leads.length }] : []),
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <SectionLabel>Data Management</SectionLabel>
          <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginTop: 0 }}>
            Signed in as <strong>{userEmail}</strong>
            {!supabaseReady && (
              <span style={{
                marginLeft: 8, padding: '2px 8px', borderRadius: theme.radii.md,
                background: '#FBB74020', color: '#FBB740', fontSize: theme.typography.sizes.base,
                fontWeight: theme.typography.weights.semibold,
              }}>
                Offline Mode — Supabase not configured
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {supabaseReady && (
            <button onClick={() => setShowUpload(true)} style={{
              padding: '8px 16px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.primary,
              background: theme.colors.primary + '15', color: theme.colors.primary,
              fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${theme.transitions.fast}`,
            }}>
              Upload Excel
            </button>
          )}
          <button onClick={onSignOut} style={{
            padding: '8px 16px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderStrong,
            background: theme.colors.surface, color: theme.colors.textTertiary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
            padding: '8px 16px', borderRadius: theme.radii.lg,
            border: activeSection === s.id ? '1px solid ' + theme.colors.primary : '1px solid ' + theme.colors.borderMedium,
            background: activeSection === s.id ? theme.colors.primary + '15' : theme.colors.surface,
            color: activeSection === s.id ? theme.colors.primary : theme.colors.textTertiary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: `all ${theme.transitions.fast}`,
          }}>
            {s.label} ({s.count})
          </button>
        ))}
      </div>

      {activeSection === 'categories' && (
        <AdminTable
          title="Categories"
          columns={[
            { key: 'name', label: 'Name', required: true },
            { key: 'color', label: 'Color', type: 'color', required: true, default: '#888888' },
            { key: 'abbr', label: 'Abbreviation', required: true },
            { key: 'sort_order', label: 'Order', type: 'number', default: 0 },
          ]}
          rows={categoryRows}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {activeSection === 'valueChain' && (
        <AdminTable
          title="Value Chain Areas"
          columns={[
            { key: 'name', label: 'Full Name', required: true },
            { key: 'shortLabel', label: 'Short Label', required: true },
            { key: 'sort_order', label: 'Order', type: 'number', default: 0 },
          ]}
          rows={vcaRows}
          onSave={handleSaveVCA}
          onDelete={handleDeleteVCA}
        />
      )}

      {activeSection === 'blocks' && (
        <AdminTable
          title="Building Blocks"
          columns={[
            { key: 'name', label: 'Name', required: true },
            { key: 'category', label: 'Category', type: 'select', options: categoryNames, required: true },
            { key: 'maturity', label: 'Maturity', type: 'number', required: true, default: 3 },
            { key: 'sort_order', label: 'Order', type: 'number', default: 0 },
          ]}
          rows={blockRows}
          onSave={handleSaveBlock}
          onDelete={handleDeleteBlock}
        />
      )}

      {activeSection === 'useCases' && (
        <AdminTable
          title="Use Cases"
          columns={[
            { key: 'name', label: 'Name', required: true },
            { key: 'activityType', label: 'Activity', type: 'select', options: ['Primary', 'Support'], required: true, default: 'Primary' },
            { key: 'valueChainArea', label: 'Value Chain', type: 'select', options: vcaNames, required: true },
            { key: 'buildingBlocks', label: 'Building Blocks', type: 'custom',
              render: (val) => (
                <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>
                  {Array.isArray(val) ? `${val.length} blocks` : '0 blocks'}
                </span>
              ),
            },
            { key: 'sort_order', label: 'Order', type: 'number', default: 0 },
          ]}
          rows={ucRows}
          onSave={handleSaveUC}
          onDelete={handleDeleteUC}
          renderCustomCell={(col, editData, setEditData) => {
            if (col.key === 'buildingBlocks') {
              return (
                <BlockMultiSelect
                  selected={editData.buildingBlocks || []}
                  options={allBlockNames}
                  onChange={(blocks) => setEditData({ ...editData, buildingBlocks: blocks })}
                />
              );
            }
            return null;
          }}
        />
      )}

      {activeSection === 'leads' && supabaseReady && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <SectionLabel>Assessment Leads ({leads.length})</SectionLabel>
            <button onClick={loadLeads} disabled={leadsLoading} style={{
              padding: '6px 14px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderMedium,
              background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.md,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {leadsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {leads.length === 0 && !leadsLoading && (
            <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textMuted, textAlign: 'center', padding: 40 }}>
              No leads yet. Leads appear here when visitors complete the assessment and submit their contact details.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {leads.map(lead => {
              const isExpanded = expandedLead === lead.id;
              const date = new Date(lead.created_at);
              const dimLabels = {};
              READINESS_DIMENSIONS.forEach(d => { dimLabels[d.id] = d.label; });
              return (
                <div key={lead.id} style={{
                  background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
                  overflow: 'hidden', boxShadow: theme.shadows.card,
                  transition: `box-shadow ${theme.transitions.fast}`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = theme.shadows.cardHover; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = theme.shadows.card; }}
                >
                  <div
                    onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
                      cursor: 'pointer', flexWrap: 'wrap', gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: theme.radii.circle, background: theme.colors.primary + '20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black, color: theme.colors.primary,
                        flexShrink: 0,
                      }}>
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>
                          {lead.name}
                        </div>
                        <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>
                          {lead.email} &middot; {lead.company}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {lead.industry && (
                        <span style={{
                          padding: '2px 8px', borderRadius: theme.radii.md, background: theme.colors.surfaceMuted,
                          fontSize: theme.typography.sizes.base, color: theme.colors.textTertiary, fontWeight: theme.typography.weights.medium,
                        }}>
                          {lead.industry}
                        </span>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>
                          {Number(lead.overall_score).toFixed(1)}
                        </div>
                        <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>score</div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: 70 }}>
                        <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>
                          {date.toLocaleDateString('de-CH')}
                        </div>
                        <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textFaint }}>
                          {date.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted, transition: `transform ${theme.transitions.fast}`, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                        &#9660;
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid ' + theme.colors.borderLight, animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
                        <div>
                          <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textMuted, marginBottom: 4 }}>Contact</div>
                          <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textPrimary }}>{lead.name}</div>
                          <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary }}>{lead.email}</div>
                          <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary }}>{lead.company}</div>
                          {lead.company_size && <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>{lead.company_size} employees</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textMuted, marginBottom: 4 }}>Selected Areas</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(lead.selected_areas || []).map(area => (
                              <span key={area} style={{
                                padding: '2px 8px', borderRadius: theme.radii.md, background: theme.colors.surfaceMuted,
                                fontSize: theme.typography.sizes.base, color: theme.colors.textTertiary,
                              }}>
                                {valueChainShortLabels[area] || area}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textMuted, marginBottom: 4 }}>Adoption Ratings</div>
                          {Object.entries(lead.area_ratings || {}).map(([area, rating]) => (
                            <div key={area} style={{ display: 'flex', justifyContent: 'space-between', fontSize: theme.typography.sizes.base, color: theme.colors.textTertiary, marginBottom: 2 }}>
                              <span>{valueChainShortLabels[area] || area}</span>
                              <span style={{ fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary }}>{rating}/5</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textMuted, marginBottom: 4 }}>Readiness</div>
                          {Object.entries(lead.readiness_ratings || {}).map(([dim, rating]) => (
                            <div key={dim} style={{ display: 'flex', justifyContent: 'space-between', fontSize: theme.typography.sizes.base, color: theme.colors.textTertiary, marginBottom: 2 }}>
                              <span>{dimLabels[dim] || dim}</span>
                              <span style={{ fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary }}>{rating}/5</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }} style={{
                          padding: '4px 12px', borderRadius: theme.radii.md, border: '1px solid #D9407040',
                          background: 'transparent', color: '#D94070', fontSize: theme.typography.sizes.base,
                          fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
                        }}>
                          Delete Lead
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showUpload && (
        <ExcelUpload
          categories={categories}
          buildingBlocks={buildingBlocks}
          useCases={useCases}
          valueChainAreas={valueChainAreas}
          onComplete={async () => { await refetch(); setShowUpload(false); }}
          onCancel={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
