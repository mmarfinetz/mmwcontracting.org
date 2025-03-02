#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import webbrowser
from urllib.parse import urlparse

# Default port
PORT = 8000

# Default directory to serve
DIRECTORY = "."

def serve_directory(directory=DIRECTORY, port=PORT):
    """
    Serve files from the specified directory on the specified port.
    
    Args:
        directory (str): Directory to serve files from
        port (int): Port number to serve on
    """
    # Change to the specified directory
    os.chdir(directory)
    
    # Set up the server
    Handler = http.server.SimpleHTTPRequestHandler
    
    # Create the server
    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"Serving at http://localhost:{port}")
        print(f"Serving files from: {os.path.abspath(directory)}")
        print("Press Ctrl+C to stop the server")
        
        # Open the browser
        webbrowser.open(f"http://localhost:{port}")
        
        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    # Parse command line arguments
    if len(sys.argv) > 1:
        # Check if the first argument is a directory or a port
        if sys.argv[1].isdigit():
            PORT = int(sys.argv[1])
            if len(sys.argv) > 2:
                DIRECTORY = sys.argv[2]
        else:
            DIRECTORY = sys.argv[1]
            if len(sys.argv) > 2 and sys.argv[2].isdigit():
                PORT = int(sys.argv[2])
    
    # Serve the directory
    serve_directory(DIRECTORY, PORT)