// Global jQuery references
var $shareModal = null;
var $commentCount = null;
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
var choicesChecked = 0;

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
    $choices = $('input.choice-radio');

    // Bind events
    $resetQuiz.on('click', resetQuiz);
    $choices.on('change', checkQuizCompletion);
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
    choicesChecked = 0;
    var $next = $(this).parents('.question').next();

    $questions.each(findAnswer);

    if (choicesChecked == $questions.length) {
        calculateResult();
    } else {
        pymChild.sendMessage('scrollTo', $next.offset().top);
    }
}

var calculateResult = function() {
    choicesChecked = 0;

    $choices.prop('disabled',true);
            // .off('change', "**");

    _.each($questions, function(element, index) {
        findAnswer(element);

        categories[category]++;
    });

    var tuples = _.pairs(categories);

    // sort the tuple from greatest to least
    tuples = _.sortBy(tuples, function(category) { return category[1] }).reverse();

    // the primary category is the first in the list, the secondary is the second.
    primaryCategory = tuples[0][0]

    // if there is a four-way tie
    if (tuples[0][1] === 2){
        primaryCategory = 'everything';
        secondaryCategory = primaryCategory;
    }
    // if answers are all one category
    else if (tuples[1][1] < 1) {
        secondaryCategory = primaryCategory;
    }
    else {
        secondaryCategory = tuples[1][0];
    }

    // get both our first and second choice
    renderResults(secondaryCategory, primaryCategory, $topGames);
}

var findAnswer = function(index, element) {
    var $questionChoices = $(element).find('.choice-radio');

    _.each($questionChoices, function(choice) {
        if ($(choice).is(':checked')) {
            category = $(choice).attr('value');
            choicesChecked++;
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


    var html = JST.result(context);
    $el.html(html);

    renderGameList(secondaryCategory, primaryCategory, $allGames);

    $submitQuiz.slideUp();
    $results.slideDown({
        duration: 500,
        start: function(){
            pymChild.sendMessage('scrollTo', $('body').height());
        },
        step: function(){
            pymChild.sendHeight();
        },
        complete: function(){
            pymChild.sendHeight();
        }
    });
}

var renderGameList = function(primaryCategory, secondaryCategory, $el) {
    // Remove the top recommendations from the list and group by category
    var games = _.chain(COPY.games)
                 .toArray()
                 .reject(function(game){
                    var firstResult = [primaryCategory, secondaryCategory];
                    var secondResult = [secondaryCategory, primaryCategory];
                    var gameCategories = [game['primary'], game['secondary']];
                    return _.isEqual(gameCategories, firstResult) || _.isEqual(gameCategories, secondResult);
                 })
                 .each(function(game){
                    game['primaryLabel'] = COPY['category_mapper'][game['primary']];
                    game['secondaryLabel'] = COPY['category_mapper'][game['secondary']];
                 })
                 .groupBy(function(game){
                    return game['primary'];
                 })
                 .value();

    // Sort each category by the secondary category
    _.each(games, function(value, key, list){
        list[key] = _.sortBy(value, function(game){
            return game['secondaryLabel'];
        });
    });

    var context = {
        'games': games
    }

    var html = JST.game_list(context);
    $el.html(html);
}

/*
 * Reset the quiz to play again
 */
var resetQuiz = function(){
    // Reset category scores
    _.each(categories, function(value, key, list){
        list[key] = 0;
    });

    // Reset radio button and rebind events
    $choices.prop('checked', false)
            .prop('disabled',false);
            // .on('click', checkQuizCompletion);

    pymChild.sendMessage('scrollTo', 0);

    // Hide results, show the quiz submit button
    $submitQuiz.slideDown();
    $results.slideUp({
        duration: 500,
        progress: function(){
            pymChild.sendHeight();
        },
        complete: function(){
            pymChild.sendHeight();
        }
    });
}

$(onDocumentLoad);
