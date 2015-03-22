/**********************************************************************
START UP
**********************************************************************/

// define the database
var db = $.localStorage;

if (db.isEmpty('ass')) {

	// load the intro slide
	loadSlide('start');

	// initialize the ass(essment) object
	db.set('ass', {});

} else {

	// welcome back users or allow new users to restart
	loadSlide('resume');
}

// set unseen questions to all questions if none are seen
var unseenQuestions = db.get('ass.unseenQuestions') || db.set('ass.unseenQuestions', allQuestions);

/**********************************************************************
GLOBALS
**********************************************************************/

// The id of the current slide where applicable
window.context = null;

// The type of slide showing if pertinent
window.slideType = null;

// The points earned for a question
window.points = null;

/**********************************************************************
FUNCTIONS
**********************************************************************/

function loadSlide(id, type) {

	console.log('slide loaded');

	// set type global (eg. 'question') or reset to null
	window.slideType = type ? type : null;

	// clear working points value from previous question answer
	window.points = null;

	// go to picked question
	window.location.hash = '#' + id;

	// focus title to announce title in AT
	$('#' + id)
		.find('h2')
		.focus();

	// find out if we've gone to one of the locations that don't need saving
	var exclude = _.find(['resume', 'break-time'], 
		function(unsaveable) { 
			return unsaveable === id;
	});

	// If it's not an excluded location, save location
	if (!exclude) {

		// Record where the user is for resuming purposes
		db.set('ass.whereIAm', id);

	}

	// Set context reference
	window.context = $('#' + id);

}

// show a random unseen question
function pickQuestion() {

	if (window.slideType === 'question' && !window.points) {
		
		// put the unanswered question into the array of skipped questions
		var skipped = db.get('ass.skippedQuestions') || [];
		skipped.push(window.question);
		db.set('ass.skippedQuestions', skipped);

	}

	// reset "in hand" answer points and question global
	window.points = null;
	window.question = null; 

	// get questions array
	var questions = db.get('ass.unseenQuestions');

	if (questions.length < 1) {
		loadSlide('seen-all');
		return;
	}

	// use underscore to get random question slug
	var question = _.sample(questions);

	// set question to global scope
	window.question = question;

	// set unseenQuestions with this question removed
	db.set('ass.unseenQuestions', _.without(questions, question));

	// load question slide and set slide type global to 'question' 
	loadSlide(question, 'question');

}

// clear data and go to start screen
function restart() {

	console.log('restarting');

	// reinitialize the master object
	db.set('ass', {});

	// reinitialize unseen questions
	db.set('ass.unseenQuestions', allQuestions);

	// go to start screen
	loadSlide('start');

}

// go to slide you were last at
function resume() {

	console.log('resuming');

	// get the stored slide id
	var whereIWas = db.get('ass.whereIAm');

	loadSlide(whereIWas);

}

// set high score per category
function setScore(points, category) {

	// initialize the answers object if it doesn't exist
	if (db.isEmpty('ass.answers')) {
		db.set('ass.answers', {});
	}

	// get previous total
	var oldTotal = tally(db.get('ass.answers'));

	// set anwers.category name to points if it doesn't exist
	var recordedScore = db.get('ass.answers.' + category) || db.set('ass.answers.' + category, points);

	// change recorded score to new score if new score is higher
	if (recordedScore < points) {

		// The new score is higher for the category so set it as the new value
		db.set('ass.answers.' + category, points);
	
	}

	// use tally function to add up high scores
	var total = tally(db.get('ass.answers'));

	if (total >= 15 && oldTotal < 15) {
		loadSlide('qualify-low');
	}

	// compare values for testing
	// console.log('new: ' + points + '\nstored: ' + db.get('ass.answers.' + category) + '\ntotal: ' + total);

}

// tally up the category points
function tally(object) {
	var sum = 0;
	for( var el in object ) {
		if( object.hasOwnProperty( el ) ) {
			sum += parseFloat( object[el] );
		}
	}
	return sum;	
}

// helper function to test numeric strings
function isNumeric(num){
    return !isNaN(num);
}

/**********************************************************************
EVENTS
**********************************************************************/

// click to see a random question
$('body').on('click','[data-action="pick"]', function() {

	// run pickQuestion function to get a random unseen question
	pickQuestion();

});

// restart the app
$('body').on('click','[data-action="restart"]', function() {

	// run restart function defined in FUNCTIONS block
	restart();

});

$('body').on('click','[data-action="break"]', function() {

	// run resume function defined in FUNCTIONS block
	db.set('ass.whereIAm', window.location.hash.slice(1));
	loadSlide('break-time');

});

$('body').on('click','[data-action="resume"]', function() {

	// run resume function defined in FUNCTIONS block
	resume();

});

$('body').on('change','[type="radio"]', function() {

	// get checked answer's value and the category the question belongs to
	var points = $(':checked', window.context).val();
	var category = $(':checked').attr('name');

	// convert to a true number or null (from empty string)
	if (points) {

		// cast as real
		points = +points;

		if (window.points) {
			db.set('ass.answers.' + category, db.get('ass.answers.' + category) - window.points);
		}

		if (isNumeric(points)) {

			if (points === 15) {

				loadSlide('qualify-high');

			} else {

				setScore(points, category);
				window.points = points;

			}

		}

	}

});