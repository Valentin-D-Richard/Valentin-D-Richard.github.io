/* --------- Variables globales ------------- */
var accueil    = document.getElementById("accueil");
var exercice   = document.getElementById("exercice");
var credits    = document.getElementById("credits");
var cdli       = document.getElementById("cdli");

var decoupe    = document.getElementById("decoupe");
var grid_cont  = document.getElementById("grid-container");
var grid_cases = document.getElementsByClassName("case");

var modal      = document.getElementById("congrat"); // congratulation box
var span       = document.getElementById("congrat-close");
var star_box   = document.getElementById("star-box"); // star score
var star_lines = document.getElementsByClassName("star-line"); // accueil star boxes

/* --------- Fonctions de base ------------ */

function chars_to_list(chars) {
    var l = [];
    for (var i = 0; i < chars.length; i++) {
	l.push(parseInt(chars[i],10));
    }
    return l;
}

function list_to_chars(l) {
    // returns the string x_1...x_n if l=[x_1,...,x_n] and x_i are ciphers
    var chars = "";
    for (var i = 0; i < l.length; i++) {
	chars = chars.concat(l[i].toString());
    }
    return chars;
}

function case_to_chars(k) {
    return k.className.substring(5,7);
}

function chars_to_case(chars) {
    return document.getElementsByClassName("case ".concat(chars))[0];
}

function limits(zone) {
    return [zone.xmin, zone.xmax, zone.ymin, zone.ymax];
}

// a case_char xy is a string of 2 ciphers representing its absciss and ordinate

function limits_to_case_chars(p) {
    /* returns a list of strings corresponding to case identifiers
       limits: list of 4 cifers: xmin, xmax, ymin, ymax
       NOTE: the x taken are such that xmin < x <= xmax, similar for y */
    var case_chars = [];
    for (var x = 1; x <= p[1]-p[0]; x++) {
	for (var y = 1; y <= p[3]-p[2]; y++) {
	    case_chars.push(list_to_chars([p[0]+x, p[2]+y]));
	}
    }
    return case_chars;
}
// test: alert(limits_to_case_chars([0, 3, 3, 4]));

function select_case_chars_of_zone_from_case(zone,k) {
    /* returns the list of [z, case_chars]
       of the zone z (a list of the argument "zone") where k is */
    var leaves = zone.leaves();
    var chars = case_to_chars(k);
    var found = [];
    leaves.forEach(function (z,i,a) {
	var case_chars = limits_to_case_chars(limits(z));
	if (case_chars.includes(chars)) {
	    found = [z, case_chars];
	}
    });
    return found;
    // the case the element is in no leave should never happen if zone = root
}
    
function fr(an) {
    var fr = "";
    if (an == "pig") {fr = "cochon"}
    else if (an == "cow") {fr = "vache"}
    else {fr = "mouton"}
    return fr;
}

/* --------- Fonctions de modification CSS --------- */

function remove_demarquage(element) {
    element.classList.remove("demarquage");
    element.classList.add("pad5");
}
function add_demarquage(element) {
    element.classList.remove("pad5");
    element.classList.add("demarquage");
}
function hide_cases() {
    for (var i = 0; i < grid_cases.length; i++) {
	var k = grid_cases[i];
	k.classList.remove("brownbackground");
    }
}
function actualise(except=null) {
    remove_demarquage(decoupe);
    remove_demarquage(grid_cont);
    if (except != "zone") {hide_cases();}
}
function display_case(k) {
    k.classList.add("brownbackground");
}
function show_case(k) {
    k.classList.add("bluebackground");
}
function unshow_case(k) {
    k.classList.remove("bluebackground");
}

function place_point(p) {
    var chars = list_to_chars([p.x,p.y]);
    var k = document.getElementsByClassName("case ".concat(chars))[0];
    var source = "src=\"".concat(p.label).concat(".png\" ");
    var alt = "alt=\"".concat(fr(p.label)).concat("\" ");
    var clas = "class=\"animal\">";
    k.innerHTML = "<img ".concat(source).concat(alt).concat(clas);
}

function update_nb_zones(n) {
    var nb_zones_text = document.getElementById("nb-zones");
    nb_zones_text.innerHTML = n.toString();
}

function erase_border(k) {
    k.classList.remove("border1-left"); k.classList.remove("border1-right");
    k.classList.remove("border1-top"); k.classList.remove("border1-bottom");
    k.classList.add("pad1-left"); k.classList.add("pad1-right");
    k.classList.add("pad1-top"); k.classList.add("pad1-bottom");
}

function draw_border(k, lims, x, y) {
    // draw the borders of case k depending whether k of coordinates (x,y)
    // (x absciss, y reversed ordinate) lies on the side(s)
    // of the zone (given by its limits lims = [xmin, xmax, ymin, ymax]) 
    // NOTE: the limits are such that xmin < x <= xmax and similar for y
    if (lims[0] + 1 == x) {
	k.classList.remove("pad1-left");
	k.classList.add("border1-left");
    }
    if (lims[1] == x) {
	k.classList.remove("pad1-right");
	k.classList.add("border1-right");
    }
    if (lims[2] + 1 == y) {
	k.classList.remove("pad1-top");
	k.classList.add("border1-top");
    }
    if (lims[3] == y) {
	k.classList.remove("pad1-bottom");
	k.classList.add("border1-bottom");
    }
}
    
function trace_borders(z) {
    // draws the borders (fences) of the leaf zones of z
    var leaves = z.leaves();
    leaves.forEach(function (z2,i,a) {
	var lims = limits(z2);
	var case_chars = limits_to_case_chars(lims);
	for (var j = 0; j < case_chars.length; j++) {
	    var k = chars_to_case(case_chars[j]);
	    var l = chars_to_list(case_chars[j]); // l = [x,y]
	    draw_border(k, lims, l[0], l[1]);
	}
    });
}

function go_to(cur_sect,to_sect) {
    /// hides the current section and display the given to_sec
    cur_sect.classList.remove("visible");
    cur_sect.classList.add("invisible");
    to_sect.classList.remove("invisible");
    to_sect.classList.add("visible");
}

function update_local_stars() {
    var starpic   = "<img src=\"star.jpeg\" alt=\"etoile\" class=\"star\">";
    var nostarpic = "<img src=\"no-star.jpeg\" alt=\"etoile\" class=\"star\">";
    var nb_stars  = LOCAL_STARS[0] + LOCAL_STARS[1] + LOCAL_STARS[2];
    var content = "";
    for (var i=0; i < nb_stars; i++) {
	content = content.concat(starpic);
    }
    for (var i=0; i < 3 - nb_stars; i++) {
	content = content.concat(nostarpic);
    }
    star_box.innerHTML = content;
}

function update_global_stars() {
    var starpic   = "<img src=\"star.jpeg\" alt=\"etoile\" class=\"lil-star\">";
    var nostarpic = "<img src=\"no-star.jpeg\" alt=\"etoile\" class=\"lil-star\">";
    for (var ex = 0; ex <3; ex++) {
	var nb_stars  = STARS[ex][0] + STARS[ex][1] + STARS[ex][2];
	var content = "";
	for (var i=0; i < nb_stars; i++) {
	    content = content.concat(starpic);
	}
	for (var i=0; i < 3 - nb_stars; i++) {
	    content = content.concat(nostarpic);
	}
	star_lines[ex].innerHTML = content;
    };
}

/* ------------- Module de gestion du problème ------------ */

/*
Les objets `Point` représentent les animaux et les objets `Zone` représentent  les enclos.
Pour initialiser le problème, il faut créer les animaux et un grand enclos (la zone 'racine').
Ensuite on peut découper horizontalement ou verticalement une zone avec la méthode `Zone.split`.
Et pour tester une solution, on parcours l'arbre et on teste pour chaque 'feuille' si les animaux présents dans la zone sont tous du même type.
Pour cela, il faut appeler la méthode `Zone.check` sur la zone racine.
Aussi, un découpage 'horizontal' corresponds à scinder l'axe X et 'vertical' corresponds à Y.
*/

let max_depth = 3;

var Point = function (x,y,label) {
    this.x = x;
    this.y = y;
    this.label = label; // 'cow', 'sheep' or 'pig'
}
Point.prototype._repr_ = function () {
    return "<" + this.label + " at (" + this.x + "," + this.y + ")>";
}

/*
var pig = new Point(2, 2, "pig");
alert(pig._repr_())
*/

var Zone = function (points, parents=null, limits=[0,9,0,9], h_depth=0, v_depth=0) {
    this.points   = points;
    this.parent   = parent; // Zone object
    this.children = []; // list of Zone objects
    this.split_direction = null // None or string in ["horizontal","vertical"]
    this.xmin     = limits[0]; this.xmax = limits[1];
    this.ymin     = limits[2]; this.ymax = limits[3];
    this.h_depth  = h_depth;
    this.v_depth  = v_depth;
} 
Zone.prototype.is_leaf = function () {
    // tells is the Zone is a leaf or a node
    return this.split_direction == null;
}
Zone.prototype.split = function (direction, n_slice=3) {
    if (!this.is_leaf()) {
	throw "Cannot split internal node";
    } else {
	for (var i = 0; i < n_slice; i++) {
	    if (direction == "horizontal") {
		if (this.h_depth + 1 == max_depth) {
		    throw "Cannot split more horizontally";
		} else {
		    var xmin = this.xmin + (this.xmax-this.xmin)*(i/n_slice);
		    var xmax = this.xmin + (this.xmax-this.xmin)*((i+1)/n_slice);
		    var points = [];
		    this.points.forEach(function(p,i,a) {
			if (p.x > xmin && p.x <= xmax) { 
			    points.push(p);
			}
		    });
		    var c = new Zone(points, this, [xmin, xmax, this.ymin, this.ymax], this.h_depth+1, this.v_depth);
		}
	    } else if (direction == "vertical") {
		if (this.v_depth + 1 == max_depth) {
		    throw "Cannot split more vertically";
		} else {
		    var ymin = this.ymin + (this.ymax-this.ymin)*(i/n_slice);
		    var ymax = this.ymin + (this.ymax-this.ymin)*((i+1)/n_slice);
		    var points = [];
		    this.points.forEach(function(p,i,a) {
			if (p.y > ymin && p.y <= ymax) { 
			    points.push(p);
			}
		    });
		    var c = new Zone(points, this, [this.xmin, this.xmax, ymin, ymax], this.h_depth, this.v_depth+1);
		}
	    } else {
		throw "Incorrect direction given";
	    };
	    this.children.push(c);
	};
	this.split_direction = direction;
	return this.children
    }
}
Zone.prototype.undo_split = function () {
    if (this.is_leaf()) {
	throw "Cannot unsplit leaf";
    } else {
	this.children = [];
	this.split_direction = null;
    }
}
Zone.prototype.leaves = function() {
    // returns the leaves of the zone
    if (this.is_leaf()) {
	return [this];
    } else {
	var l = [];
	this.children.forEach(function(c,i,a) {
	    l = l.concat(c.leaves());
	});
	return l;
    }
}
Zone.prototype.check = function () {
    // tests if the solution is valid
    if (this.is_leaf()) {
	var label = null;
	var check = true;
	this.points.forEach(function(p,i,a) {
	    if (label == null) {
		label = p.label;
	    } else if (label !== p.label) {
		check = false;
	    }
	});
	return check;
    } else {
	var check = true;
	this.children.forEach(function(c,i,a) {
	    check = check && c.check();
	});
	return check;
    };
}
Zone.prototype._repr_ = function () {
    if (this.is_leaf()) {
	var repr = "<LEAF|xlim:("+this.xmin+","+this.xmax+"), ylim:("+this.ymin+","+this.ymax+"), points:[";
	this.points.forEach(function(p,i,a) {
	    repr = repr + p._repr_() + ",";
	});
	if (this.points.length > 0) {
	    repr = repr.substring(0,repr.length-1);
	};
	return repr + "]>"
    } else {
	var repr = "<NODE|"+this.split_direction+":";
	this.children.forEach(function(c,i,a) {
	    repr = repr + c._repr_() + ",";
	});
	if (this.children.length > 0) {
	    repr = repr.substring(0,repr.length-1);
	};
	return repr + ">"
    }
}
/* Note : Zone commençant à i=1 et finissant à i=9 max, on donne les valeurs
limits = [xmin, xmax, ymin, ymax] telles que xmin < x <= xmax et ymin < y <= ymax
*/

//  Un petit exemple d'utilisation avec 4 animaux et une solution en 5 enclos :
/*
var points = [
    new Point(2, 2, "pig"),
    new Point(5, 2, "pig"),
    new Point(5, 5, "cow"),
    new Point(8, 5, "sheep")
];
var root = new Zone(points);
//alert(root.is_leaf());
//alert(root._repr_());
var children = root.split("vertical");
mid_area = children[1];
var _ = mid_area.split("horizontal");
//alert(root._repr_());
//alert(root.check());
alert(root.leaves()[0]._repr_());
alert(root.check());
mid_area.undo_split();
alert(root._repr_());
alert(root.check());
*/

/* ----------- Variables  globales du problème -------- */

var CURRENT_EX = 0; // default current exercice id

let MAX_NB_ZONES_LIST = [7, 13, 21];
let BEST_NB_ZONES_LIST = [5, 11, 17];

var MAX_NB_ZONES = MAX_NB_ZONES_LIST[0];
var BEST_NB_ZONES = BEST_NB_ZONES_LIST[0];

let point_list = [ [new Point(1,1,"sheep"), new Point(4,2,"pig"),
		    new Point(5,2,"cow"), new Point(6,3,"sheep"),
		    new Point(8,3,"pig"), new Point(3,6,"sheep"),
		    new Point(9,6,"pig"), new Point(4,8,"pig"),
		    new Point(5,1,"cow")],
		   [new Point(9,1,"sheep"), new Point(5,2,"pig"),
		    new Point(6,2,"cow"), new Point(1,3,"sheep"),
		    new Point(6,4,"sheep"), new Point(1,5,"cow"),
		    new Point(4,6,"pig"), new Point(4,7,"pig"),
		    new Point(5,7,"cow"), new Point(7,7,"sheep"),
		    new Point(1,9,"cow")],
		   [new Point(3,1,"sheep"), new Point(5,1,"sheep"),
		    new Point(7,1,"cow"), new Point(9,1,"pig"),
		    new Point(1,2,"cow"), new Point(7,2,"cow"),
		    new Point(4,3,"pig"), new Point(9,3,"pig"),
		    new Point(3,4,"pig"), new Point(6,4,"pig"),
		    new Point(1,5,"sheep"), new Point(1,7,"sheep"),
		    new Point(6,7,"pig"), new Point(7,7,"sheep"),
		    new Point(3,8,"pig"), new Point(9,8,"pig"),
		    new Point(1,9,"cow"), new Point(7,9,"cow")] ];

var initial_points = point_list[0];
		  
var root = new Zone(initial_points);

var selected_zone = null;
var nb_zones = 1;

//var start = Date.now();
let BEST_DURATIONS = [15, 16, 30]; // in seconds
// time is counted in the first exercice to read the wording
var BEST_DURATION = BEST_DURATIONS[0];

// Stars for every exercise, 1st star = success, 2nd = best nb of zones, 3rd = best time
var STARS = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
var LOCAL_STARS = [0, 0, 0];

/* ------------ Module d'interface et actions ------------ */

function buildFence() {
    var horizontal = document.getElementById("horizontal").checked;
    var vertical = document.getElementById("vertical").checked;

    if (selected_zone == null) { // No region selected
	alert("Sélectionne une région");
	actualise();
	add_demarquage(grid_cont);
    } else if (!(horizontal || vertical)) { // No slicing selected
	alert("Sélectionne un plan horizontal ou vertical");
	actualise("zone");
	add_demarquage(decoupe);
    } else{
	actualise();
	var direction = "vertical";
	if (horizontal) {direction = "horizontal"};
	try {
	    var children = selected_zone.split(direction);
	    nb_zones = nb_zones + 2;
	    update_nb_zones(nb_zones);
	    for (var i = 0; i < children.length; i++) {
		trace_borders(children[i]);
	    }
	    selected_zone = null;
	} catch (e) { // Potential splitting error
	    if (e == "Cannot split more horizontally") {
		alert("Impossible de construire des enclos plus fins");
	    } else if (e == "Cannot split more vertically") {
		alert("Impossible de construire des enclos plus fins");
	    }
	}
    }
}

function validate() {
    var duration = Math.floor((Date.now() - start) / 1000); // in seconds
    if (root.check()) {
	if (nb_zones <= MAX_NB_ZONES) { // Success
	    LOCAL_STARS[0] = 1;
	    LOCAL_STARS[1] = 1;
	    if (nb_zones > BEST_NB_ZONES) { // Not best number of zones
		var better = document.getElementById("better");
		better.innerHTML = "Essaie avec seulement ".concat(BEST_NB_ZONES.toString()).concat(" enclos.");
		LOCAL_STARS[1] = 0;
	    };
	    if (duration < BEST_DURATION) { // Really fast
		LOCAL_STARS[2] = 1;
	    };
	    update_local_stars();
	    modal.style.display = "block"; // congratulation block
	}
	else { // Failure: too many fields
	    alert("Tu dois construire ".concat(MAX_NB_ZONES.toString()).concat(" enclos ou moins.\nTu peux recommencer en appuyant sur \"réinitialiser\"."));
	}
    } else { // Failure: constraint not respected
	alert("Il y a un enclos avec 2 types d'animaux différents");
    }
    actualise();
}

function load_settings() {
    for (var i = 0; i < initial_points.length; i++) { // placing animals
    place_point(initial_points[i]);
    }
    var max_nb_zones = document.getElementById("max-nb-zones");
    max_nb_zones.innerHTML = MAX_NB_ZONES.toString(); // setting the max number of zones
}

function unload_settings() {
    for (var i = 1; i <= 9; i++) { // erases the images in the cases
	for (var j = 1; j <= 9; j++) {
	    var chars = list_to_chars([i,j]);
	    var k = document.getElementsByClassName("case ".concat(chars))[0];
	    k.innerHTML = "";
	}
    }
}

function reset() {
    actualise();
    root = new Zone(initial_points);
    selected_zone = null;
    for (var i = 0; i < grid_cases.length; i++) {
	erase_border(grid_cases[i]);
    }
    trace_borders(root);
    nb_zones = 1;
    update_nb_zones(nb_zones);
    var better = document.getElementById("better");
    better.innerHTML = "";
    start = Date.now(); // records the time taken to do the exercise
}

function load(ex) {
    /// loads the exercice ex (graphics and global problem variables)
    CURRENT_EX = ex;
    MAX_NB_ZONES = MAX_NB_ZONES_LIST[ex];
    BEST_NB_ZONES = BEST_NB_ZONES_LIST[ex];
    BEST_DURATION = BEST_DURATIONS[ex];
    LOCAL_STARS = [0,0,0];
    initial_points = point_list[ex];
    load_settings();
    reset();

    go_to(accueil,exercice);
}

function load_0() {
    load(0);
}
function load_1() {
    load(1);
}
function load_2() {
    load(2);
}

function unload() {
    for (var i = 0; i < 3; i++) {
	STARS[CURRENT_EX][i] = Math.max(LOCAL_STARS[i], STARS[CURRENT_EX][i]);
    }
    update_global_stars();
    unload_settings();

    go_to(exercice,accueil);
}

function at_mouseover_case(k) {
    var case_chars = select_case_chars_of_zone_from_case(root,k)[1];
    for (var i = 0; i < case_chars.length; i++) {
	var k2 = chars_to_case(case_chars[i]);
	show_case(k2);
    }
}
function at_mouseout_case(k) {
    var case_chars = select_case_chars_of_zone_from_case(root,k)[1];
    for (var i = 0; i < case_chars.length; i++) {
	var k2 = chars_to_case(case_chars[i]);
	unshow_case(k2);
    }
}


function at_click_case(k) {
    actualise();
    var tmp        = select_case_chars_of_zone_from_case(root,k);
    selected_zone  = tmp[0];
    var case_chars = tmp[1];
    for (var i = 0; i < case_chars.length; i++) {
	var k2 = chars_to_case(case_chars[i]);
	display_case(k2);
    }
    
}

function load_credits() {
    go_to(accueil,credits);
}
function unload_credits() {
    go_to(credits,accueil);
}

function load_cdli() {
    go_to(accueil,cdli);
}
function unload_cdli() {
    go_to(cdli,accueil);
}

/* -------- Script d'écoute ------------*/

actualise();
accueil.classList.add("visible");
exercice.classList.add("invisible");
credits.classList.add("invisible");
cdli.classList.add("invisible");

for (var i = 0; i < grid_cases.length; i++) { // events on cases
    var k = grid_cases[i];
    erase_border(k);
    k.addEventListener("click", function(){ at_click_case(this); });
    k.addEventListener("mouseover", function(){ at_mouseover_case(this); });
    k.addEventListener("mouseout", function(){ at_mouseout_case(this); });
};
	
span.onclick = function() { // close congratualtion box
    congrat.style.display = "none";
}

window.onclick = function(event) { // close congratualtion box
    if (event.target == congrat) {
	congrat.style.display = "none";
    }
}

trace_borders(root); // drawing the borders of the root zone
update_global_stars(); // displaying star scores
