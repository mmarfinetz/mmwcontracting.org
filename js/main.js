// Main JavaScript for MMW Contracting site
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const startButton = document.querySelector('.start-button');
  const startMenu = document.getElementById('start-menu');
  const windows = document.querySelectorAll('.window');
  const taskbar = document.querySelector('.taskbar');
  const taskbarPrograms = document.querySelector('.taskbar-programs');
  const closeButtons = document.querySelectorAll('.close-button');
  const minimizeButtons = document.querySelectorAll('.minimize-button');
  const timeDisplay = document.querySelector('.taskbar-time');
  const testimonialWindows = document.querySelectorAll('.testimonial');
  const testimonialNextBtn = document.getElementById('testimonial-next');
  const testimonialPrevBtn = document.getElementById('testimonial-prev');
  
  // State
  let activeWindow = null;
  let draggedWindow = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let currentTestimonialIndex = 0;
  let isStartMenuOpen = false;
  
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
        window.classList.remove('minimized');
        makeWindowActive(window);
      } else if (window === activeWindow) {
        window.classList.add('minimized');
      } else {
        makeWindowActive(window);
      }
    });
    
    taskbarPrograms.appendChild(taskbarEntry);
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
      openWindow('contact-window');
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
  
  function handleWindowDrag(event) {
    if (draggedWindow) {
      const newX = Math.max(0, event.clientX - dragOffsetX);
      const newY = Math.max(0, event.clientY - dragOffsetY);
      
      // Prevent the window from being dragged too far right or bottom
      const maxX = window.innerWidth - draggedWindow.offsetWidth;
      const maxY = window.innerHeight - draggedWindow.offsetHeight;
      
      draggedWindow.style.left = Math.min(newX, maxX) + 'px';
      draggedWindow.style.top = Math.min(newY, maxY) + 'px';
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
    button.addEventListener('click', () => {
      const window = button.closest('.window');
      window.classList.add('minimized');
    });
  });
  
  if (testimonialNextBtn) {
    testimonialNextBtn.addEventListener('click', handleNextTestimonial);
  }
  
  if (testimonialPrevBtn) {
    testimonialPrevBtn.addEventListener('click', handlePrevTestimonial);
  }
  
  // Mobile-specific optimizations
  function initMobileOptimizations() {
    if (window.innerWidth <= 768) {
      // On mobile, show the emergency window in a modal
      const emergencyWindow = document.getElementById('emergency-window');
      if (emergencyWindow) {
        emergencyWindow.classList.add('mobile-modal');
      }
      
      // Add touch event for window dragging
      windows.forEach(window => {
        const titleBar = window.querySelector('.title-bar');
        if (titleBar) {
          titleBar.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const windowRect = window.getBoundingClientRect();
            draggedWindow = window;
            dragOffsetX = touch.clientX - windowRect.left;
            dragOffsetY = touch.clientY - windowRect.top;
          });
          
          titleBar.addEventListener('touchmove', (e) => {
            if (draggedWindow) {
              e.preventDefault();
              const touch = e.touches[0];
              const newX = touch.clientX - dragOffsetX;
              const newY = touch.clientY - dragOffsetY;
              draggedWindow.style.left = newX + 'px';
              draggedWindow.style.top = newY + 'px';
            }
          });
          
          titleBar.addEventListener('touchend', () => {
            draggedWindow = null;
          });
        }
      });
    }
  }
  
  // Initialize everything
  initUI();
  initMobileOptimizations();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    // Update UI based on new screen size
    initMobileOptimizations();
  });
});