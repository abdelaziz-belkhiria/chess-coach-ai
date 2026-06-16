import requests
import logging

logger = logging.getLogger(__name__)

USER_AGENT = "ChessCoachApp/1.0 (personal project; github.com/abdelaziz-belkhiria/chess-coach-ai)"

def get_archives(username: str):
    """Fetch the list of monthly archives for a given player."""
    url = f"https://api.chess.com/pub/player/{username}/games/archives"
    headers = {"User-Agent": USER_AGENT}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json().get("archives", [])
    except requests.RequestException as e:
        logger.error(f"Error fetching archives for {username}: {e}")
        return []

def get_latest_archive_url(username: str):
    """Helper to get the URL of the most recent monthly archive."""
    archives = get_archives(username)
    if not archives:
        return None
    return archives[-1]

def get_games_from_archive(archive_url: str):
    """Fetch games from a specific monthly archive URL."""
    headers = {"User-Agent": USER_AGENT}
    try:
        response = requests.get(archive_url, headers=headers)
        response.raise_for_status()
        return response.json().get("games", [])
    except requests.RequestException as e:
        logger.error(f"Error fetching games from archive {archive_url}: {e}")
        return []

def get_latest_games(username: str):
    """Convenience method to get games from the latest month."""
    latest_url = get_latest_archive_url(username)
    if not latest_url:
        return []
    return get_games_from_archive(latest_url)
