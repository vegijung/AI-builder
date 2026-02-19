import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { Footer } from './components/layout/Footer';
import { AssessmentTab } from './components/tabs/AssessmentTab';
import { ExplorerTab } from './components/tabs/ExplorerTab';
import { FinderTab } from './components/tabs/FinderTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { RoadmapTab } from './components/tabs/RoadmapTab';
import { GlobalSearch } from './components/search/GlobalSearch';
import { ComparePanel } from './components/compare/ComparePanel';
import { CompareFloatingButton } from './components/compare/CompareFloatingButton';
import { WorkshopMode } from './components/workshop/WorkshopMode';
import { useSearch } from './hooks/useSearch';
import { useCompare } from './hooks/useCompare';
import { useAssessment } from './hooks/useAssessment';
import { useRoadmap } from './hooks/useRoadmap';
import { useWorkshop } from './hooks/useWorkshop';
import { useBreakpoint } from './hooks/useBreakpoint';
import { theme } from './styles/theme';

const TABS = [
  { id: 'assessment', label: 'Assessment' },
  { id: 'explorer', label: 'Explorer' },
  { id: 'finder', label: 'Finder' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'roadmap', label: 'Roadmap' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('assessment');
  const [searchNavigation, setSearchNavigation] = useState(null);
  const search = useSearch();
  const compare = useCompare();
  const assessment = useAssessment();
  const roadmap = useRoadmap();
  const workshop = useWorkshop();
  const { isMobile } = useBreakpoint();

  const handleSearchNavigate = useCallback((nav) => {
    setActiveTab(nav.tab);
    setSearchNavigation({ ...nav.filter, _ts: Date.now() });
  }, []);

  const handleStartWorkshop = useCallback(() => {
    workshop.openWorkshop();
  }, [workshop]);

  const tabsWithBadge = TABS.map(tab => {
    if (tab.id === 'roadmap' && roadmap.shortlist.length > 0) {
      return { ...tab, label: `Roadmap (${roadmap.shortlist.length})` };
    }
    return tab;
  });

  return (
    <div style={{
      fontFamily: theme.typography.fontFamily,
      background: theme.colors.background,
      minHeight: '100vh',
      padding: isMobile ? '16px 16px' : `${theme.spacing.xxxl}px ${theme.spacing.page}px`,
    }}>
      <Header
        searchSlot={<GlobalSearch search={search} onNavigate={handleSearchNavigate} />}
        onStartWorkshop={handleStartWorkshop}
      />
      <TabBar tabs={tabsWithBadge} activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ animation: 'fadeIn 0.25s ease-out' }} key={activeTab}>
        {activeTab === 'assessment' && <AssessmentTab assessment={assessment} onAddToRoadmap={roadmap.addToRoadmap} />}
        {activeTab === 'explorer' && <ExplorerTab searchNavigation={searchNavigation} compareState={compare} roadmapState={roadmap} />}
        {activeTab === 'finder' && <FinderTab roadmapState={roadmap} assessmentState={assessment} />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'roadmap' && <RoadmapTab roadmap={roadmap} />}
      </main>
      <Footer />

      {activeTab === 'explorer' && (
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

      {workshop.isActive && (
        <WorkshopMode
          workshop={workshop}
          assessment={assessment}
          roadmap={roadmap}
        />
      )}
    </div>
  );
}
