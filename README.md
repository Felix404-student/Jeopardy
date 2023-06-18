# Jeopardy
Jeopardy! assignment for UMass/Springboard bootcamp, empahsis on API and JQuery

<div class="section" id="it-s-jeopardy">
<h2>It’s Jeopardy!</h2>
<p><strong>Using jQuery and AJAX</strong>, you’ll build a small, straightforward Jeopardy game.</p>
<p>Before you start, read about the <a class="reference external" href="http://jservice.io/">jService API</a>,
which provides categories and clues from the televised Jeopardy show.</p>
<div class="section" id="requirements">
<h3>Requirements</h3>
<p>You can see a working version of this at <a class="reference external" href="https://jeopardy-example.surge.sh/">https://jeopardy-example.surge.sh/</a>.</p>
<ul class="simple">
<li>The game board should be 6 categories across, 5 question down, displayed in
a table. Above this should be a header row with the name of each category.</li>
<li>At the start of the game, you should randomly pick 6 categories from the
jService API. For each category, you should randomly select 5 questions
for that category.</li>
<li>Initially, the board should show with <strong>?</strong> on each spot on the board (on
the real TV show, it shows dollar amount, but we won’t implement this).</li>
<li>When the user clicks on a clue <strong>?</strong>, it should replace that with the question
text.</li>
<li>When the user clicks on a visible question on the board, it should change to
the answer (if they click on a visible answer, nothing should happen)</li>
<li>When the user clicks the “Restart” button at the bottom of the page, it should
load new categories and questions.</li>
</ul>
<p>We’ve provided an HTML file and CSS for the application (you shouldn’t change
the HTML file; if you want to tweak any CSS things, feel free to).</p>
<p>We’ve also provided a starter JS file with function definitions. Implement
these functions to meet the required functionality.</p>
<div class="admonition note">
<p>Randomly picking multiple things</p>
<p>In the requirements, we’ve asked for 6 random categories. Unfortunately,
the jService API doesn’t have a method that returns a random category —
you’ll need to figure this out.</p>
<p>There are a few possible strategies here:</p>
<ul class="last simple">
<li>Get a bunch of categories, and keep randomly choosing one, making sure
you don’t choose the same one twice.</li>
<li>Get a bunch of categories, shuffle them, then pick the first 6.
Unfortunately, Javscript doesn’t have a built-in shuffle function, but
you can find hints online on how to make one.</li>
<li>Find a function that will pick <em>n</em> random things for you. This is often
called “sampling”. There’s a popular library for Javascript, Lodash,
which provides a function that can sample a particular number of items
from a larger list, making sure there are no duplicates.</li>
</ul>
</div>
</div>
</div>
