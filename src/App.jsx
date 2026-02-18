import { useState, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { Footer } from './components/layout/Footer';
import { ExplorerTab } from './components/tabs/ExplorerTab';
import { FinderTab } from './components/tabs/FinderTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { GlobalSearch } from './components/search/GlobalSearch';
import { ComparePanel } from './components/compare/ComparePanel';
import { CompareFloatingButton } from './components/compare/CompareFloatingButton';
import { useSearch } from './hooks/useSearch';
import { useCompare } from './hooks/useCompare';
import { useBreakpoint } from './hooks/useBreakpoint';
import { theme } from './styles/theme';

const TABS = [
  { id: 'explorer', label: 'Framework Explorer' },
  { id: 'finder', label: 'Use Case Finder' },
  { id: 'dashboard', label: 'Maturity Dashboard' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [searchNavigation, setSearchNavigation] = useState(null);
  const search = useSearch();
  const compare = useCompare();
  const { isMobile } = useBreakpoint();

  const handleSearchNavigate = useCallback((nav) => {
    setActiveTab(nav.tab);
    setSearchNavigation({ ...nav.filter, _ts: Date.now() });
  }, []);

  return (
    <div style={{
      fontFamily: theme.typography.fontFamily,
      background: theme.colors.background,
      minHeight: '100vh',
      padding: isMobile ? '16px 16px' : `${theme.spacing.xxxl}px ${theme.spacing.page}px`,
    }}>
      <Header searchSlot={<GlobalSearch search={search} onNavigate={handleSearchNavigate} />} />
      <TabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <main style={{ animation: 'fadeIn 0.25s ease-out' }} key={activeTab}>
        {activeTab === 'explorer' && <ExplorerTab searchNavigation={searchNavigation} compareState={compare} />}
        {activeTab === 'finder' && <FinderTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
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
    </div>
  );
}
