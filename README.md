# Interscore
An overlay for OBS Studio that displays scores and other info about streamed sports games.

## About
The OBS overlay is a single HTML file launched via the Browser source.
The DOM contents are controlled via the WebSocket protocol using a CLI server program, meant for admins.
Another client uses Qt6 and is meant for the referees and the public display in the hall. The can change the HTML contents by using the server as the middleman.

Tournament metadata (competing teams, timer lengths, game plan) is fed using a JSON file.

The overlay supports multiple "widgets" showing goals and the timer, teams participating in the tournament, currently playing teams and even red and yellow cards.

This project was made for our personal use in a Cycleball tournament under hilarious deadlines.

## Usage
1. `git clone --recursive https://github.com/hiimsergey/interscore && cd interscore`
2. Ensure your OBS edition supports Browser Source.
3. Compile the frontend script and the binaries with `make js b-install r-install`.
4. Fill out `input.json` given the template at `input.template.json`.
5. Open `frontnend/index.html` in OBS Studio and set appropriate dimensions.
6. Launch the `interscore` binary.
7. Give the `interscore-rentnerend` binary to your nearest referee.
8. Reload the HTML page so that you see `Client upgraded to WebSocket connection!` in the backend terminal.
9. Press `?` (followed by Enter/Return) in the backend terminal to see possible actions.

## Demonstrations
- https://www.youtube.com/watch?v=3LFNC_H9lVw (a little unstable but brings the idea across)

# TODO

## Neon Lila Mercedes Liste
### Bis Samstag
- Website
- Werbewidget

### Sergey
- Logo

### Bis Deployment
- OBS integration, OBS deamon (obs alternative?)
- Windows Support
- ability to reconnect rentnerend, if backend stops/rentnerend was started first

### Nice to Have
- Ability to mark teams as not attending
- GUI for the JSON
- auto color_dark

## TODO new
- FINAL release binaries in GitHub Releases
- FINAL REMOVE input.json and project.seer and assets
- FINAL screenshots of backend options and rentnerend windows

### frontend
- team logos for gamestart
- Widget spawn animation fixen(manchmal kaputt)
- FINAL animate line by line
- FINAL comment all relevant CSS
- FINAL handle dealing multiple cards
- FINAL Ads

### rentnerend
- Livereload, dass man backend neustarten kann
- FINAL Feedback/Suggestions Site + Widget
- FINAL Halbzeituhr
- FINAL Add possibility of teams missing
- FINAL Add referees
- FINAL Ads in public window
- FINAL FINAL JSON-Creator GUI for non-technical users
- FINAL FINAL port to windows/mac
- FINAL³ Idee: Ansagen durch KI bei der Hälfte

### backend
- Beim Spielzurücksetzen spielt die Zeit verrückt
- obs integration
- FINAL abstract program so it's applicable for other games
- FINAL make json_load resilient to bad input.json
- FINAL FINAL graceful Ctrl-C handling

### meta
- How does the tiebreak work?
