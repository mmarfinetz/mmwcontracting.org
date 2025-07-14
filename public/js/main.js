// Main JavaScript for MMW Contracting site
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const startButton = document.querySelector('.start-button');
  const startMenu = document.querySelector('.start-menu');
  const windows = document.querySelectorAll('.window');
  const taskbar = document.querySelector('.taskbar');
  const taskbarEntries = document.querySelector('.taskbar-entries');
  const closeButtons = document.querySelectorAll('.title-bar-button.close-button');
  const minimizeButtons = document.querySelectorAll('.title-bar-button.minimize-button');
  const timeDisplay = document.querySelector('.taskbar-time');
  const testimonialWindows = document.querySelectorAll('.testimonial');
  const testimonialNextBtn = document.getElementById('testimonial-next');
  const testimonialPrevBtn = document.getElementById('testimonial-prev');
  const ctaButton = document.getElementById('cta-button');
  
  // State
  let activeWindow = null;
  let draggedWindow = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let currentTestimonialIndex = 0;
  let isStartMenuOpen = false;
  // Store original window positions and sizes for restore after maximize
  let windowStates = {};
  
  // Utility Functions
  function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
    timeDisplay.textContent = `${hour12}:${minutesFormatted} ${isPM ? 'PM' : 'AM'}`;
  }
  
  function makeWindowActive(window) {
    if (activeWindow) {
      activeWindow.classList.remove('active-window');
    }
    window.classList.add('active-window');
    window.style.zIndex = '10';
    activeWindow = window;
    
    // Update taskbar
    const taskbarEntries = document.querySelectorAll('.taskbar-program');
    taskbarEntries.forEach(entry => {
      if (entry.dataset.windowId === window.id) {
        entry.classList.add('active');
      } else {
        entry.classList.remove('active');
      }
    });
  }
  
  // Save the current window state (for restore after maximize)
  function saveWindowState(window) {
    if (!windowStates[window.id]) {
      windowStates[window.id] = {
        width: window.style.width,
        height: window.style.height,
        left: window.style.left,
        top: window.style.top
      };
    }
  }
  
  // Maximize a window to fill the screen (except for taskbar)
  function maximizeWindow(window) {
    // Save current state for later restore
    saveWindowState(window);
    
    // Remove any existing maximized window
    document.querySelectorAll('.window.maximized').forEach(win => {
      if (win !== window) {
        restoreWindow(win);
      }
    });
    
    // Apply maximized styles
    window.classList.add('maximized');
    window.style.width = '100%';
    window.style.height = 'calc(100vh - 30px)'; // Leave space for taskbar
    window.style.left = '0';
    window.style.top = '0';
    
    // Update button appearance
    const maximizeButton = window.querySelector('.maximize-button');
    if (maximizeButton) {
      maximizeButton.innerHTML = '❐'; // Different symbol for restore
      maximizeButton.title = 'Restore';
    }
  }
  
  // Restore a window to its original size
  function restoreWindow(window) {
    // Only proceed if we have saved state
    if (windowStates[window.id]) {
      window.classList.remove('maximized');
      window.style.width = windowStates[window.id].width;
      window.style.height = windowStates[window.id].height;
      window.style.left = windowStates[window.id].left;
      window.style.top = windowStates[window.id].top;
      
      // Reset the maximize button
      const maximizeButton = window.querySelector('.maximize-button');
      if (maximizeButton) {
        maximizeButton.innerHTML = '□';
        maximizeButton.title = 'Maximize';
      }
    }
  }
  
  // Minimize a window to the taskbar
  function minimizeWindow(window) {
    window.classList.add('minimized');
    
    // Highlight the taskbar entry
    const taskbarEntry = document.querySelector(`.taskbar-program[data-window-id="${window.id}"]`);
    if (taskbarEntry) {
      taskbarEntry.classList.add('minimized');
    }
  }
  
  function createTaskbarEntry(window) {
    const windowTitle = window.querySelector('.title-bar-text').textContent;
    const iconSrc = window.dataset.icon || 'img/wxp_186.png';
    
    const taskbarEntry = document.createElement('div');
    taskbarEntry.className = 'taskbar-program';
    taskbarEntry.dataset.windowId = window.id;
    taskbarEntry.innerHTML = `
      <img src="${iconSrc}" alt="Window" style="width: 16px; height: 16px; margin-right: 5px;">
      <span>${windowTitle}</span>
    `;
    
    taskbarEntry.addEventListener('click', () => {
      if (window.classList.contains('minimized')) {
        // Restore minimized window
        window.classList.remove('minimized');
        taskbarEntry.classList.remove('minimized');
        makeWindowActive(window);
      } else if (window === activeWindow) {
        // Minimize active window
        minimizeWindow(window);
      } else {
        // Activate window
        makeWindowActive(window);
      }
    });
    
    document.querySelector('.taskbar-entries').appendChild(taskbarEntry);
  }
  
  // Initialize UI
  function initUI() {
    // Set initial time
    updateTime();
    setInterval(updateTime, 60000); // Update time every minute
    
    // Hide all windows initially except emergency
    windows.forEach(window => {
      if (window.id !== 'emergency-window') {
        window.style.display = 'none';
      }
      
      // Add double-click handler to each window's title bar
      const titleBar = window.querySelector('.title-bar');
      if (titleBar) {
        titleBar.addEventListener('dblclick', handleTitleBarDoubleClick);
      }
      
      // Add maximize button handler
      const maximizeBtn = window.querySelector('.maximize-button');
      if (maximizeBtn) {
        maximizeBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          const win = event.target.closest('.window');
          
          if (win.classList.contains('maximized')) {
            restoreWindow(win);
          } else {
            maximizeWindow(win);
          }
          
          makeWindowActive(win);
        });
      }
    });
    
    // Show emergency window with delay
    setTimeout(() => {
      const emergencyWindow = document.getElementById('emergency-window');
      if (emergencyWindow) {
        emergencyWindow.style.display = 'block';
        makeWindowActive(emergencyWindow);
        createTaskbarEntry(emergencyWindow);
      }
    }, 1000);
    
    // Set up testimonials
    if (testimonialWindows.length > 0) {
      showTestimonial(0);
    }
    
    // Check for direct Google Reviews link (new approach)
    const googleReviewsDirectLink = document.querySelector('.google-reviews-direct-link');
    
    // Handle testimonials display
    const staticElement = document.querySelector('.testimonial-static');
    if (staticElement) {
      // Always hide static testimonials initially
      staticElement.style.display = 'none';
      
      // If there's a Google Reviews direct link section, show it
      if (googleReviewsDirectLink) {
        googleReviewsDirectLink.style.display = 'block';
      } else {
        // Otherwise, fall back to static testimonials
        staticElement.style.display = 'block';
      }
    }
  }
  
  // Event Handlers
  function handleIconClick(event) {
    const icon = event.currentTarget;
    const targetId = icon.id;
    
    if (targetId === 'my-computer') {
      openWindow('about-window');
    } else if (targetId === 'services') {
      openWindow('services-window');
    } else if (targetId === 'contact') {
      window.location.href = '/contact';
    } else if (targetId === 'testimonials') {
      openWindow('testimonials-window');
    } else if (targetId === 'emergency') {
      openWindow('emergency-window');
    }
  }
  
  function openWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    window.style.display = 'block';
    
    // Check if taskbar entry already exists
    const existingEntry = document.querySelector(`.taskbar-program[data-window-id="${windowId}"]`);
    if (!existingEntry) {
      createTaskbarEntry(window);
    }
    
    makeWindowActive(window);
    
    // If it's the testimonials window, initialize Google reviews
    if (windowId === 'testimonials-window' && typeof loadGoogleReviews === 'function') {
      loadGoogleReviews();
    }
    
    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('windowOpened', { 
      detail: { windowId: windowId } 
    }));
  }
  
  function handleWindowDragStart(event) {
    if (event.target.classList.contains('title-bar')) {
      const window = event.target.closest('.window');
      makeWindowActive(window);
      draggedWindow = window;
      
      const rect = draggedWindow.getBoundingClientRect();
      dragOffsetX = event.clientX - rect.left;
      dragOffsetY = event.clientY - rect.top;
      
      event.preventDefault();
    }
  }
  
  // Handle double-click on title bar to maximize/restore
  function handleTitleBarDoubleClick(event) {
    if (event.target.classList.contains('title-bar') || 
        event.target.classList.contains('title-bar-text')) {
      event.stopPropagation();
      const window = event.target.closest('.window');
      
      if (window.classList.contains('maximized')) {
        restoreWindow(window);
      } else {
        maximizeWindow(window);
      }
    }
  }
  
  function handleWindowDrag(event) {
    if (draggedWindow) {
      // Auto-restore if dragging a maximized window
      if (draggedWindow.classList.contains('maximized')) {
        // First restore the window
        restoreWindow(draggedWindow);
        
        // Then recalculate drag offsets for smooth transition
        const rect = draggedWindow.getBoundingClientRect();
        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;
      }
      
      // Now move the window (only if not maximized)
      if (!draggedWindow.classList.contains('maximized')) {
        const newX = Math.max(0, event.clientX - dragOffsetX);
        const newY = Math.max(0, event.clientY - dragOffsetY);
        
        // Prevent the window from being dragged too far right or bottom
        const maxX = window.innerWidth - draggedWindow.offsetWidth;
        const maxY = window.innerHeight - draggedWindow.offsetHeight;
        
        draggedWindow.style.left = Math.min(newX, maxX) + 'px';
        draggedWindow.style.top = Math.min(newY, maxY) + 'px';
      }
    }
  }
  
  function handleWindowDragEnd() {
    draggedWindow = null;
  }
  
  function showTestimonial(index) {
    testimonialWindows.forEach((testimonial, i) => {
      testimonial.style.display = i === index ? 'block' : 'none';
    });
    currentTestimonialIndex = index;
  }
  
  function handleNextTestimonial() {
    let newIndex = currentTestimonialIndex + 1;
    if (newIndex >= testimonialWindows.length) {
      newIndex = 0;
    }
    showTestimonial(newIndex);
  }
  
  function handlePrevTestimonial() {
    let newIndex = currentTestimonialIndex - 1;
    if (newIndex < 0) {
      newIndex = testimonialWindows.length - 1;
    }
    showTestimonial(newIndex);
  }
  
  function toggleStartMenu() {
    isStartMenuOpen = !isStartMenuOpen;
    startMenu.style.display = isStartMenuOpen ? 'block' : 'none';
    
    // Close start menu when clicking elsewhere
    if (isStartMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', closeStartMenu);
      }, 100);
    }
  }
  
  function closeStartMenu(event) {
    if (!startMenu.contains(event.target) && event.target !== startButton) {
      startMenu.style.display = 'none';
      isStartMenuOpen = false;
      document.removeEventListener('click', closeStartMenu);
    }
  }
  
  // Event Listeners - Using event delegation where possible
  desktopIcons.forEach(icon => {
    icon.addEventListener('click', handleIconClick);
  });
  
  startButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleStartMenu();
  });
  
  document.addEventListener('mousedown', handleWindowDragStart);
  document.addEventListener('mousemove', handleWindowDrag);
  document.addEventListener('mouseup', handleWindowDragEnd);
  
  // Add double-click handlers for title bars
  document.querySelectorAll('.title-bar').forEach(titleBar => {
    titleBar.addEventListener('dblclick', handleTitleBarDoubleClick);
  });
  
  closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const window = event.target.closest('.window');
      window.style.display = 'none';
      
      // Remove from taskbar
      const taskbarEntry = document.querySelector(`.taskbar-program[data-window-id="${window.id}"]`);
      if (taskbarEntry) {
        taskbarEntry.remove();
      }
      
      if (activeWindow === window) {
        activeWindow = null;
      }
    });
  });
  
  minimizeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent window drag
      const window = button.closest('.window');
      minimizeWindow(window);
    });
  });
  
  // Add event handlers for maximize buttons
  const maximizeButtons = document.querySelectorAll('.title-bar-button.maximize-button');
  maximizeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent window drag
      const window = button.closest('.window');
      
      if (window.classList.contains('maximized')) {
        // If already maximized, restore it
        restoreWindow(window);
      } else {
        // Otherwise, maximize it
        maximizeWindow(window);
      }
      
      // Ensure window is active
      makeWindowActive(window);
    });
  });
  
  if (testimonialNextBtn) {
    testimonialNextBtn.addEventListener('click', handleNextTestimonial);
  }
  
  if (testimonialPrevBtn) {
    testimonialPrevBtn.addEventListener('click', handlePrevTestimonial);
  }
  
  // CTA Button Click Handler
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      window.location.href = '/contact';
    });
  }
  
  // Start menu items click handlers
  const startEmergency = document.getElementById('start-emergency');
  if (startEmergency) {
    startEmergency.addEventListener('click', () => {
      openWindow('emergency-window');
      startMenu.style.display = 'none';
      isStartMenuOpen = false;
    });
  }
  
  const startServices = document.getElementById('start-services');
  if (startServices) {
    startServices.addEventListener('click', () => {
      openWindow('services-window');
      startMenu.style.display = 'none';
      isStartMenuOpen = false;
    });
  }
  
  const startTestimonials = document.getElementById('start-testimonials');
  if (startTestimonials) {
    startTestimonials.addEventListener('click', () => {
      openWindow('testimonials-window');
      startMenu.style.display = 'none';
      isStartMenuOpen = false;
    });
  }
  
  const startContact = document.getElementById('start-contact');
  if (startContact) {
    startContact.addEventListener('click', () => {
      window.location.href = '/contact';
    });
  }
  
  const startHelp = document.getElementById('start-help');
  if (startHelp) {
    startHelp.addEventListener('click', () => {
      openWindow('help-window');
      startMenu.style.display = 'none';
      isStartMenuOpen = false;
    });
  }
  
  // Mobile-specific optimizations
  function initMobileOptimizations() {
    const isMobile = window.innerWidth <= 768;
    
    // Mobile navigation elements
    const mobileNavToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');
    
    if (isMobile) {
      // Show mobile nav
      document.querySelector('.mobile-nav').style.display = 'flex';
      
      // Handle mobile menu toggle
      if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function() {
          this.classList.toggle('active');
          mobileMenu.classList.toggle('active');
        });
      }
      
      // Handle mobile menu item clicks
      mobileMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
          // Only prevent default for internal windows, not for external links
          if (this.getAttribute('data-window')) {
            e.preventDefault();
            
            // Get the window ID from data attribute
            const windowId = this.getAttribute('data-window');
            if (windowId) {
              // Hide all windows first
              windows.forEach(window => {
                window.style.display = 'none';
                window.classList.remove('active-window');
              });
              
              // Show the selected window
              const targetWindow = document.getElementById(windowId);
              if (targetWindow) {
                targetWindow.style.display = 'block';
                makeWindowActive(targetWindow);
                
                // Close the mobile menu
                mobileMenu.classList.remove('active');
                if (mobileNavToggle) {
                  mobileNavToggle.classList.remove('active');
                }
              }
            }
          } else {
            // For external links (like the Google Form), just close the menu
            mobileMenu.classList.remove('active');
            if (mobileNavToggle) {
              mobileNavToggle.classList.remove('active');
            }
          }
        });
      });
      
      // On mobile, show only one window at a time
      windows.forEach(window => {
        // Hide all windows initially except emergency
        if (window.id !== 'emergency-window') {
          window.style.display = 'none';
        } else {
          window.style.display = 'block';
          makeWindowActive(window);
        }
        
        // Add touch event for window dragging
        const titleBar = window.querySelector('.title-bar');
        if (titleBar) {
          titleBar.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const windowRect = window.getBoundingClientRect();
            draggedWindow = window;
            dragOffsetX = touch.clientX - windowRect.left;
            dragOffsetY = touch.clientY - windowRect.top;
            window.classList.add('dragging');
          });
          
          titleBar.addEventListener('touchmove', (e) => {
            if (draggedWindow) {
              e.preventDefault();
              const touch = e.touches[0];
              const newX = Math.max(0, Math.min(window.innerWidth - draggedWindow.offsetWidth, touch.clientX - dragOffsetX));
              const newY = Math.max(60, Math.min(window.innerHeight - draggedWindow.offsetHeight, touch.clientY - dragOffsetY));
              draggedWindow.style.left = newX + 'px';
              draggedWindow.style.top = newY + 'px';
            }
          });
          
          titleBar.addEventListener('touchend', () => {
            if (draggedWindow) {
              draggedWindow.classList.remove('dragging');
              draggedWindow = null;
            }
          });
        }
      });
      
      // Improve emergency content layout for mobile
      const emergencyWindow = document.getElementById('emergency-window');
      if (emergencyWindow) {
        const emergencyContent = emergencyWindow.querySelector('.emergency-content');
        if (emergencyContent) {
          emergencyContent.style.flexDirection = 'column';
        }
      }
      
      // Handle clicks outside the mobile menu to close it
      document.addEventListener('click', function(e) {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !mobileNavToggle.contains(e.target)) {
          mobileMenu.classList.remove('active');
          mobileNavToggle.classList.remove('active');
        }
      });
      
      // Adjust CTA button
      const ctaButton = document.getElementById('cta-button');
      if (ctaButton) {
        ctaButton.style.fontSize = window.innerWidth <= 480 ? '14px' : '16px';
      }
    } else {
      // Reset for desktop
      document.querySelector('.mobile-nav').style.display = 'none';
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
      }
    }
  }
  
  // Initialize everything
  initUI();
  initMobileOptimizations();
  
  // Check URL parameters for auto-opening windows
  const urlParams = new URLSearchParams(window.location.search);
  const windowParam = urlParams.get('window');
  if (windowParam) {
    // Map common window names to their IDs
    const windowMappings = {
      'contact': 'contact-window',
      'services': 'services-window',
      'emergency': 'emergency-window',
      'testimonials': 'testimonials-window',
      'about': 'about-window'
    };
    
    const windowId = windowMappings[windowParam] || windowParam;
    
    // Small delay to ensure everything is loaded
    setTimeout(() => {
      openWindow(windowId);
    }, 100);
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    // Update UI based on new screen size
    initMobileOptimizations();
  });
  
  // Add a delegated event listener for any close buttons that might be added dynamically
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('close-button')) {
      const window = event.target.closest('.window');
      if (window) {
        window.style.display = 'none';
        
        // Remove from taskbar
        const taskbarEntry = document.querySelector(`.taskbar-program[data-window-id="${window.id}"]`);
        if (taskbarEntry) {
          taskbarEntry.remove();
        }
        
        if (activeWindow === window) {
          activeWindow = null;
        }
      }
    }
  });
});