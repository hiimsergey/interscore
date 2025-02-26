// TODO FINAL OPTIMIZE our shame
let socket = new WebSocket("ws://localhost:8081", "interscore");
socket.binaryType = "arraybuffer";
let scoreboard = document.querySelector(".scoreboard");
let scoreboard_t1 = scoreboard.querySelector(".t1");
let scoreboard_t2 = scoreboard.querySelector(".t2");
let scoreboard_score_1 = scoreboard.querySelector(".score-1");
let scoreboard_score_2 = scoreboard.querySelector(".score-2");
let scoreboard_time_bar = scoreboard.querySelector(".time-container .bar");
let scoreboard_time_minutes = scoreboard.querySelector(".time .minutes");
let scoreboard_time_seconds = scoreboard.querySelector(".time .seconds");
let gameplan = document.querySelector(".gameplan");
let gameplan_t1 = gameplan.querySelector(".t1");
let gameplan_t2 = gameplan.querySelector(".t2");
let gameplan_score_1 = gameplan.querySelector(".score-1");
let gameplan_score_2 = gameplan.querySelector(".score-2");
let playing_teams = document.querySelector(".playing-teams");
let card = document.querySelector(".card");
let card_graphic = card.querySelector(".card-graphic");
let card_receiver = card.querySelector(".card-receiver");
let card_message = card.querySelector(".card-message");
let livetable = document.querySelector(".livetable");
let livetable_container = livetable.querySelector(".container");
const BUFFER_LEN = 100;
const GAMES_COUNT_MAX = 64;
const HEX_COLOR_LEN = 8;
const TEAMS_COUNT_MAX = 32;
const TEAMS_NAME_MAX_LEN = 100;
function write_scoreboard(view) {
    console.log("Writing data to scoreboard:\n", view);
    let offset = 1;
    let t1 = "";
    let t2 = "";
    for (let i = 0; i < BUFFER_LEN && view.getUint8(offset) != 0; ++i) {
        t1 += String.fromCharCode(view.getUint8(offset));
        ++offset;
    }
    offset = 1;
    for (let i = 0; i < BUFFER_LEN && view.getUint8(offset) != 0; ++i) {
        t2 += String.fromCharCode(view.getUint8(BUFFER_LEN + offset));
        ++offset;
    }
    scoreboard_t1.innerHTML = t1.toString();
    scoreboard_t2.innerHTML = t2.toString();
    offset = 1 + BUFFER_LEN * 2;
    scoreboard_score_1.innerHTML = view.getUint8(offset).toString();
    ++offset;
    scoreboard_score_2.innerHTML = view.getUint8(offset).toString();
    ++offset;
    const is_halftime = view.getUint8(offset);
    ++offset; // skipping `is_halftime`
    let team1_color_left = "";
    let team1_color_right = "";
    let team2_color_left = "";
    let team2_color_right = "";
    // TODO WIP
    if (is_halftime) {
        for (let i = 0; i < HEX_COLOR_LEN; ++i) {
            // TODO CONSIDER making it threee u8s
            team1_color_left += String.fromCharCode(view.getUint8(offset));
            team1_color_right += String.fromCharCode(view.getUint8(HEX_COLOR_LEN + offset));
            team2_color_left += String.fromCharCode(view.getUint8(2 * HEX_COLOR_LEN + offset));
            team2_color_right += String.fromCharCode(view.getUint8(3 * HEX_COLOR_LEN + offset));
            ++offset;
        }
    }
    else {
        for (let i = 0; i < HEX_COLOR_LEN; ++i) {
            team2_color_left += String.fromCharCode(view.getUint8(offset));
            team2_color_right += String.fromCharCode(view.getUint8(HEX_COLOR_LEN + offset));
            team1_color_left += String.fromCharCode(view.getUint8(2 * HEX_COLOR_LEN + offset));
            team1_color_right += String.fromCharCode(view.getUint8(3 * HEX_COLOR_LEN + offset));
            ++offset;
        }
    }
    scoreboard_t1.style.backgroundColor = team1_color_left.slice(0, 7);
    scoreboard_t2.style.backgroundColor = team2_color_left.slice(0, 7);
    // TODO DEBUG
    console.log(`color team 1: '${scoreboard_t1.style.backgroundColor}'`);
    console.log(`color team 2: '${scoreboard_t2.style.backgroundColor}'`);
}
function write_gameplan(view) {
    let offset = 1;
    const games_n = view.getUint8(offset);
    ++offset;
    for (let game = 0; game < games_n; ++game) {
        let t1 = "";
        let t2 = "";
        for (let name_char = 0; name_char < BUFFER_LEN && view.getUint8(offset) != 0; ++name_char) {
            t1 += String.fromCharCode(view.getUint8(offset));
            t2 += String.fromCharCode(view.getUint8(offset + GAMES_COUNT_MAX * BUFFER_LEN));
            ++offset;
        }
        gameplan_t1.innerHTML = t1.toString();
        gameplan_t2.innerHTML = t2.toString();
        ++offset;
    }
}
function write_card(view) {
    let offset = 1;
    let receiver = "";
    for (let name = 0; name < BUFFER_LEN; ++name) {
        receiver += String.fromCharCode(view.getUint8(offset));
        ++offset;
    }
    card_receiver.innerHTML = receiver.toString();
    const is_red = view.getUint8(offset);
    if (is_red === 1) {
        card_graphic.style.backgroundColor = "#ff0000";
        card_message.innerHTML = "bekommt eine rote Karte";
    }
    else {
        card_graphic.style.backgroundColor = "#ffff00";
        card_message.innerHTML = "bekommt eine gelbe Karte";
    }
}
// TODO FINAL OPTIMIZE
function write_livetable(view) {
    while (livetable_container.children.length > 1)
        livetable_container.removeChild(livetable_container.lastChild);
    let offset = 1;
    const team_n = view.getUint8(offset);
    ++offset;
    let teams = [];
    for (let i = 0; i < team_n; ++i) {
        teams[i] = { name: "" };
        for (let chi = 0; chi < BUFFER_LEN; ++chi) {
            const c = view.getUint8(offset);
            teams[i].name += String.fromCharCode(c);
            ++offset;
            if (c === 0) {
                offset += BUFFER_LEN - chi - 1;
                break;
            }
        }
    }
    offset += (TEAMS_COUNT_MAX - team_n) * TEAMS_NAME_MAX_LEN;
    for (let i = 0; i < team_n; ++i) {
        teams[i].points = view.getUint8(offset);
        ++offset;
    }
    offset += TEAMS_COUNT_MAX - team_n;
    for (let i = 0; i < team_n; ++i) {
        teams[i].played = view.getUint8(offset);
        ++offset;
    }
    offset += TEAMS_COUNT_MAX - team_n;
    for (let i = 0; i < team_n; ++i) {
        teams[i].won = view.getUint8(offset);
        ++offset;
    }
    offset += TEAMS_COUNT_MAX - team_n;
    for (let i = 0; i < team_n; ++i) {
        teams[i].tied = view.getUint8(offset);
        ++offset;
    }
    offset += TEAMS_COUNT_MAX - team_n;
    for (let i = 0; i < team_n; ++i) {
        teams[i].lost = view.getUint8(offset);
        ++offset;
    }
    offset += TEAMS_COUNT_MAX - team_n;
    for (let i = 0; i < team_n; ++i) {
        teams[i].goals = view.getUint16(offset, true);
        if (view.getUint16(offset) === 6)
            console.log("amogus");
        offset += 2;
    }
    offset += (TEAMS_COUNT_MAX - team_n) * 2;
    for (let i = 0; i < team_n; ++i) {
        teams[i].goals_taken = view.getUint16(offset, true);
        offset += 2;
    }
    offset += (TEAMS_COUNT_MAX - team_n) * 2;
    for (let i = 0; i < team_n; ++i) {
        teams[i].color = "";
        for (let hexi = 0; hexi < HEX_COLOR_LEN; ++hexi) {
            teams[i].color += String.fromCharCode(view.getUint8(offset));
            ++offset;
        }
    }
    for (let teami = 0; teami < team_n; ++teami) {
        const line = document.createElement("div");
        line.classList.add("line");
        const name = document.createElement("div");
        name.innerHTML = teams[teami].name.toString();
        name.classList.add("name");
        name.style.backgroundColor = teams[teami].color.toString().slice(0, 7);
        console.log(`TODO color for livetable: ${teams[teami].color.toString()}`);
        line.appendChild(name);
        const points = document.createElement("div");
        points.innerHTML = teams[teami].points.toString();
        line.appendChild(points);
        const played = document.createElement("div");
        played.innerHTML = teams[teami].played.toString();
        line.appendChild(played);
        const won = document.createElement("div");
        won.innerHTML = teams[teami].won.toString();
        line.appendChild(won);
        const tied = document.createElement("div");
        tied.innerHTML = teams[teami].tied.toString();
        line.appendChild(tied);
        const lost = document.createElement("div");
        lost.innerHTML = teams[teami].lost.toString();
        line.appendChild(lost);
        const goals = document.createElement("div");
        goals.innerHTML = `${teams[teami].goals.toString()}:${teams[teami].goals_taken.toString()}`;
        line.appendChild(goals);
        const diff = document.createElement("div");
        diff.innerHTML = (teams[teami].goals - teams[teami].goals).toString();
        line.appendChild(diff);
        livetable_container.appendChild(line);
    }
}
function scoreboard_set_timer(view) {
    let offset = 1;
    const time_in_s = view.getUint16(offset);
    scoreboard_time_minutes.innerHTML = Math.floor(time_in_s / 60).toString().padStart(2, "0");
    scoreboard_time_seconds.innerHTML = (time_in_s % 60).toString().padStart(2, "0");
    start_timer(time_in_s);
}
// TODO FINAL MOVE TOP
let countdown;
let duration = 0;
let remaining_time = 0;
function start_timer(time_in_s) {
    if (duration === 0)
        duration = time_in_s;
    if (time_in_s === 0) {
        scoreboard_time_bar.style.width = "100%";
        duration = 0;
        return;
    }
    clearInterval(countdown);
    remaining_time = time_in_s;
    update_display();
    countdown = setInterval(() => {
        if (remaining_time > 0) {
            --remaining_time;
            const bar_width = Math.max(0, (remaining_time / duration) * 100);
            scoreboard_time_bar.style.width = bar_width + "%";
            update_display();
        }
        else
            clearInterval(countdown);
    }, 1000);
}
let timer_is_paused = false;
function scoreboard_pause_timer() {
    clearInterval(countdown);
    timer_is_paused = true;
}
function update_display() {
    const minutes = Math.floor(remaining_time / 60).toString().padStart(2, "0");
    const seconds = (remaining_time % 60).toString().padStart(2, "0");
    scoreboard_time_minutes.innerHTML = minutes;
    scoreboard_time_seconds.innerHTML = seconds;
}
socket.onopen = () => {
    console.log("Connected to WebSocket server!");
};
socket.onmessage = (event) => {
    // TODO
    if (!(event.data instanceof ArrayBuffer))
        console.error("Sent data is not in proper binary format!");
    let buffer = event.data;
    let view = new DataView(buffer);
    const mode = view.getUint8(0);
    switch (mode) {
        case 0:
            return;
        case 1:
            scoreboard.style.display = "none";
            break;
        case 2:
            scoreboard.style.display = "inline-flex";
            write_scoreboard(view);
            break;
        case 3:
            livetable.style.display = "none";
            break;
        case 4:
            // TODO WIP
            livetable.style.display = "inline-flex";
            write_livetable(view);
            break;
        case 5:
            gameplan.style.display = "none";
            break;
        case 6:
            gameplan.style.display = "inline-flex";
            write_gameplan(view);
            break;
        case 7:
            playing_teams.style.display = "none";
            break;
        case 8:
            playing_teams.style.display = "flex";
            break;
        case 9:
            card.style.display = "none";
            break;
        case 10:
            card.style.display = "flex";
            break;
        case 11:
            console.log("Updating timer");
            scoreboard_set_timer(view);
            break;
        case 12:
            if (timer_is_paused) {
                console.log("Resuming timer");
                start_timer(remaining_time);
            }
            else {
                console.log("Pausing timer");
                scoreboard_pause_timer();
            }
            break;
        // TODO
        default:
            console.log("TODO not a classical mode, anyways, here's the data: ", view);
            break;
    }
};
socket.onerror = (error) => {
    console.error("WebSocket Error: ", error);
};
socket.onclose = () => {
    console.log("WebSocket connection closed!");
};
console.log("Client loaded!");
function hotReloadCSS() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = link.href.split('?')[0] + '?' + new Date().getTime();
        link.replaceWith(newLink);
    });
}
setInterval(hotReloadCSS, 5000);
