// dom object
var recipeListEl = $('#recipe-list');
var infoEl = $('#info');

// get list of plants
var getIngredientList = function() {
    var queryString = document.location.search;

    var ingredientLIst = queryString.split("=")[1];

    ingredientLIst = ingredientLIst.substring(0, ingredientLIst.length -1);

    if(ingredientLIst) {
        // add list to DOM

        // pass to API function
        apiPull(ingredientLIst);
    } else {
        // redirect back to index
        document.location.replace('./index.html');
    }
};

// api call function
var apiPull = function(ingredientLIst) {
    var api = 'https://api.spoonacular.com/recipes/findByIngredients';
    var apiKey = '1fc9fe20885b43999c5970d525cd7ee6'

    fetch(`${api}?ingredients=${ingredientLIst}&number=10&apiKey=${apiKey}`).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                recipeListEl.text("Please wait...");
                displayRecipes(data);
            })
        } else {
            throw new Error("There was an error with the request.");
        }
    })
    .catch(function(error) {
        recipeListEl.text(error);
    });
};

// function to display recipes to page
var displayRecipes =  function(data) {
    // clear previous items
    recipeListEl.text('');

    // update info
    infoEl.text("Make some yummy meals with your harvested ingredients:");

    for (var i = 0; i < data.length; i++) {
        // created and add content for card of each search result
        var colEl = $('<a>').addClass('modal-trigger col s12 m6 l4 xl3').attr('href', `#${data[i].id}`);

        var cardEl = $('<div>').addClass('card');

        var imageDiv = $('<div>').addClass('card-image');
        var imageEl = $('<img>').attr('src', data[i].image);
        imageDiv.append(imageEl);
        var spanEl = $('<span>').addClass('card-title black-text').text(data[i].title);
        imageDiv.append(spanEl);
        
        cardEl.append(imageDiv);
        
        colEl.append(cardEl);

        // add card to page
        recipeListEl.append(colEl);
    }
};

getIngredientList()

// Modal Info -----------------------------

// add id from plantId to modal 
function addModalId(id) {
    $('.modal').attr('id', id);
}

// makes the fetch to openfarm, passing in the plantId from click function
function modalInformationFetchHandler(recipeId) {
    var modalFetchUrl = "https://api.spoonacular.com/recipes/" + recipeId + "/information?includeNutrition=false&apiKey=1ce5503bf49b445b92a7267bc15d3d4f"
    fetch(modalFetchUrl)
    .then(function(response) {
        if (response.ok) {
            return response.json()
        } else {
            modalError()
        }
    })
    .then(function(data) {
        console.log(data)
        modalDisplayHandler(recipeId, data)
    })
    .catch(function(error) {
        modalError(error)
    });
   
}

function modalError(error) {
 
    // clear all items
    $('.videoSection', '#modalImg', '#modalHeader', '#modalSubHeader', '#plantDescription', '#plantHeight', '#plantSpread', '#plantGrowthTime', '#plantSpacing', '#plantSowingMethod', '#plantSunReq').each(function() {
        $(this).empty();
    });

    // alert error
    $('#modalHeader').text('Something went wrong... ' + error)
}

// populates the modal with plant info
function modalDisplayHandler(modalId, fetchData) {
    var ingredientListEl = $('#recipeIngredients')

    $('#modalHeader').text(fetchData.title)
    $('#modalImg').attr('src', fetchData.image)

    for (var i = 0; i < fetchData.extendedIngredients.length; i++) {
        var listItem = $('<li>').text(fetchData.extendedIngredients[i].originalString).addClass('recipeList')
        $(ingredientListEl).append(listItem);
    }

    $('#recipeInstructions').text(fetchData.instructions)

}

// On click of the search area, this function looks for an <a> tag and cathes the href attribute
$(recipeListEl).on('click', 'a', function(event) { 
    // finds the href attribute
    var aTagId = $(this).attr('href')

    // gets rid of '#' 
    var modalId = aTagId.replace('#', '');
   
    // runs function to add modalid to the modal div
    addModalId(modalId);

    // looks for that new modal and initializes it
    $('#' + modalId).modal();

    // displays loading message for user
    $('#modalHeader').text('Loading...');

    // sends modal id to the fetch function
    modalInformationFetchHandler(modalId);
    
});
