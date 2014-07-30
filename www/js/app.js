// Global jQuery references
var $shareModal = null;
var $commentCount = null;
var $submitQuiz = null;
var $questions = null;
var $results = null;
var $topGames = null
var $allGames = null;
var $answers = null;

// Global state
var firstShareLoad = true;
var category = null;
var primaryCategory = null;
var secondaryCategory = null;
var answersChecked = 0;

var categories = {
    'creativity': 0,
    'social_connection': 0,
    'physical_exploration': 0,
    'pleasure_fun': 0,
    'mental_stimulation': 0
}

var pymChild = null;

/*
 * Run on page load.
 */
var onDocumentLoad = function(e) {
    // Cache jQuery references
    $shareModal = $('#share-modal');
    $commentCount = $('.comment-count');
    $submitQuiz = $('.submit-quiz');
    $resetQuiz = $('.reset-quiz');
    $questions = $('.question');
    $results = $('.results');
    $topGames = $('.top-games');
    $allGames = $('.all-games');
    $error = $('.error');

    pymChild = new pym.Child();

    // Render each question's choices in random order
    $questions.each(renderChoices);
    pymChild.sendHeight();

    // Cache answers lookup after they're rendered
    $answers = $('.answer');

    // Bind events
    $shareModal.on('shown.bs.modal', onShareModalShown);
    $shareModal.on('hidden.bs.modal', onShareModalHidden);
    $submitQuiz.on('click', calculateResult);
    $resetQuiz.on('click', resetQuiz);
    $answers.on('click', checkQuizCompletion);
}

var renderChoices = function(index, el) {
    var questionKey = $(el).attr('id')
    var choices = _.shuffle(COPY[questionKey]);

    var context = {
        'choices': choices,
        'categories': Object.getOwnPropertyNames(choices),
        'questionKey': questionKey
    }

    var html = JST.choices(context);
    $(el).find('.answers').html(html);

    $(el).find('img').load(function(){
        pymChild.sendHeight();
    });
}

var checkQuizCompletion = function(el) {
    answersChecked = 0;
    var $nextQuestion = $(this).parents('.question').next();

    for (i = 0; i < $questions.length; i++) {
        findAnswer($questions[i])
    }

    if (answersChecked == $questions.length) {
        $submitQuiz.removeAttr("disabled");
    } else {
        pymChild.sendMessage('scrollTo', $nextQuestion.offset().top);
    }

}

var calculateResult = function() {
    answersChecked = 0;

    for (i=0; i<$questions.length; i++) {
        findAnswer($questions[i]);

        categories[category]++;
    };

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

    // get both our first and second choice
    renderResults(secondaryCategory, primaryCategory, $topGames);
    renderGameList(secondaryCategory, primaryCategory, $allGames);
}

var findAnswer = function(question) {
    var $answers = $(question).find('.answer');

    _.each($answers, function(answer) {
        if ($(answer).is(':checked')) {
            category = $(answer).attr('value');
            answersChecked++;
        }
    });
}

var renderResults = function(primaryCategory, secondaryCategory, $el) {
    // store the games sheet
    var games = _.toArray(COPY.games);

    // Find the game that matches our top two categories
    var firstResult = _.findWhere(games, { 'primary': primaryCategory, 'secondary': secondaryCategory});
    var secondResult = _.findWhere(games, { 'primary': secondaryCategory, 'secondary': primaryCategory});

    var context = {
        'firstResult': firstResult,
        'secondResult': secondResult,
        'primaryCategory': COPY['category_mapper'][primaryCategory].toLowerCase(),
        'secondaryCategory': COPY['category_mapper'][secondaryCategory].toLowerCase()
    }

    $submitQuiz.hide();
    $results.show();
    var html = JST.result(context);
    $el.html(html);

    pymChild.sendHeight();
    pymChild.sendMessage('scrollTo', $results.offset().top);
}

var renderGameList = function(primaryCategory, secondaryCategory, $el) {
    var games = _.chain(COPY.games)
                 .toArray()
                 .reject(function(game){
                    var firstResult = [primaryCategory, secondaryCategory];
                    var secondResult = firstResult.reverse();
                    var gameCategories = [game['primary'], game['secondary']];
                    return gameCategories === firstResult || gameCategories === secondResult;
                 })
                 .each(function(game){
                    game['primaryLabel'] = COPY['category_mapper'][game['primary']];
                    game['secondaryLabel'] = COPY['category_mapper'][game['secondary']];
                 })
                 .value();

    var context = {
        'games': games
    }

    var html = JST.game_list(context);
    $el.html(html);

    pymChild.sendHeight();
}

/*
 * Reset the quiz to play again
 */
var resetQuiz = function(){
    // Reset category scores
    _.each(categories, function(value, key, list){
        list[key] = 0;
    });

    // Uncheck radios and hide results
    $answers.prop('checked', false);
    $results.hide();
    $submitQuiz.show();

    pymChild.sendHeight();
    pymChild.sendMessage('scrollTo', 0);
}

$(onDocumentLoad);
