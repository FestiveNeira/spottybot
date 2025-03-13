# Name TBD
## Overview
This project includes:
- **Frontend**: Svelte
- **Backend**: Node.js with TypeScript
- **Database**: PostgreSQL (Portable!!!)
- **Desktop App**: Neutralino with an Overlay (GLFW, Ultralight, OpenGL)

## App Planned Functionality

- one database, with one table per user (named user id)
  - each record is
    - timestamp
    - current song uri
    - theme name
    - song name of currently playing song (so i can literally read the data)
    - an integer value (signed)
- each user can optionally have a sync playlist https://jasperrutherford.atlassian.net/browse/SPOT-6 
- one theme playlist which will be updated (shuffle, order, etc)
- options for organizing playlists
  - theme
  - shuffle, order, reverse
  - min and max score (set as well)
  - time interval
- creation
  - supah ez
- deletion
  - dont delete data, just remove theme as option from the user
  - more like hiding, with the option to unhide
- better options than just +1 and -1
- stretch
  - live visuals:
    - juniper has a vision
  - data visualization
    - jasper has a vision
