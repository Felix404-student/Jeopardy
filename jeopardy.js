/**
 * Author: Justin Brown for UMass/Springboard bootcamp 
 * Assignment: It’s Jeopardy!
 * Using jQuery and AJAX, you’ll build a small, straightforward Jeopardy game.
 * 
 * Before you start, read about the jService API, which provides categories and clues from the 
 * televised Jeopardy show.
 * 
 * Requirements
 * The game board should be 6 categories across, 5 question down, displayed in a table. Above this 
 * should be a header row with the name of each category.
 * At the start of the game, you should randomly pick 6 categories from the jService API. For each 
 * category, you should randomly select 5 questions for that category.
 * Initially, the board should show with ? on each spot on the board (on the real TV show, it shows 
 *     dollar amount, but we won’t implement this).
 * When the user clicks on a clue ?, it should replace that with the question text.
 * When the user clicks on a visible question on the board, it should change to the answer (if they 
 *     click on a visible answer, nothing should happen)
 * When the user clicks the “Restart” button at the bottom of the page, it should load new 
 * categories and questions.
 * We’ve provided an HTML file and CSS for the application (you shouldn’t change the HTML file; if 
 *     you want to tweak any CSS things, feel free to).
 * 
 * We’ve also provided a starter JS file with function definitions. Implement these functions to 
 * meet the required functionality.
 * 
 * Randomly picking multiple things
 * In the requirements, we’ve asked for 6 random categories. Unfortunately, the jService API doesn’t 
 * have a method that returns a random category — you’ll need to figure this out.
 * 
 * There are a few possible strategies here:
 * Get a bunch of categories, and keep randomly choosing one, making sure you don’t choose the same 
 * one twice.
 * Get a bunch of categories, shuffle them, then pick the first 6. Unfortunately, Javscript doesn’t 
 * have a built-in shuffle function, but you can find hints online on how to make one.
 * Find a function that will pick n random things for you. This is often called “sampling”. There’s 
 * a popular library for Javascript, Lodash, which provides a function that can sample a particular 
 * number of items from a larger list, making sure there are no duplicates.
 */

$splashImg = $("#start");
$startBtn = $("#start-button");
$game = $("#game");
$board = $("#jeopardy");
$categories = $("#categories-row");
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
let questionsShown = NUM_CATEGORIES * NUM_QUESTIONS_PER_CAT;
let doubleJepOffset = 0;

// categories is the main data structure for the app; it looks like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
let categories = [];
let final = {};

// Retrieves 12 sequential, but random categories from JService API (6 to start, 6 for Double)
// Returns array of category ids
async function getCategoryIds() {
    let catIds = [];
    let offset = 13;
    let rand = Math.floor(Math.random() * 28150);
    const response = await axios.get(
        "https://jservice.io/api/categories?count=" + NUM_CATEGORIES * 2 + "&offset=" + rand
    );

    for (let i = 0; i < response.data.length; i++) {
        // make sure we have enough questions in this category to use it!
        while (response.data[i].clues_count < 5) {
            let newCat = await axios.get(
                "https://jservice.io/api/categories?count=1&offset=" + (rand - offset)
            );
            offset++;
            response.data[i] = newCat.data[0];
        }
        catIds.push(response.data[i].id);
    }
    return catIds;
}

// Returns object with data about a category (title, first 5 questions):
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    }
async function getCategory(catId) {
    let response = await axios.get("https://jservice.io/api/category?id=" + catId);
    let arrClues = [];

    for (let i = 0; i < 5; i++) {
        let newClue = {
            question: response.data.clues[i].question.toUpperCase().replace(/\\/g, ""),
            answer: response.data.clues[i].answer.toUpperCase().replace(/\\/g, ""),
            showing: null,
        };
        arrClues.push(newClue);
    }

    let newCategory = {
        title: response.data.title.toUpperCase(),
        clues: arrClues,
    };

    return newCategory;
}

// Fill the HTML table#jeopardy with the categories & cells for questions.
// - The <thead> should be filled w/a <tr>, and a <td> for each category
// - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
// - Each with a question for each category in a <td>
function fillTable() {
    let $head = $(`<thead id="categories-row" class="col-2 offset-1 category"></thead>`);
    let $newTr = $(`<tr></tr>`);
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        let $newTd = $(`<td id="cat-` + i + `">` + categories[i].title + `</td>`);
        $newTr.append($newTd);
    }
    $head.append($newTr);
    $board.append($head);

    let $table = $(`<tbody></tbody>`);
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        let $newTr = $(`<tr id="row-` + i + `">`);
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            let $newTd = $(
                `<td id="` + i + `-` + j + `" class="hidden">$` + 200 * (i + 1) + `</td>`
            );
            $newTr.append($newTd);
        }
        $table.append($newTr);
    }
    $board.append($table);
    // Updates the button after data is done being fetched so game can start
    $startBtn.html("PLAY!");
}

// Handle clicking on a clue: show the question or answer using .showing property on clue to 
// determine behavior:
// - if currently null, show question & set .showing to "question"
// - if currently "question", show answer & set .showing to "answer"
// - if currently "answer", clear td
// - if currently "blank", do nothing
function handleClick(evt) {
    let cat = Number(evt.id[2]) + doubleJepOffset;
    let q = evt.id[0];
    let $td = $("#" + evt.id);

    if (categories[cat].clues[q].showing === null) {
        $td.html("");
        $td.removeClass("hidden");
        $td.addClass("question");
        categories[cat].clues[q].showing = "question";
        $td.html(categories[cat].clues[q].question);
    } else if (categories[cat].clues[q].showing === "question") {
        categories[cat].clues[q].showing = "answer";
        $td.html(categories[cat].clues[q].answer);
        questionsShown--;

        if (questionsShown <= 0) {
            setTimeout(function () {
                if (doubleJepOffset === 0) {
                    doubleJeopardy();
                } else {
                    finalJeopardy();
                }
            }, 2000);
        }
    } else if (categories[cat].clues[q].showing === "answer") {
        categories[cat].clues[q].showing = "blank";
        $td.html("");
        $td.removeClass("question");
    }
}

// Start game:
// - get random category IDs
// - get data for each category
// - create HTML table
async function setupAndStart() {
    // get category IDs
    let catIds = await getCategoryIds();

    // get questions for each category and add to global array
    try {
        for (id of catIds) {
            let newCat = await getCategory(id);
            categories.push(newCat);
        }
    } catch (e) {
        reload();
    }

    // builds board, fill in category headings
    fillTable();
}

// Bring loading screen back in to hide transition
// Wipe the current Jeopardy board, update with new categories
function doubleJeopardy() {
    $splashImg.children()[0].src = "double_pic.png";
    $splashImg.addClass("ease-in");
    $splashImg.removeClass("playing");

    setTimeout(function () {
        $splashImg.removeClass("ease-in");
        doubleJepOffset = 6;
        questionsShown = NUM_CATEGORIES * NUM_QUESTIONS_PER_CAT;
        let $cats = $("thead td");
        let $tds = $("tbody td");

        // Update categories
        for ($cat of $cats) {
            $cat.innerText = categories[Number($cat.id[4]) + 6].title;
        }

        // Update question TDs
        for ($td of $tds) {
            let cat = $td.id[2];
            let q = $td.id[0];

            $td.classList = "hidden";
            $td.innerHTML = `$` + 400 * (Number(q) + 1);
            categories[cat].clues[q].showing = null;
        }
    }, 1000);
}

// Creates Modal popup to display final question/answer, which is pulled from the API
async function finalJeopardy() {
    let response = await axios.get("https://jservice.io/api/final");

    final = {
        category: response.data[0].category.title.toUpperCase(),
        question: response.data[0].question.toUpperCase(),
        answer: response.data[0].answer.toUpperCase(),
    };

    let $popup = $(
        `<div class="popup-overlay">
            <div class="popup-content">
                <p>FINAL  JEOPARDY!</p>
                <p>"` +
            final.category +
            `"</p>
                <p>` +
            final.question +
            `</p>
            </div>
        </div>`
    );
    $game.append($popup);
}

// End of game function - bring splash image back down to hide transition
// reset EVERYTHING in the DOM to original state
// call setupAndStart to begin again
function resetDocument() {
    $(".popup-overlay").remove();
    $splashImg.children()[0].src = "jeopardy_pic.png";
    $startBtn.html("LOADING...");
    $splashImg.addClass("ease-in");
    $splashImg.removeClass("playing");

    questionsShown = NUM_CATEGORIES * NUM_QUESTIONS_PER_CAT;
    doubleJepOffset = 0;
    categories = [];
    final = {};
    $board.empty();

    $splashImg.removeClass("ease-in");
    setupAndStart();
}

// Prevents CORS preflight rejection of API request by Chrome
jQuery.ajaxPrefilter(function (options) {
    if (options.crossDomain && jQuery.support.cors) {
        options.url = "https://cors-anywhere.herokuapp.com/" + options.url;
    }
});

// Clicking start button hides loading splash image
$startBtn.on("click", function () {
    if ($startBtn.html() === "PLAY!") {
        $splashImg.addClass("playing");
    }
});

// On page load, add event handler for clicking clues
$board.on("click", "tbody td", function () {
    handleClick(this);
});

// Event handler for Final Jeopardy answer reveal
$(document).on("click", ".popup-overlay", function () {
    $(".popup-content").html(
        `<p>` +
            final.answer +
            `</p>
        <button id="button" class="newGame">PLAY AGAIN?</button>`
    );
});

// Event handler for end of game => reset EVERYTHING
$(document).on("click", ".newGame", function () {
    resetDocument();
});

// Fetch questions as soon as it is safe to do so
$(document).ready(function () {
    setupAndStart();
});