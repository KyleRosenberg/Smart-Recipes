var jsonfile = require('jsonfile');

var recipes = {};
var population = [];
var ratings = [];
var categories = [
    "Asian Fusion",
    "Chicken",
    "Chinese",
    "Seafood",
    "Cheese",
    "Mexican",
    "Turkey",
    "Pizza",
    "Fruit",
    "Vegan",
    "Vegetarian",
    "Holiday & Seasonal",
    "Casseroles",
    "American",
    "Beef",
    "Pasta",
    "Beverages",
    "Desserts",
    "Breads",
    "Breakfast",
    "Healthy Choices",
    "Salads",
    "Side Dishes",
    "Sandwiches",
    "Snacks",
    "Buffalo",
    "Vegetables",
    "Appetizers",
    "Italian",
    "Soups & Stews",
    "Grill",
    "Pork",
    "Barbeque",
    "Fish",
    "Bacon",
    "Candy",
    "Nuts",
    "European",
    "French",
    "Brunch",
    "Slow Cooker",
    "Indian",
    "Thai",
    "Cajun",
    "Lamb",
    "German",
    "Japanese",
    "Condiments & Sauces",
    "Duck",
    "Vietnamese",
    "Greek",
    "Russian",
    "Pet Food & Treats"
]

function getRecipesWithCategory(dict, cat){
    keys = Object.keys(dict);
    ret = [];
    for (var i = 0; i<keys.length; i++){
        if (dict[keys[i]]['categories'].indexOf(cat)!=-1){
            ret.push(keys[i]);
        }
    }
    return ret;
}

function displayRecipe(index){
    $('#infocolumn').css('visibility', 'visible');
    recipe = recipes[index];
    $('#recipename').text(recipe.name);
    var ingredients = document.getElementById('ingredients');
    $('#ingredients').empty();
    for (var i = 0; i<recipe.ingredients.length; i++){
        var li = document.createElement('li');
        //li.className += 'item';
        li.appendChild(document.createTextNode(recipe.ingredients[i]));
        ingredients.appendChild(li);
    }
    $('#directions').text(recipe.directions);
}

function getCategories(){
    keys = Object.keys(recipes);
    unique = [];
    for (let i = 0; i<keys.length; i++){
        cats = recipes[keys[i]]['categories'];
        for (let j = 0; j < cats.length; j++){
            if (unique.indexOf(cats[j])==-1){
                unique.push(cats[j]);
            }
        }
    }
    console.log(unique);
}

window.onload = function(){
    jsonfile.readFile('recipes.json', function(err, obj){
        if (err==null){
            recipes = obj;
        }
        jsonfile.readFile('mldat.json', function(err, obj){
            if (err!=null){
                makePopulation();
                ratings = [0, 0, 0, 0, 0];
                $('#firsttime').removeClass('hidden');
            } else {
                population = obj['population'];
                ratings = obj['ratings'];
            }
            for (var i = 0; i<5; i++){
                var num = i;
                $('#recipename' + i).text(recipes[population[i]]['name'].replace('\\', ''));
                ele = document.getElementById('recipeselect'+num);
                ele.setAttribute('data-number', population[num]);
                ele.onclick = (e) => {
                    $('#firsttime').addClass('hidden');
                    e=e.target;
                    while (e.nodeName.toLowerCase()!='a'){
                        e=e.parentNode;
                    }
                    displayRecipe(e.getAttribute('data-number'));
                }
                document.getElementById('rating' + num).setAttribute('data-rating', ratings[num]);
            }
            for (var i = 0; i<5; i++){
                $('#rating' + i).rating({
                    onRate: function(value){
                        id = $(this).get(0).id;
                        ratings[parseInt(id.charAt(id.length-1))] = value;
                        $(this).attr('data-rating', value);
                    },
                    initialRating: ratings[i]
                });
            }
        });
    });
    $('#title').transition('fade', 0);
    //Events
    document.getElementById('gotorecipes').onclick = function(){
        $('#gotorecipes').transition({
            animation: 'fly left',
            onComplete: function(){
                $('#title').transition({
                    animation: 'fade',
                    duration: '1s',
                    onComplete: function(){
                        $('#main').transition('fade', 1000);
                    }
                });
            }
        });
    }
    document.getElementById('getnew').onclick = function(){
        getNewPopulation();
        ratings = [0, 0, 0, 0, 0];
        for (var i = 0; i<5; i++){
            var num = i;
            $('#recipename' + i).text(recipes[population[i]]['name'].replace('\\', ''));
            ele = document.getElementById('recipeselect'+num);
            ele.setAttribute('data-number', population[num]);
            ele.onclick = (e) => {
                $('#firsttime').addClass('hidden');
                e=e.target;
                while (e.nodeName.toLowerCase()!='a'){
                    e=e.parentNode;
                }
                displayRecipe(e.getAttribute('data-number'));
            }
            document.getElementById('rating' + num).setAttribute('data-rating', 0);
        }
        for (var i = 0; i<5; i++){
            $('#rating' + i).rating({
                onRate: function(value){
                    id = $(this).get(0).id;
                    ratings[parseInt(id.charAt(id.length-1))] = value;
                    $(this).attr('data-rating', value);
                },
                initialRating: ratings[i]
            });
        }
    }
}

function getNewPopulation(){
    temp = [];
    sum = 0;
    max = 0;
    for (var i = 0; i<population.length; i++){
        if (ratings[i]>0){
            sum += ratings[i];
            max++;
        }
    }
    for (var i = 0; i<max; i++){
        index = Math.random()*sum;
        tot = ratings[0];
        for (var j = 0; j<population.length; j++){
            if (index < tot){
                temp.push(population[j]);
                break;
            }
            tot += ratings[j+1];
        }
    }
    keys = Object.keys(recipes);
    for (var i = 0; i<5-max; i++){
        index = -1;
        do {
            index = Math.floor(Math.random()*keys.length);
        } while (population.indexOf(keys[index])>-1);
        temp.push(recipes[keys[index]]);
    }
    for (var i = 0; i<5; i++){
        population[i] = getSimlarRecipeLinearAlgebra(recipes[population[i]]);
    }
}

function getSimlarRecipeLinearAlgebra(recipe){
    let index = getKeyByValue(recipes, recipe);
    query = getQueryArray(recipe);
    keys = Object.keys(recipes);
    candidates = [];
    for (let i = 0; i<keys.length; i++){
        if (keys[i] == index)
            continue;
        q = getQueryArray(recipes[keys[i]]);
        let numer = 0, denom1 = 0, denom2 = 0;
        for (let j = 0; j<q.length; j++){
            numer += q[j]*query[j];
            denom1 += query[j]*query[j];
            denom2 += q[j]*q[j];
        }
        let similarity = numer/(Math.sqrt(denom1)*Math.sqrt(denom2));
        if (similarity > .75)
            candidates.push(recipes[keys[i]]);
    }
    return getKeyByValue(recipes, candidates[Math.floor(Math.random()*candidates.length)]);
}

function getQueryArray(recipe){
    ret = Array.from(Array(categories.length), ()=>0);
    for (let i = 0; i<recipe.categories.length; i++){
        let index = getKeyByValue(categories, recipe.categories[i]);
        ret[index] = 1;
    }
    return ret;
}

function getSimilarRecipe(recipe){
    keys = Object.keys(recipes);
    candidates = [];
    for (var i = 0; i<keys.length; i++){
        if (Math.abs(recipe.categories.length - recipes[keys[i]].categories.length)<2){
            candidates.push(recipes[keys[i]]);
        }
    }
    categories = recipe.categories.slice();
    numcats = categories.length + Math.floor(Math.random()*2)-1
    if (numcats<1) numcats = 1;
    for (var i = 0; i<numcats; i++){
        index = Math.floor(Math.random()*categories.length);
        newcandidates = [];
        for (var i = 0; i<candidates.length; i++){
            if (candidates[i].categories.indexOf(categories[index])>-1 || i > categories.length){
                newcandidates.push(candidates[i]);
            }
        }
        candidates = newcandidates;
    }
    return getKeyByValue(recipes, candidates[Math.floor(Math.random()*candidates.length)]);
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function makePopulation(){
    keys = Object.keys(recipes);
    for (var i = 0; i<5; i++){
        index = -1;
        do {
            index = Math.floor(Math.random()*keys.length);
        } while (population.indexOf(keys[index])>-1);
        population.push(keys[index]);
    }
}

window.onbeforeunload = function(){
    dat = {
            'population': population,
            'ratings': ratings
    };
    jsonfile.writeFile('mldat.json', dat, function(err){
        console.log("Goodbye");
    });
}
