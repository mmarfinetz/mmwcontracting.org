from yt_dlp import YoutubeDL
import os

def download_video(url, output_path='./'):
    """
    Download a YouTube video using yt-dlp
    
    Parameters:
    - url (str): The URL of the YouTube video.
    - output_path (str): The directory path where the video will be saved.
    """
    if not os.path.exists(output_path):
        os.makedirs(output_path)
        print(f"Created directory: {output_path}")
    
    ydl_opts = {
        'format': 'best',  # Download best quality
        'outtmpl': f'{output_path}/%(title)s.%(ext)s',  # Output template
        'progress_hooks': [lambda d: print(f"Downloading: {d['_percent_str']} of {d['_total_bytes_str']}") if d['status'] == 'downloading' else None],
    }
    
    try:
        print("Fetching video information...")
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            print(f"Video Title: {info.get('title', 'Unknown')}")
            print(f"Quality: {info.get('format', 'Unknown')}")
            print("\nStarting download...")
            ydl.download([url])
        print(f"\nDownload completed! Video saved to: {os.path.abspath(output_path)}")
        return True
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

def main():
    """
    Main function to run the YouTube video downloader.
    """
    print("Welcome to the YouTube Video Downloader!")
    
    # Use the specific YouTube video URL
    video_url = "https://www.youtube.com/watch?v=X4EWMFpXQYA"
    
    # Prompt for an optional download path. If none is provided, use the current directory.
    download_path = input("Enter the download path (default: './'): ").strip() or './'
    
    # Call the download_video function with the provided URL and path.
    download_video(video_url, download_path)

if __name__ == '__main__':
    main()
