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
    console.log(data)

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
function modalInformationFetchHandler(plantId) {
    var modalFetchUrl = "https://openfarm.cc/api/v1/crops/" + plantId
    fetch(modalFetchUrl)
    .then(function(response) {
        if (response.ok) {
            return response.json()
        } else {
            modalError()
        }
    })
    .then(function(data) {
        modalDisplayHandler(plantId, data)
    })
    .catch(function(error) {
        modalError(error)
    });
   
}

function modalError(error) {
    // hide conversion button
    $('#fav-btn').for(function() {
        $(this).hide();   
    }) 

    // clear all items
    $('.videoSection', '#modalImg', '#modalHeader', '#modalSubHeader', '#plantDescription', '#plantHeight', '#plantSpread', '#plantGrowthTime', '#plantSpacing', '#plantSowingMethod', '#plantSunReq').each(function() {
        $(this).empty();
    });

    // alert error
    $('#modalHeader').text('Something went wrong... ' + error)
}

// populates the modal with plant info
function modalDisplayHandler(modalId, fetchData) {
    // clear previous youtube videos
    $('.videoSection').html('')

    // clear previous img
    $('#modalImg').attr('src', '');

    // populates modal header with plant name from openfarm
    $('#modalHeader').text(fetchData.data.attributes.name)
    
    // if there are common names, then populate as sub header
    // else, clear current sub header
    if (fetchData.data.attributes.common_names) {
        $('#modalSubHeader').text('Common name(s): ' + fetchData.data.attributes.common_names.join(', '))
    } else {
        $('#modalSubHeader').empty()
    }

    // sets image src to the url from openfarm
    if (fetchData.data.attributes.main_image_path === "/assets/baren_field_square-4a827e5f09156962937eb100e4484f87e1e788f28a7c9daefe2a9297711a562a.jpg") {
        $('#modalImg').attr('src', "./assets/images/baren_field_square-4a827e5f09156962937eb100e4484f87e1e788f28a7c9daefe2a9297711a562a.jpg").addClass('modal-img')
    } else {
        $('#modalImg').attr('src', fetchData.data.attributes.main_image_path).addClass('modal-img')
    }

    // populates the description from openfarm if there is one to display
    if (fetchData.data.attributes.description) {
        $('#plantDescription').text('Description: ' + fetchData.data.attributes.description)
    } else {
        $('#plantDescription').text('Description: There is no description listed for this plant');
    }

   // add height (cm) if openfarm has one listed
   if (fetchData.data.attributes.height) {
       $('#plantHeight').text('Height: ' + fetchData.data.attributes.height + ' cm ')
    } else {
        $('#plantHeight').text('Height: There is no height listed for this plant')
    }

   // add spread if openfarm has one listed
   if (fetchData.data.attributes.spread) {
    $('#plantSpread').text('Spread: ' + fetchData.data.attributes.spread + ' cm')
    } else {
    $('#plantSpread').text('Spread: There is no spread listed for this plant');
    }

   // add average growth time (growing degree days) if openfarm has one listed
   if (fetchData.data.attributes.growing_degree_days) {
    $('#plantGrowthTime').text('Growth Time: ' + fetchData.data.attributes.growing_degree_days + ' days')
    } else {
    $('#plantGrowthTime').text('Growth Time: There is no growth time listed for this plant');
    }

   // add row spacing (cm) if openfarm has one listed
   if (fetchData.data.attributes.row_spacing) {
    $('#plantSpacing').text('Row Spacing: ' + fetchData.data.attributes.row_spacing + ' cm')
    } else {
    $('#plantSpacing').text('Row Spacing: There is no row spacing listed for this plant');
    }

    // add sowing method if openfarm has one listed
    if (fetchData.data.attributes.sowing_method) {
        $('#plantSowingMethod').text('Sowing Method: ' + fetchData.data.attributes.sowing_method)
        } else {
        $('#plantSowingMethod').text('Sowing Method: There is no sowing method listed for this plant');
        }

    // add sun requirements if openfarm has one listed
    if (fetchData.data.attributes.sun_requirements) {
        $('#plantSunReq').text('Sun Requirements: ' + fetchData.data.attributes.sun_requirements)
        } else {
        $('#plantSunReq').text('Sun Requirements: There are no sun requirements listed for this plant');
        }


    // attatches the modal id as an href attribute for my garden button
   $('#fav-btn').attr('href', '#' + modalId).attr('name', fetchData.data.attributes.name);

    // calls function to create embeded videos 
    videoPlayerFetch(fetchData.data.attributes.name)
}

// fetch for youtube information to pass to videoPlayerHandler()
function videoPlayerFetch(plant) {
    var videoUrl = "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&type=video&q=how%20to%20plant%20" + plant + "&key=AIzaSyCMPORVZJdaOUUus5_Ai-OfTRhBIcmYyAs"
    fetch(videoUrl)
    .then(function(response) {
        if (response.ok) {
            return response.json()
        } else {
            $('.videoSection').text('No YouTube videos were found for this particular entry, please try another!')
        }
    })
    .then(function(data) {
        videoPlayerHandler(data)
    })
    .catch(function(error) {
        $('.videoSection').text(`An error has occurred loading videos... ${error}`);
    })

}

// creates embeded YouTube videos
function videoPlayerHandler(data) {
    // adds header to let user know this is the video section
    $('.videoSection')
    .append(
        $('<h5>').text('Top 5 Videos:')
    )
    
    // loops through each video and creates iframe
    for (var i = 0; i < data.items.length; i++)
    $('.videoSection')
    .append(
        $('<iframe>')
        .attr('id', 'player' + i)
        .attr('frameborder', '0')
        .attr('src', 'https://www.youtube.com/embed/' + data.items[i].id.videoId + '?enablejsapi=1')
        .attr('allow', 'fullscreen;')
    )
}

// On click of the search area, this function looks for an <a> tag and cathes the href attribute
$(searchDisplayEl).on('click', 'a', function(event) { 
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

$(myGardenEl).on('click', 'a', function(event) { 
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