const MIN_SIM = 20;
const ROW_MULT = 3;
const LEVENSHTEIN = true;
const ENABLE_SCORE_SHOW = false;

var GAMES;
const gameList = document.getElementById("gameList");
const games = fetch("./games.json")
    .then((response) => response.json())
    .then((json) => {
        return json;
    });

function jsonToGame(gameName, gameFile, score) {
    const FILE_PREFIX = "/";
    const raw_html = `<a href="${FILE_PREFIX + gameFile}" class="w3-bar-item w3-button">${ENABLE_SCORE_SHOW ? gameName + " " + score : gameName}</a>`;
    return raw_html;
}

function updateGames(games) {
    var gamesList = [];
    for (var i = 0; i < games.length; i++) {
        gamesList.push(jsonToGame(games[i].name, games[i].file, games[i].sim === undefined ? "" : 100 - games[i].sim));
    }
    gameList.innerHTML = gamesList.join();
}

games.then((games) => {
    updateGames(games);
    GAMES = games;
});

function rowScore(str1, str2) {
    let count = 0;
    let regex = new RegExp(str2, 'gi');
    let matches = str1.match(regex);

    if (matches !== null) {
        count = matches.length;
    }

    return count;
}

const levenshtein = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator, // substitution
            );
        }
    }
    return track[str2.length][str1.length];
};

function similarity(str1, str2) {
    var score;
    if (LEVENSHTEIN)
        score = levenshtein(str1, str2)
    else
        score = MIN_SIM;

    score -= rowScore(str1, str2) * ROW_MULT;

    return score;
}

const searchInput = document.querySelector('input[type="text"]');
searchInput.oninput = function() {
    let simScores = []; // stored as {game, simscore}
    for (let i = 0; i < GAMES.length; i++) {
        const game = GAMES[i];
        const score = {
            name: game.name,
            sim: similarity(game.name.toLowerCase().replace(/\s/g, ''), searchInput.value.toLowerCase().replace(/\s/g, '')),
            file: game.file,
        }
        console.log(score);
        if (score.sim <= MIN_SIM)
            simScores.push(score);
    }

    simScores.sort((a, b) => {
        return a.sim - b.sim;
    });
    console.log(simScores);

    updateGames(simScores);
};
