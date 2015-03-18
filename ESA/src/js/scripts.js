// define the database
var db = $.localStorage;

if (db.isEmpty('ass')) {
	window.location.hash = '#start';
	db.set('ass', {});
} else {
	window.location.hash = '#resume';
}

// set unseen questions to all questions if none are seen
var unseenQuestions = db.get('ass.unseenQuestions') || db.set('ass.unseenQuestions', allQuestions);

/**********************************************************************
FUNCTIONS
**********************************************************************/

// show a random unseen question
function pickQuestion() {

	// get questions array
	var questions = db.get('ass.unseenQuestions');

	if (questions.length < 1) {
		window.location.hash = "#seen-all";
		return;
	}

	// use underscore to get random question slug
	var question = _.sample(questions);

	// set unseenQuestions with this question removed
	db.set('ass.unseenQuestions', _.without(questions, question));

	// go to picked question
	window.location.hash = '#' + question;

	// Record where the user is for resuming purposes
	db.set('ass.whereIAm', 'questions');

	$(window.location.hash)
		.find('h2')
		.focus();

}

function restart() {

	// reinitialize the master object
	db.set('ass', {});

	// reinitialize unseen questions
	db.set('ass.unseenQuestions', allQuestions);

	// go to start screen
	window.location.hash = '#start';

}

function resume() {

	// find out which part of the app the user was in before
	var whereWasI = db.get('ass.whereIAm');

	if (whereWasI === 'questions') {
		pickQuestion();
	}	

	if (whereWasI === 'advice') {
		/* TODO */
	}

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


$('[data-action="resume"]').on('click', function() {

	// run resume function defined in FUNCTIONS block
	resume();

});