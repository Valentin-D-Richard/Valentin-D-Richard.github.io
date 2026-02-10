// Language selection based on the url
var url = document.URL.split("?");
if (url.lenght == 1) {
    filterSelection("en");
} else {
    if (url[1] == "fr") {
	filterSelection("fr");
	var current = document.getElementsByClassName("active");
	current[0].className = current[0].className.replace(" active", "");
	var btnFr = document.getElementsByClassName("btn fr")[0];
	btnFr.className += " active";
    } else {
	filterSelection("en");
    }
}

// Section selection based on the url
var url = document.URL.split("/");
var navContainer = document.getElementById("nav");
var current = navContainer.getElementsByClassName("active");
current[0].className = "";
if (url.length >= 5) { // url of the form valentin-d-richard/section-name/...
  var sec = document.getElementById(url[3]);
  sec.className = "active";
} else {
  var sec = document.getElementById("Home");
  sec.className = "active";
}



// Filter selection functions
function filterSelection(c) {
  var x, i;
  x = document.getElementsByClassName("lang");
  if (c == "all") c = "";
  for (i = 0; i < x.length; i++) {
    RemoveClass(x[i], "show");
    if (x[i].className.indexOf(c) > -1) AddClass(x[i], "show");
  }
}

function AddClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {element.className += " " + arr2[i];}
  }
}

function RemoveClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);     
    }
  }
  element.className = arr1.join(" ");
}

// Add active class to the current button (highlight it)
var btnContainer = document.getElementById("language");
var btns = btnContainer.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function(){
    var current = btnContainer.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

// Automatic loading of bibtex publication div in Home
// function load_publications(){
// 	("#publications").load("Publications/index.html"); 
// 	}
// load_publications()