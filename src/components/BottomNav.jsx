import './BottomNav.css';
import gameIcon from '../assets/game.svg';
import eventsIcon from '../assets/events.svg';
import settingsIcon from '../assets/settings.svg';

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { 
      id: 'game', 
      label: 'Игра',
      icon: gameIcon
    },
    { 
      id: 'events', 
      label: 'События',
      icon: eventsIcon
    },
    { 
      id: 'settings', 
      label: 'Настройки',
      icon: settingsIcon
    },
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
          <img src={tab.icon} alt={tab.label} className="bottom-nav__icon-img" />
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
