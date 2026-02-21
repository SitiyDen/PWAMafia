import './BottomNav.css';

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'game', label: 'Игра' },
    { id: 'events', label: 'События' },
    { id: 'settings', label: 'Настройки' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item ${activeTab === tab.id ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
