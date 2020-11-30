/* --------- Variables globales ------------- */

var decoupe    = document.getElementById("decoupe");
var grid_cont  = document.getElementById("grid-container");
var grid_cases = document.getElementsByClassName("case");

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
    
       

/* --------- Fonctions dde modification CSS --------- */

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
		if (this.h_depth == max_depth) {
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
		if (this.v_depth == max_depth) {
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

initial_points = [];
var root = new Zone(initial_points);
var children = root.split("vertical");

var selected_zone = null;

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
	var i = 0;
	selected_zone = null;
    }
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

/* -------- Script d'écoute ------------*/

actualise();

for (var i = 0; i < grid_cases.length; i++) {
    var k = grid_cases[i];
    k.addEventListener("click", function(){ at_click_case(this); });
    k.addEventListener("mouseover", function(){ at_mouseover_case(this); });
    k.addEventListener("mouseout", function(){ at_mouseout_case(this); });
}

// alert("No syntax error")
    

