/**********************************************************************
START UP
**********************************************************************/

// define the database
var db = $.localStorage;

if (db.isEmpty('ass')) {

	// setup the database ass object
	initAss();
	window.answered = false;

	// load the intro slide
	loadSlide('start');

} else {

	// welcome back users or allow new users to restart
	loadSlide('resume');
}

/**********************************************************************
FUNCTIONS
**********************************************************************/

function initAss() {

	// model the database 'ass' object
	var assTemplate = { // the questions which haven't been viewed
		unseenQuestions: window.allQuestions,
		skippedQuestions: [], // the questions which have been viewed but not answered
		context: null, // the jQuery object for the slide in hand
		slideType: null, // null or 'question' etc.
		mode: 'unseenQuestions', // 'unseenQuestions' or 'skippedQuestions' (for switching between viewing unseen questions or seen but skipped)
		answers: {} // the master object of category high scores for tallying
	};

	// Save the virgin ass to local storage
	db.set('ass', assTemplate);
}

function loadSlide(id, type) {

	$('.slide > *').removeClass('loaded');

	console.log('slide loaded');

	// set type in local storage or reset to null
	if (type) {
		db.set('ass.slideType', type);
	} else {
		db.set('ass.slideType', null);
	}

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

	// Set context reference (jQuery object)
	db.set('ass.context', id);

	// add the loaded class for transitions
	$('#' + id + ' > *').addClass('loaded');

}

// show a random unseen question
function pickQuestion() {

	// the type of the previous slide if any
	var type = db.get('ass.slideType');
	// the last slide seen
	var context = db.get('ass.context');
	// get mode
	var mode = db.get('ass.mode');

	if (type === 'question' && !window.answered && mode === 'unseenQuestions') {

		// put the unanswered question into the array of skipped questions
		var skipped = db.get('ass.skippedQuestions');
		skipped.push(db.get('ass.context'));
		console.log(skipped);
		db.set('ass.skippedQuestions', _.uniq(skipped));

	}

	// get the appropriate set
	var questions = db.get('ass.' + mode);

	if (questions.length < 1 && mode === 'unseenQuestions') {
		loadSlide('seen-all');
		return;
	}

	// init individual question var
	var question;

	if (mode === 'unseenQuestions') {

		// use underscore to get random question slug
		question = _.sample(questions);

		// set collection with this question removed
		db.set('ass.' + mode, _.without(questions, question));

	} else {

		console.log(db.get('ass.skippedQuestions'));

		if (window.answered) {		

			questions = _.without(questions, context);

			question = _.sample(questions);

			// if the array is empty, all the skipped questions are answered
			if (question === undefined) {

				loadSlide('seen-all-even-skipped');
				return;
			}

			db.set('ass.' + mode, questions);


		} else {

			// remove last question seen from random sample
			// so two questions don't show at once
			questions = _.without(questions, context);
			question = _.sample(questions);

		}

	}

	// load question slide and set slide type global to 'question' 
	loadSlide(question, 'question');

	// set to false until button pressed
	window.answered = false;

}

// clear data and go to start screen
function restart() {

	console.log('restarting');

	// reinitialize the master object
	initAss();

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

// add the high scores for each category together
function tally() {
	
	// get all the answers
	var answers = db.get('ass.answers');

	// init the total
	total = 0;

	// add up the highest values for each category
	$.each(answers, function(index, value) {
	    total += _.max(value);
	});

	if (total >= 15) {

		if (!db.get('ass.high')) {

			loadSlide('qualify-low');

		}

	}

}

// helper function to test numeric strings
function isNumeric(num) {
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

// click to see a random question
$('body').on('click','[data-action="skipped"]', function() {

	// the first skipped question cannot have been answered
	window.answered = false;

	// set mode to skipped questions
	db.set('ass.mode', 'skippedQuestions');

	// pick a question
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

	// record that change has been made
	window.answered = true;

	// get checked answer's value and the category the question belongs to
	var context = db.get('ass.context');
	var points = $(':checked', '#' + context).val();
	var category = $(':checked', '#' + context).attr('name');

	if (isNumeric(points)) {

		// cast to real number
		points = +points;

		if (points === 15) {

			// no need to add up, just tell the user
			loadSlide('qualify-high');

			// record that the high qualification is true
			db.set('ass.high', true);
			
		} else {

			// check if the category object exists
			// and, if not, set it
			if (!db.isSet('ass.answers.' + category)) {
				db.set('ass.answers.' + category, category);
			}

			// set the new points for this question in this category
			db.set('ass.answers.' + category + '.' + context, points);

			// fire the adding up function
			// to see if there are enough points to qualify
			tally();

		}

	} else {

		// handle follow up questions

	}

});