import { useState, useCallback } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { Footer } from './components/layout/Footer';
import { AssessmentTab } from './components/tabs/AssessmentTab';
import { ExploreTab } from './components/tabs/ExploreTab';
import { RoadmapTab } from './components/tabs/RoadmapTab';
import { GlobalSearch } from './components/search/GlobalSearch';
import { ComparePanel } from './components/compare/ComparePanel';
import { CompareFloatingButton } from './components/compare/CompareFloatingButton';
import { AdminOverlay } from './components/admin/AdminOverlay';
import { useSearch } from './hooks/useSearch';
import { useCompare } from './hooks/useCompare';
import { useAssessment } from './hooks/useAssessment';
import { useRoadmap } from './hooks/useRoadmap';
import { useAuth } from './hooks/useAuth';
import { useBreakpoint } from './hooks/useBreakpoint';
import { theme } from './styles/theme';

const TABS = [
  { id: 'assessment', label: 'Assessment' },
  { id: 'explore', label: 'Explore' },
  { id: 'roadmap', label: 'Roadmap' },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('assessment');
  const [searchNavigation, setSearchNavigation] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const data = useData();
  const search = useSearch(data);
  const compare = useCompare();
  const assessment = useAssessment();
  const roadmap = useRoadmap();
  const auth = useAuth();
  const { isMobile } = useBreakpoint();

  const handleSearchNavigate = useCallback((nav) => {
    setActiveTab(nav.tab);
    setSearchNavigation({ ...nav.filter, _ts: Date.now() });
  }, []);

  const tabsWithBadge = TABS.map(tab => {
    if (tab.id === 'roadmap' && roadmap.shortlist.length > 0) {
      return { ...tab, label: `Roadmap (${roadmap.shortlist.length})` };
    }
    return tab;
  });

  if (data.loading) {
    return (
      <div style={{
        fontFamily: theme.typography.fontFamily,
        background: theme.colors.background,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: theme.colors.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>&#9881;</div>
          <div style={{ fontSize: theme.typography.sizes.xxl }}>Loading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: theme.typography.fontFamily,
      background: theme.colors.background,
      minHeight: '100vh',
      padding: isMobile ? '16px 16px' : `${theme.spacing.xxxl}px ${theme.spacing.page}px`,
    }}>
      <Header
        searchSlot={<GlobalSearch search={search} onNavigate={handleSearchNavigate} />}
        onAdminClick={() => setShowAdmin(true)}
        isAdmin={auth.isAdmin}
      />

      <TabBar tabs={tabsWithBadge} activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ animation: 'fadeIn 0.25s ease-out' }} key={activeTab}>
        {activeTab === 'assessment' && (
          <AssessmentTab assessment={assessment} onAddToRoadmap={roadmap.addToRoadmap} />
        )}
        {activeTab === 'explore' && (
          <ExploreTab
            searchNavigation={searchNavigation}
            compareState={compare}
            roadmapState={roadmap}
            assessmentState={assessment}
          />
        )}
        {activeTab === 'roadmap' && (
          <RoadmapTab roadmap={roadmap} />
        )}
      </main>

      <Footer />

      {activeTab === 'explore' && (
        <CompareFloatingButton
          count={compare.selectedForCompare.length}
          canCompare={compare.canCompare}
          onCompare={() => compare.setIsCompareOpen(true)}
          onClear={compare.clearCompare}
        />
      )}

      {compare.isCompareOpen && compare.canCompare && (
        <ComparePanel
          useCases={compare.selectedForCompare}
          onClose={() => compare.setIsCompareOpen(false)}
        />
      )}

      {showAdmin && (
        <AdminOverlay
          auth={auth}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
