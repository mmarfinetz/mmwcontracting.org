// CSS Loader - handles asynchronous CSS loading without inline event handlers
document.addEventListener('DOMContentLoaded', function() {
  // Handle preloaded CSS
  const preloadLinks = document.querySelectorAll('link[rel="preload"][data-onload-rel]');
  preloadLinks.forEach(link => {
    link.addEventListener('load', function() {
      this.rel = this.getAttribute('data-onload-rel');
    });
  });
  
  // Handle print media CSS that should become all media
  const printMediaLinks = document.querySelectorAll('link[media="print"][data-onload-media]');
  printMediaLinks.forEach(link => {
    link.addEventListener('load', function() {
      this.media = this.getAttribute('data-onload-media');
    });
  });
});