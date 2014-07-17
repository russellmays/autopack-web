var helpers = require('utils');

exports.index = function(recipeModel) {
    return function(req, res) {
        recipeModel.find(function (e, recipes) {
            var recNames = helpers.getDocNames(recipes);
            res.render('index', {'title': 'Cellpack', 'recNames': recNames});
        });
    };
};

exports.versioner = function(recipeModel) {
    return function(req, res) {
        recipeModel.find(function(e, recipes) {
            var possibleVersions = helpers.getStringVersions(recipes, req.body['recipename']);
            res.send(possibleVersions);
        });
    };
};

exports.modify = function(recipeModel) {
    return function(req, res) {
        recipeModel.find(function(e, recipes) {
            var recNames = helpers.getDocNames(recipes);
            res.render('modify', {'title': 'Modify Recipe', 'recNames': recNames});
        });
    };
};

exports.hierarchy = function(recipeModel) {
    return function(req, res) {
        recipeModel.find({}, function(e, recipes) {
            var reqID = req.body['recipename']+'-'+req.body['recipevers'].split('.').join('_');
            var identifierTree = helpers.getIdentifierTree(recipes, reqID);
            res.send(identifierTree);
        });
    };
};

exports.tabler = function(recipeModel) {
    return function(req, res) {
        var newID = req.body['recipename']+'-'+req.body['recipevers'].split('.').join('_');
        recipeModel.findOne({'recipeIdentifier': newID}, function(e, rec) {
            res.send(rec);
        });
    };
};

exports.commit = function(recipeModel) {
    return function(req, res) {
        
        var previousVers = req.body['newRecipe']['identifier'].split('-')[1].split('_');
        previousVers[2] = parseInt(previousVers[2]) - 1;
        var previousID = req.body['newRecipe']['identifier'].split('-')[0]+'-'+previousVers.join('_'); 

        recipeModel.find({}, function(e, recipes) {
            var newRecipes = [{'recipeIdentifier': req.body['newRecipe']['identifier'], 'recipeOptions': req.body['newRecipe']['options']}];
            newRecipes[0]['recipeChildren'] = helpers.getChildrenList(docs, previousID);
            var treeEdits = helpers.getDescendents(docs, req.body['topLevel'], previousID);
            var treeRecipes = helpers.buildTreeRecipes(docs, treeEdits);
            newRecipes = newRecipes.concat(treeRecipes);
            for (var i = 0; i < newRecipes.length; i++) {
                collection.insert(newRecipes[i]);
            }
        });
    };
};
