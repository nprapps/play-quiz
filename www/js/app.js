// Global jQuery references
var $shareModal = null;
var $commentCount = null;
var $submitQuiz = null;
var $questions = null;

// Global state
var firstShareLoad = true;
var category = null;
var primaryCategory = null;
var secondaryCategory = null;
var games = null;

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

    // Bind events
    $shareModal.on('shown.bs.modal', onShareModalShown);
    $shareModal.on('hidden.bs.modal', onShareModalHidden);
    $submitQuiz.on('click', calculateResult);

    getCommentCount(showCommentCount);
}

var calculateResult = function() {
    _.each($questions, function(question) {
        findAnswer(question);

        categories[category]++;
    });

    // take the categories object and make sort-of tuples in JavaScript lol.
    var tuples = [];

    for (var key in categories) {
        tuples.push([key, categories[key]]);
    }

    // sort the tuple from greatest to least
    tuples.sort(function(a, b) {
        a = a[1];
        b = b[1];

        return a > b ? -1 : (a < b ? 1 : 0);
    });

    // the primary category is the first in the list, the secondary is the second.
    primaryCategory = tuples[0][0]
    secondaryCategory = tuples[1][0];

    printResult(primaryCategory, secondaryCategory);
}

var findAnswer = function(question) {
    var $answers = $(question).find('.answer');

    _.each($answers, function(answer) {
        if ($(answer).is(':checked')) {
            category = $(answer).attr('value');
        }
    });
}

var printResult = function(primary, secondary) {
    // find the result based on primary and secondary categories
    var games = COPY.games;

    var primaryArray = [];

    for (i=0; i<games.length; i++) {
        var categoryArray = games[i]

        if (categoryArray[0] === primary) {
            primaryArray = categoryArray;
        }
    }

    var result = null;

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

    $('.result').text(result);

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
