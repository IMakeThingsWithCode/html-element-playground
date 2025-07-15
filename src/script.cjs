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

function updateView(selectNewest = false) {
    let canvases = document.getElementsByClassName("canvas");
    let canvas;
    let localElements = playgroundElements;
    if (editing) {
        localElements = playgroundElements.map(e => {
            e.style.userSelect = 'none';
            e.style.cursor = 'grab';
            e.onmousedown = (event) => {
                window.onmousemove = dragElement;
                elementDragging = e;
                lastSelected = e;
                updatePropertyViewer();
                e.style.cursor = 'grabbing'
            };
            e.onmouseup = (event) => {
                window.onmousemove = null;
                elementDragging = null;
                e.style.cursor = 'grab'
            };
            return e;
        });
    } else {
        localElements = playgroundElements.map(e => {
            e.style.userSelect = '';
            e.style.cursor = '';
            if (e.tagName === "BUTTON") { e.style.cursor = 'pointer'; }
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
    selectNewest ? lastSelected = canvas.lastChild : null;
}

let elementDragging = null;
let lastSelected = null;
function dragElement(event) {
    function clamp(x, min, max) {
        if (x < min) { return min }
        if (x > max) { return max }
        return x;
    }

    const elementWidth = parseFloat(window.getComputedStyle(elementDragging).width);
    const elementHeight = parseFloat(window.getComputedStyle(elementDragging).height);

    const windowWidth = parseFloat(window.getComputedStyle(document.getElementsByClassName('playgroundEditModeSideBar')[0]).left);
    const windowHeight = parseFloat(window.getComputedStyle(document.getElementsByClassName('playgroundEditModeSideBar')[0]).height);

    elementDragging.style.left = clamp(event.clientX - (elementWidth / 2), 0, windowWidth - elementWidth) + 'px';
    elementDragging.style.top = clamp(event.clientY - (elementHeight / 2), 0, windowHeight - elementHeight) + 'px';
}

function updatePropertyViewer() {
    const propertyViewer = document.getElementById('playgroundPropertyEditor');
    propertyViewer.innerHTML = '';

    const propertiesToHighlight = [
        { key: 'innerHTML', label: 'Text', canBeNull: false },
        { key: 'style.color', label: 'Color', canBeNull: true },
        { key: 'style.fontSize', label: 'Font Size', canBeNull: true },
        { key: 'style.padding', label: 'Padding', canBeNull: true },
        { key: 'style.border', label: 'Border', canBeNull: true },
        { key: 'style.zIndex', label: 'Z-Index', canBeNull: true },
        { key: 'src', label: 'Source', canBeNull: true },
        { key: 'width', label: 'Width (px)', canBeNull: true },
        { key: 'style.rotate', label: 'Rotate', canBeNull: true }
        //    { key: 'attributes.onclick', label: 'On Click (JS)', canBeNull: true }
    ]

    propertiesToHighlight.forEach((p) => {
        const label = document.createElement('p');
        label.innerHTML = p.label;
        label.title = `element.${p.key}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = eval(`lastSelected.${p.key}`);
        input.oninput = (event) => {
            // I'm embarrassed  to push this :sob:
            (p.canBeNull || event.target.value != '') ? eval(`lastSelected.${p.key} = '${event.target.value.replaceAll('\\', "\\").replaceAll("'", "\\'")}'`) : null;
        }

        const container = document.createElement('div');
        container.appendChild(label)
        container.appendChild(input)
        propertyViewer.appendChild(container)
    })

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete Element<img class="playgroundIcon" src="./resources/icon-remove-element.png">';
    deleteButton.id = 'playgroundDeleteButton';
    deleteButton.onclick = () => {
        playgroundElements.splice(Array.prototype.slice.call(lastSelected.parentElement.children).indexOf(lastSelected), 1);
        updateView();
        lastSelected = null;
        document.getElementById('playgroundPropertyEditor').innerHTML = '';
    }
    const container = document.createElement('div');
    container.classList.add('center')
    container.appendChild(deleteButton);
    propertyViewer.appendChild(container)
}

function addElement(tag, attributes = {}, innerHTML = "", selectElement = false) {
    let e = document.createElement(tag);
    e.innerHTML = innerHTML;

    for (let attribute in attributes) {
        setPath(e, attribute, attributes[attribute]);
    }
    e.style.position = 'absolute';

    playgroundElements.push(e);
    updateView(selectElement);
    selectElement ? updatePropertyViewer() : null;
}

const addText = () => addElement('p', { 'style.margin': '0px' }, 'Demo Text', true);
const addButton = () => addElement('button', {}, 'Demo Button', true);
const addImage = () => addElement('img', { 'width': 300, 'draggable': 'false', 'src': 'null', 'ondragstart': () => { return false } }, 'Demo Image', true);
const addCustom = () => {
    const tag = window.prompt('Element tag name?');
    addElement(tag, {}, tag, true);
}


// stolen function
const setPath = (object, path, value) => path
    .split('.')
    .reduce((o, p, i) => o[p] = path.split('.').length === ++i ? value : o[p] || {}, object)