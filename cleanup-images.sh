#!/bin/bash

# Create backup directory if it doesn't exist
mkdir -p /Users/mitch/Desktop/mmwcontracting.org/unused_images

# Define the list of images that are actually used in the codebase
USED_IMAGES=(
  # Main UI images
  "logo_local.jpeg"
  "mycomputer.png"
  "services.png"
  "phone.png"
  "hourglass.png"
  "help.png"
  "shutdown.png"
  "win-logo.png"

  # Service icons
  "pipe2.png"
  "faucet.png"
  "heater.png"
  "pipe3.png"
  "w98_hardware.png"
  "w98_gps.png"
  "w98_msg_warning.png"
  "warning.png"
  
  # Video
  "Spongebob - Where's The Leak Ma'am.mp4"
  
  # w2k icons
  "w2k_old_dustbin.png"
  "w2k_search.png"
  
  # Windows XP Icons
  "wxp_154.png"
  "wxp_167.png"
  "wxp_180.png"
  "wxp_186.png"
  "wxp_220.png"
  "wxp_237.png"
  "wxp_244.png"
  "wxp_267.png"
  "wxp_299.png"
  "wxp_317.png"
)

# Move unused images from /img directory
echo "Moving unused images from /img directory..."
find /Users/mitch/Desktop/mmwcontracting.org/img -type f | while read file; do
  filename=$(basename "$file")
  if [[ ! " ${USED_IMAGES[@]} " =~ " ${filename} " ]]; then
    echo "Moving $filename to unused_images/"
    mv "$file" /Users/mitch/Desktop/mmwcontracting.org/unused_images/
  else
    echo "Keeping $filename (used in the UI)"
  fi
done

# Move unused images from /public directory
echo "Moving unused images from /public directory..."
find /Users/mitch/Desktop/mmwcontracting.org/public -type f | while read file; do
  filename=$(basename "$file")
  if [[ ! " ${USED_IMAGES[@]} " =~ " ${filename} " ]]; then
    echo "Moving $filename to unused_images/"
    mv "$file" /Users/mitch/Desktop/mmwcontracting.org/unused_images/
  else
    echo "Keeping $filename (used in the UI)"
  fi
done

echo "Cleanup complete! Unused images have been moved to /unused_images/"
echo "If you want to restore them, you can move them back from that directory."