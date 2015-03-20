/**********************************************************************
START UP
**********************************************************************/

// define the database
var db = $.localStorage;

if (db.isEmpty('ass')) {
	loadSlide('start');
	db.set('ass', {});
} else {
	loadSlide('resume');
}

// set unseen questions to all questions if none are seen
var unseenQuestions = db.get('ass.unseenQuestions') || db.set('ass.unseenQuestions', allQuestions);

/**********************************************************************
GLOBALS
**********************************************************************/

// The id of the current slide where applicable
window.context = null;
// The points earned for a question
window.points = null;

/**********************************************************************
FUNCTIONS
**********************************************************************/

function loadSlide(id) {

	console.log('slide loaded');

	// clear points from previous question answer
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

	// reset "in hand" answer points
	window.points = null;

	// get questions array
	var questions = db.get('ass.unseenQuestions');

	if (questions.length < 1) {
		loadSlide('seen-all');
		return;
	}

	// use underscore to get random question slug
	var question = _.sample(questions);

	// set unseenQuestions with this question removed
	db.set('ass.unseenQuestions', _.without(questions, question));

	loadSlide(question);

}

// clear data and go to start screen
function restart() {

	console.log('restarting');

	// reinitialize the master object
	db.set('ass', {});

	// reinitialize unseen questions
	db.set('ass.unseenQuestions', allQuestions);

	// go to start screen
	window.location.hash = '#start';

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

	// set anwers.category name to points if it doesn't exist
	var recordedScore = db.get('ass.answers.' + category) || db.set('ass.answers.' + category, points);

	// change recorded score to new score if new score is higher
	if (recordedScore < points) {

		// The new score is higher for the category so set it as the new value
		db.set('ass.answers.' + category, points);
	
	}

	var total = tally(db.get('ass.answers'));

	if (total >= 15) {
		loadSlide('qualify-low');
	}

	// compare values for testing
	console.log('new: ' + points + '\nstored: ' + db.get('ass.answers.' + category) + '\ntotal: ' + total);

}

// tally up the points
function tally(object) {
	var sum = 0;
	for( var el in object ) {
		if( object.hasOwnProperty( el ) ) {
			sum += parseFloat( object[el] );
		}
	}
	return sum;	
}

/**********************************************************************
EVENTS
**********************************************************************/

// click to see a random question
$('[data-action="pick"]').on('click', function() {

	// run pickQuestion function to get a random unseen question
	pickQuestion();

});

// restart the app
$('[data-action="restart"]').on('click', function() {

	// run restart function defined in FUNCTIONS block
	restart();

});

$('[data-action="break"]').on('click', function() {

	// run resume function defined in FUNCTIONS block
	db.set('ass.whereIAm', window.location.hash.slice(1));
	loadSlide('break-time');

});

$('[data-action="resume"]').on('click', function() {

	// run resume function defined in FUNCTIONS block
	resume();

});

$('[type="radio"]').on('change', function() {

	// get checked answer's value and the category the question belongs to
	var points = $(':checked', window.context).val();
	var category = $(':checked').attr('name');

	// convert to a true number or null (from empty string)
	if (points !== '') {
		points = +points;
	} else {
		points = null;
	}

	if (window.points) {
		db.set('ass.answers.' + category, db.get('ass.answers.' + category) - window.points);
	}

	if (points === 15) {

		loadSlide('qualify-high');

	} else {

		setScore(points, category);
		window.points = points;

	}

});