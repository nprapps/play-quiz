// Global jQuery references
var $shareModal = null;
var $commentCount = null;
var $submitQuiz = null;
var $questions = null;

// Global state
var firstShareLoad = true;
var category = null;

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

    // renderExampleTemplate();
    getCommentCount(showCommentCount);
}

var calculateResult = function() {
    _.each($questions, function(question) {
        findAnswer(question);

        console.log(category);
    })
}

var findAnswer = function(question) {
    var $answers = $(question).find('.answer');

    _.each($answers, function(answer) {
        if ($(answer).is(':checked')) {
            category = $(answer).attr('value');
        }
    })
}

/*
 * Basic templating example.
 */
// var renderExampleTemplate = function() {
//     var context = $.extend(APP_CONFIG, {
//         'template_path': 'jst/example.html',
//         'config': JSON.stringify(APP_CONFIG, null, 4),
//         'copy': JSON.stringify(COPY, null, 4)
//     });

//     var html = JST.example(context);

//     $('#template-example').html(html);
// }

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
