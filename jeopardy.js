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
let maxGameID = 6919;
let questionArray = [];
let final = {};

// API/Games/GameID format
// gives us list of at least 30 clues
// CLUES ARE LEFT TO RIGHT, TOP TO BOTTOM OF BOARD
/** 
    {
        "id": 6919,
        "episodeId": 8493,
        "aired": "2021-10-20",
        "canon": true,
        "clues": 
            [
                {
                    "id": 402765,
                    "href": "/api/clues/402765"
                },
                ...
                {
                    "id": 402808,
                    "href": "/api/clues/402808"
                }
            ]
    }
*/

// API/Clues/ClueID format
// also the same as API/Random-Clue format
/**
    {
        "id": 402765,
        "answer": "knots",
        "question": "Electric boats are taking off like electric cars & 30 of these speed units is a common performance benchmark",
        "value": 200,
        "categoryId": 8873,
        "gameId": 6919,
        "invalidCount": 0,
        "category":
            {
                "id": 8873,
                "href": "/api/categories/8873",
                "title": "BOATS & SHIPS",
                "canon": true
            },
        "game":
            {
                "href": "/api/games/6919",
                "aired": "2021-10-20",
                "canon": true
            },
        "canon": true
    }
 */

function markDowntoHTML(string) {
    //replace the linebreaks with <br>
    string = string.replace(/(?:\r\n|\r|\n)/g, '<br>');
    //check for links [text](url)
    let elements = string.match(/\[.*?\)/g);
    if( elements != null && elements.length > 0){
        for(el of elements){
            let txt = el.match(/\[(.*?)\]/)[1];//get only the txt
            let url = el.match(/\((.*?)\)/)[1];//get only the link
            string = string.replace(el,'<a href="'+url+'" target="_blank">'+txt+'</a>')
        }
    }
    return string;
}


async function getQuestions() {

    let rand = Math.floor( Math.random() * (maxGameID + 1) )

     // questions for Single Jeopardy game
    let response1 = await axios.get("https://jservice.xyz/api/games/" + rand);

    // create 2D array long enough for Single Jeopardy + Double Jeopardy
    questionArray = new Array(NUM_CATEGORIES * 2);

    for (let i = 0; i < questionArray.length; i++) {
        questionArray[i] = new Array(NUM_QUESTIONS_PER_CAT);
    }
    
    let k = 0;
    // Single Jeopardy loop
    // For each question needed for a category (5)
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {

        // For each category on the game board (6)
        for (let j = 0; j < NUM_CATEGORIES; j++) {
 
            // For each needed question for the game board (30)

                let question = await axios.get("https://jservice.xyz/api/clues/" + response1.data.clues[k].id);

                // If a question is missing, replace with random question of that category (don't increment K)
                if (i > 0 && question.data.category.title != questionArray[j][0].category) {
                    cat = await axios.get("https://jservice.xyz/api/clues?category=" + questionArray[j][0].categoryID);
                    question = cat.data.clues[i];

                    let newClue = {
                        question: markDowntoHTML(question.question),
                        questionID: question.id,
                        answer: question.answer,
                        category: question.category.title,
                        categoryID: question.category.id,
                        showing: null,
                    };
    
                    questionArray[j][i] = newClue;

                    if (question.category.title != questionArray[(j+1)%6][0].category){
                        k++
                    }
                } else {

                let newClue = {
                    question: markDowntoHTML(question.data.question),
                    questionID: question.data.id,
                    answer: question.data.answer,
                    category: question.data.category.title,
                    categoryID: question.data.category.id,
                    showing: null,
                };

                questionArray[j][i] = newClue;
                k++;
            }
        }
    }

     // questions for Double Jeopardy game
     let response2 = await axios.get("https://jservice.xyz/api/games/" + (rand +1));

    k = 0;
    // Double Jeopardy loop
    // For each question needed for a category (5)
    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {

        // For each category on the game board (6)
        for (let j = 0; j < NUM_CATEGORIES; j++) {
 
            // For each needed question for the game board (30)
                let question = await axios.get("https://jservice.xyz/api/clues/" + response2.data.clues[k].id);

                // If a question is missing, replace with random question of that category (don't increment K)
                if (i > 0 && question.data.category.title != questionArray[j+ NUM_CATEGORIES][0].category) {
                    cat = await axios.get("https://jservice.xyz/api/clues?category=" + questionArray[j+ NUM_CATEGORIES][0].categoryID);
                    question = cat.data.clues[i];

                    let newClue = {
                        question: markDowntoHTML(question.question),
                        questionID: question.id,
                        answer: question.answer,
                        category: question.category.title,
                        categoryID: question.category.id,
                        showing: null,
                    };

                    questionArray[j+NUM_CATEGORIES][i] = newClue;

                    if (question.category.title != questionArray[(j+1)%6 + NUM_CATEGORIES][0].category){
                        k++
                    }
                } else {

                let newClue = {
                    question: markDowntoHTML(question.data.question),
                    questionID: question.data.id,
                    answer: question.data.answer,
                    category: question.data.category.title,
                    categoryID: question.data.category.id,
                    showing: null,
                };

                questionArray[j+NUM_CATEGORIES][i] = newClue;
                k++;
            }
        }
    }
}

// Fill the HTML table#jeopardy with the categories & cells for questions.
// - The <thead> should be filled w/a <tr>, and a <td> for each category
// - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
// - Each with a question for each category in a <td>
function fillTable() {
    let $head = $(`<thead id="categories-row" class="col-2 offset-1 category"></thead>`);
    let $newTr = $(`<tr></tr>`);
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        let $newTd = $(`<td id="cat-` + i + `">` + questionArray[i][0].category + `</td>`);
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

    if (questionArray[cat][q].showing === null) {
        $td.html("");
        $td.removeClass("hidden");
        $td.addClass("question");
        questionArray[cat][q].showing = "question";
        $td.html(questionArray[cat][q].question);
    } else if (questionArray[cat][q].showing === "question") {
        questionArray[cat][q].showing = "answer";
        $td.html(questionArray[cat][q].answer);
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
    } else if (questionArray[cat][q].showing === "answer") {
        questionArray[cat][q].showing = "blank";
        $td.html("");
        $td.removeClass("question");
    }
}

// Start game:
// - get random category IDs
// - get data for each category
// - create HTML table
async function setupAndStart() {
    // get questions for each category and add to global array
    getQuestions().then(() => { 

        // builds board, fill in category headings
        setTimeout(function (){
            fillTable();                      
          }, 1000);

    });

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
            $cat.innerText = questionArray[Number($cat.id[4]) + doubleJepOffset][0].category;
        }

        // Update question TDs
        for ($td of $tds) {
            let cat = $td.id[2];
            let q = $td.id[0];

            $td.classList = "hidden";
            $td.innerHTML = `$` + 400 * (Number(q) + 1);
            questionArray[cat][q].showing = null;
        }
    }, 1000);
}

// Creates Modal popup to display final question/answer, which is pulled from the API
async function finalJeopardy() {
    let response = await axios.get("https://jservice.xyz/api/random-clue");

    final = {
        category: response.data.category.title,
        question: response.data.question,
        answer: response.data.answer
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
    questionArray = []
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
