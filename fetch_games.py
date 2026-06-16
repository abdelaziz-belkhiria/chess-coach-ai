import requests

USERNAME = "sudokubectl"

def get_archives(username):
    url = f"https://api.chess.com/pub/player/{username}/games/archives"
    headers = {"User-Agent": "ChessCoachApp/1.0 (personal project)"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()["archives"]

def get_games_from_archive(archive_url):
    headers = {"User-Agent": "ChessCoachApp/1.0 (personal project)"}
    response = requests.get(archive_url, headers=headers)
    response.raise_for_status()
    return response.json()["games"]

if __name__ == "__main__":
    archives = get_archives(USERNAME)
    print(f"Found {len(archives)} months of games")

    # Get most recent month
    latest_archive = archives[-1]
    games = get_games_from_archive(latest_archive)
    print(f"Found {len(games)} games in the latest month")

    # Print first game as sample
    if games:
        print(games[0])