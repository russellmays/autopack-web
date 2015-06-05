var models = require("../models");

module.exports = function(app) {
    app.get("/", function(req, res) {
	models.RecipeModel.distinct("name", function(err, names) {
	    res.render("index", {"title": "Cellpack", "recNames": names});
	});
    });



    // RECIPE REST API
    // Implement http operations (post, get, etc.)

    app.post("/recipe", function(req, res) {
	// CLEAN UP THIS FUNCTION
	// ABSTRACT TO models/recipe.js
	var jsonRec = JSON.parse(req.body["recipe"]);
	var flattened = models.flattenRecipe(jsonRec);

	while (flattened.length > 0) {
	    for (var r = (flattened.length - 1); r >= 0; r--) {
		// id generated by client
		if (flattened[r]["tid"].length < 4) {
		    if (flattened[r]["children"].length < 1) {
			var baseRec = flattened.splice(r, 1)[0];
			var newRec = new models.RecipeModel(baseRec);
			newRec.save(function(err) {
			    if (err) {
				console.log(err);
			    }
			});
			for (var c = 0; c < flattened.length; c++) {
			    var pidIndex = flattened[c]["children"].indexOf(baseRec["tid"]);
			    if (pidIndex > -1)
				flattened[c]["children"][pidIndex] = newRec._id;
			}
		    } else {
			var childrenInDB = true;
			for (var k = 0; k < flattened[r]["children"]; k++) {
			    if (flattened[r]["children"][k].length < 4)
				childrenInDB = false;
			}
			if (childrenInDB) {
			    var baseRec = flattened.splice(r, 1)[0];
			    var newRec = new RecipeModel(baseRec);
			    newRec.save(function(err) {
				if (err) {
				    console.log(err);
				}
			    });
			    for (var w = 0; w < flattened.length; w++) {
				var pidIndex = flattened[w]["children"].indexOf(baseRec["tid"]);
				if (pidIndex > -1)
				    flattened[w]["children"][pidIndex] = newRec._id;
			    }
			}
		    }
		}
	    }
	}
	res.send("success");
    });

    app.get("/recipe/:recname/:recversion?", function(req, res) {
	models.RecipeModel.find({"name": req.param("recname")}, function(err, recipes) {
	    //console.log(recipes);
	    res.send(recipes);
	});
    });


    require("./create")(app);
}
