// This script ensures the Recharts library components are globally accessible
// for the revenue calculator component.

(function() {
  console.log('Initializing Recharts components...');
  
  // Check if Recharts is available
  if (typeof Recharts === 'undefined') {
    console.error('Recharts library not loaded. Charts will not display correctly.');
    return;
  }
  
  // Extract all Recharts components and make them globally available
  const componentsToExpose = [
    'ResponsiveContainer', 'BarChart', 'CartesianGrid', 'XAxis', 'YAxis', 
    'Tooltip', 'Legend', 'Bar', 'Line', 'Cell', 'PieChart', 'Pie',
    'Area', 'AreaChart', 'LineChart', 'ComposedChart', 'ScatterChart',
    'Scatter', 'RadarChart', 'Radar', 'RadialBarChart', 'RadialBar'
  ];
  
  componentsToExpose.forEach(component => {
    if (Recharts[component]) {
      window[component] = Recharts[component];
      console.log(`Exposed Recharts.${component}`);
    } else {
      console.warn(`Could not find Recharts.${component}`);
    }
  });
  
  // Save original createElement to patch React element creation for Recharts components
  if (typeof React !== 'undefined' && React.createElement) {
    const originalCreateElement = React.createElement;
    
    // Patch React.createElement to handle Recharts components
    React.createElement = function(type, props, ...children) {
      // Check if the type is a string that matches one of our global Recharts components
      if (typeof type === 'string' && window[type] && componentsToExpose.includes(type)) {
        // Use the global component instead
        return originalCreateElement(window[type], props, ...children);
      }
      
      // Fall back to original behavior
      return originalCreateElement(type, props, ...children);
    };
    
    console.log('Patched React.createElement for Recharts components');
  }
  
  console.log('Recharts components initialized globally');
})(); 