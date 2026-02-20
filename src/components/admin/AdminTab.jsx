import { useState, useMemo } from 'react';
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
} from '../../services/dataService';
import { isSupabaseConfigured } from '../../services/supabase';
import { theme } from '../../styles/theme';

export function AdminTab({ onSignOut, userEmail }) {
  const { categories, buildingBlocks, useCases, valueChainAreas, valueChainShortLabels, categoryNames, refetch } = useData();
  const [activeSection, setActiveSection] = useState('useCases');
  const [showUpload, setShowUpload] = useState(false);

  const supabaseReady = isSupabaseConfigured();

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
