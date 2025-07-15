"use strict";

var playingEnvironment = document.getElementById('playingEnvironment');
var editingEnvironment = document.getElementById('editingEnvironment');

let editing = true;

let playgroundElements = [];

if (!playingEnvironment) {
    alert('Error loading page :(');
}
if (!editingEnvironment) {
    alert('Error loading page :(');
}
function edit() {
    playingEnvironment ? playingEnvironment.hidden = true : null;
    editingEnvironment ? editingEnvironment.hidden = false : null;
    editing = true;
    updateView();
}
function play() {
    playingEnvironment ? playingEnvironment.hidden = false : null;
    editingEnvironment ? editingEnvironment.hidden = true : null;
    editing = false;
    updateView();
}
edit();

function updateView() {
    let canvases = document.getElementsByClassName("canvas");
    let canvas;
    let localElements = playgroundElements;
    if (editing) {
        localElements = playgroundElements.map(e => {
            e.style.userSelect='none';
            e.style.cursor='grab';
            e.onmousedown = (event) => { window.onmousemove = dragElement; elementDragging = e; e.style.cursor = 'grabbing'  };
            e.onmouseup = (event) => { window.onmousemove = null; elementDragging = null; e.style.cursor = 'grab' };
            return e;
        });
    } else {
        localElements = playgroundElements.map(e => {
            e.style.userSelect = '';
            e.style.cursor = '';
            e.onmousedown = null;
            e.onmouseup = null;
            return e;
        });
    }

    editing ? canvas = canvases[0] : canvas = canvases[1];

    canvas.innerHTML = "";
    localElements.forEach((element, index) => {
        canvas.appendChild(element);
    });

}

let elementDragging = null;
function dragElement(event) {
    function clamp(x, min, max) {
        if(x<min) { return min}
        if(x>max) { return max}
        return x;
    }

    elementDragging.style.left = clamp(event.clientX - 20, 0, 
        parseFloat(window.getComputedStyle(document.getElementsByClassName('playgroundEditModeSideBar')[0]).left) - 
        parseFloat(window.getComputedStyle(elementDragging).width)) + 'px';
    elementDragging.style.top = clamp(event.clientY, 0, 
        parseFloat(window.getComputedStyle(document.getElementsByClassName('playgroundEditModeSideBar')[0]).height) -
        parseFloat(window.getComputedStyle(elementDragging).height))-20 + 'px';
}

function addText() {
    let text = document.createElement('p');
    text.innerText = "Demo Text";
    text.style.position = "absolute";
    playgroundElements.push(text);
    updateView();
}
function addImage() {

}
function addButton() {
    let button = document.createElement('button');
    button.innerText = "Demo Button";
    button.style.position = "absolute";
    playgroundElements.push(button);
    updateView();
}