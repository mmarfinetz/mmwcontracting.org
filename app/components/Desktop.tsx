import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface DesktopIconProps {
  id: string;
  src: string;
  alt: string;
  text: string;
  onClick: () => void;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ id, src, alt, text, onClick }) => (
  <a href="#" className="desktop-icon" id={id} onClick={(e) => {
    e.preventDefault();
    onClick();
  }}>
    <Image 
      src={src} 
      alt={alt} 
      width={48} 
      height={48} 
      priority={true}
      loading="eager"
    />
    <span>{text}</span>
  </a>
);

const Desktop = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [activeWindows, setActiveWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    updateTime(); // Initial time
    const intervalId = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(intervalId);
  }, []);

  const handleIconClick = (iconName: string) => {
    if (!activeWindows.includes(iconName)) {
      setActiveWindows([...activeWindows, iconName]);
    }
    setActiveWindow(iconName);
  };

  const closeWindow = (iconName: string) => {
    setActiveWindows(activeWindows.filter(name => name !== iconName));
    if (activeWindow === iconName) {
      setActiveWindow(activeWindows.length > 0 ? activeWindows[0] : null);
    }
  };

  return (
    <>
      <div className="desktop-icons">
        <DesktopIcon
          id="my-computer"
          src="/img/mycomputer.png"
          alt="My Computer"
          text="My Computer"
          onClick={() => handleIconClick("My Computer")}
        />
        <DesktopIcon
          id="services"
          src="/img/services.png"
          alt="Services"
          text="Services"
          onClick={() => handleIconClick("Services")}
        />
        <DesktopIcon
          id="contact"
          src="/img/phone.png"
          alt="Contact Us"
          text="Contact Us"
          onClick={() => handleIconClick("Contact Us")}
        />
        <DesktopIcon
          id="testimonials"
          src="/img/wxp_244.png"
          alt="Reviews"
          text="Customer Reviews"
          onClick={() => handleIconClick("Customer Reviews")}
        />
        <DesktopIcon
          id="emergency"
          src="/img/w98_msg_warning.png"
          alt="Emergency Services"
          text="Emergency Services"
          onClick={() => handleIconClick("Emergency Services")}
        />
      </div>

      <div className="taskbar">
        <div className="start-button">
          <img src="/img/w98_start.png" alt="Start" />
          <span>Start</span>
        </div>
        <div className="taskbar-programs">
          {activeWindows.map(window => (
            <div 
              key={window} 
              className={`taskbar-program ${activeWindow === window ? 'active' : ''}`}
              onClick={() => setActiveWindow(window)}
            >
              <span>{window}</span>
            </div>
          ))}
        </div>
        <div className="taskbar-time">{currentTime}</div>
      </div>

      {/* Window Components would go here */}
    </>
  );
};

export default Desktop;