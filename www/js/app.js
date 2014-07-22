// Global jQuery references
var $shareModal = null;
var $commentCount = null;
var $submitQuiz = null;
var $questions = null;
var $results = null;
var $firstChoice = null
var $secondChoice = null;
var $error = null;

// Global state
var firstShareLoad = true;
var category = null;
var primaryCategory = null;
var secondaryCategory = null;
var games = null;
var answerChecked = false;

var categories = {
    'creativity': 0,
    'social_connection': 0,
    'physical_exploration': 0,
    'pleasure_fun': 0,
    'mental_stimulation': 0
}

/*
 * Run on page load.
 */
var onDocumentLoad = function(e) {
    // Cache jQuery references
    $shareModal = $('#share-modal');
    $commentCount = $('.comment-count');
    $submitQuiz = $('.submit-quiz');
    $questions = $('.question');
    $results = $('.results');
    $firstChoice = $('.first-choice');
    $secondChoice = $('.second-choice');
    $error = $('.error');

    // Bind events
    $shareModal.on('shown.bs.modal', onShareModalShown);
    $shareModal.on('hidden.bs.modal', onShareModalHidden);
    $submitQuiz.on('click', calculateResult);

    getCommentCount(showCommentCount);
}

var calculateResult = function() {
    for(i=0; i<$questions.length; i++) {
        findAnswer($questions[i]);

        if (answerChecked == false) {
            $error.show();
        }

        categories[category]++;
    };

    if (answerChecked == true) {
        var tuples = _.pairs(categories);

        // sort the tuple from greatest to least
        tuples = _.sortBy(tuples, function(category) { return category[1] }).reverse();

        // the primary category is the first in the list, the secondary is the second.
        primaryCategory = tuples[0][0]

        // if answers are all one category
        if (tuples[1][1] < 1) {
            secondaryCategory = primaryCategory;
        }
        else {
            secondaryCategory = tuples[1][0];
        }

        console.log(tuples);

        // get both our first and second choice
        printResult(primaryCategory, secondaryCategory, $firstChoice);
        printResult(secondaryCategory, primaryCategory, $secondChoice);
    }
}

var findAnswer = function(question) {
    var $answers = $(question).find('.answer');

    answerChecked = false;

    _.each($answers, function(answer) {
        if ($(answer).is(':checked')) {
            category = $(answer).attr('value');
            answerChecked = true;
        }
    });
}

var printResult = function(primary, secondary, $el) {
    // store the games sheet
    var games = COPY.games;

    var primaryArray = [];

    /*
    * Loop through the games sheet by row. The first element of the array is the category name.
    * Match that element to the primary category, and set that as the array we will work with.
    */
    for (i=0; i<games.length; i++) {
        var categoryArray = games[i]

        if (categoryArray[0] === primary) {
            primaryArray = categoryArray;
        }
    }

    var result = null;

    /*
    * Find the correct cell based on the secondary category. This order is expected.
    */
    switch(secondary) {
        case 'creativity':
            result = primaryArray[1];
            break;
        case 'social_connection':
            result = primaryArray[2];
            break;
        case 'physical_exploration':
            result = primaryArray[3];
            break;
        case 'pleasure_fun':
            result = primaryArray[4];
            break;
        case 'mental_stimulation':
            result = primaryArray[5];
            break;
    }

    var context = {
        'game': result,
        'explanation': 'TKTKTKTK'
    }
    $results.show();
    var html = JST.result(context);
    $el.html(html);

}

/*
 * Display the comment count.
 */
var showCommentCount = function(count) {
    $commentCount.text(count);

    if (count > 0) {
        $commentCount.addClass('has-comments');
    }

    if (count > 1) {
        $commentCount.next('.comment-label').text('Comments');
    }
}

/*
 * Share modal opened.
 */
var onShareModalShown = function(e) {
    _gaq.push(['_trackEvent', APP_CONFIG.PROJECT_SLUG, 'open-share-discuss']);

    if (firstShareLoad) {
        loadComments();

        firstShareLoad = false;
    }
}

/*
 * Share modal closed.
 */
var onShareModalHidden = function(e) {
    _gaq.push(['_trackEvent', APP_CONFIG.PROJECT_SLUG, 'close-share-discuss']);
}

/*
 * Text copied to clipboard.
 */
var onClippyCopy = function(e) {
    alert('Copied to your clipboard!');

    _gaq.push(['_trackEvent', APP_CONFIG.PROJECT_SLUG, 'summary-copied']);
}

$(onDocumentLoad);
