"use strict";

var playingEnvironment = document.getElementById('playing');
var editingEnvironment = document.getElementById('editing');

if (!playingEnvironment) {
    alert('Error loading page :(');
}
if (!editingEnvironment) {
    alert('Error loading page :(');
}
function edit() {
    playingEnvironment ? playingEnvironment.hidden = true : null;
    editingEnvironment ? editingEnvironment.hidden = false : null;
}
function play() {
    playingEnvironment ? playingEnvironment.hidden = false : null;
    editingEnvironment ? editingEnvironment.hidden = true : null;
}
edit();
