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
    lastSelected = null;
    updatePropertyViewer();
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
    elementDragging.style.top = clamp(event.clientY - (elementHeight / 2), 0, windowHeight - elementHeight) - 2 + 'px';
}

let searchInput = "";
function updatePropertyViewer(selectSearchBox = false) {
    const propertyViewer = document.getElementById('playgroundPropertyEditor');
    propertyViewer.innerHTML = '';

    if (!lastSelected) { return null }

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('buttonWithIcon');
    deleteButton.innerHTML = '<img class="playgroundIcon" src="./resources/icon-remove-element.png"><p>Delete</p>';
    deleteButton.id = 'playgroundDeleteButton';
    deleteButton.onclick = () => {
        playgroundElements.splice(Array.prototype.slice.call(lastSelected.parentElement.children).indexOf(lastSelected), 1);
        updateView();
        lastSelected = null;
        document.getElementById('playgroundPropertyEditor').innerHTML = '';
    }
    propertyViewer.appendChild(deleteButton)

    const searchBox = document.createElement('input');
    searchBox.id = 'propertySearchBar';
    searchBox.type = 'text';
    searchBox.value = searchInput;
    searchBox.placeholder = 'Search';
    searchBox.title = 'Search properties. Can also be used to reset the property viewer: just input something';
    searchBox.oninput = (event) => {
        searchInput = event.target.value; updatePropertyViewer(true)
    }
    propertyViewer.appendChild(searchBox);
    selectSearchBox ? searchBox.focus() : null;

    const propertiesToHighlight = [
        { key: ['innerHTML'], label: 'Text' },
        { key: ['style', 'color'], label: 'Color' },
        { key: ['style', 'backgroundColor'], label: 'Background Color'},
        { key: ['style', 'fontSize'], label: 'Font Size' },
        { key: ['style', 'padding'], label: 'Padding' },
        { key: ['style', 'border'], label: 'Border' },
        { key: ['style', 'zIndex'], label: 'Z-Index' },
        { key: ['src'], label: 'Source' },
        { key: ['style', 'width'], label: 'Width' },
        { key: ['style', 'height'], label: 'Height' },
        { key: ['style', 'rotate'], label: 'Rotate' },
        { key: ['style', 'left'], label: 'X position'},
        { key: ['style', 'top'], label: 'Y position' },
    ]

    const propertiesColumn = document.createElement('div');
    propertiesColumn.id = 'propertyColumn';

    const createPropertyInput = (p) => {
        const propertyValue = getProperty(lastSelected, p.key);
        if (searchInput && 
            !(p.key.join('.').toLowerCase().includes(searchInput.toLowerCase()) 
            || p.label.toLowerCase().includes(searchInput.toLowerCase())
            || (
                propertyValue &&
                propertyValue.toString &&
                propertyValue.toString().toLowerCase().includes(searchInput.toLowerCase()
            )))
        ) {
            return false;
        }   

        const label = document.createElement('p');
        label.innerHTML = p.label;
        label.title = `element.${p.key.join('.')}`;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = propertyValue;
        input.key = p.key;
        input.oninput = (event) => {
            setProperty(lastSelected, event.target.key, event.target.value);
        }

        const container = document.createElement('div');
        container.appendChild(label)
        container.appendChild(input)
        propertiesColumn.appendChild(container)
    }

    const basicSectionLabel = document.createElement('em');
    basicSectionLabel.innerHTML = "Basic options";
    basicSectionLabel.title = "Options below are commonly used HTML properties of the element. Some are designed for specific elements and will not work on others. Functionality is not guaranteed (as with the rest of this site)";
    basicSectionLabel.style.cursor = "help";
    basicSectionLabel.style.fontSize = "small";
    basicSectionLabel.style.marginTop = '10px';
    basicSectionLabel.style.marginBottom = '5px';
    propertiesColumn.appendChild(basicSectionLabel);


    propertiesToHighlight.forEach((p) => createPropertyInput(p))

    const advancedSectionLabel = document.createElement('em');
    advancedSectionLabel.innerHTML = "Advanced options";
    advancedSectionLabel.title = "Options below are all HTML properties of the element. Functionality is not guaranteed (as with the rest of this site)";
    advancedSectionLabel.style.cursor = "help";
    advancedSectionLabel.style.fontSize = "small";
    advancedSectionLabel.style.marginTop = '10px';
    advancedSectionLabel.style.marginBottom = '5px';
    propertiesColumn.appendChild(advancedSectionLabel)

    listProperties(lastSelected).forEach(p => {
        createPropertyInput({ key: p, label: p.join('.') })
    });

    propertyViewer.appendChild(propertiesColumn);
}

function addElement(tag, attributes = {}, innerHTML = "", selectElement = false) {
    let e = document.createElement(tag);
    e.innerHTML = innerHTML;

    for (let attribute of attributes) {
        e = setProperty(e, attribute.key, attribute.value);
    }
    e.style.position = 'absolute';

    playgroundElements.push(e);
    updateView(selectElement);
    selectElement ? updatePropertyViewer() : null;
}

const addText = () => addElement('p', [
    { key: ['style', 'margin'], value: '0px' }
], 'Demo Text', true);
const addButton = () => addElement('button', [], 'Demo Button', true);
const addImage = () => addElement('img', [
    { key: ['width'], value: '300' },
    { key: ['draggable'], value: 'false' },
    { key: ['src'], value: 'null' },
    { key: ['ondragstart'], value: () => { return false } }
], 'Demo Image', true);
const addCustom = () => {
    const tag = window.prompt('Element tag name?');
    tag ? addElement(tag, [], tag, true) : null;
}

const setProperty = (obj, propertyKey, propertyValue, prefix = []) => {
    // Next directory to go into to follow key
    const nextDir = propertyKey.slice(0, -1)[prefix.length];
    // If directory doesn't exist (at the end), set property and return new object
    if (nextDir === undefined) {
        obj[propertyKey.slice(-1)[0]] = propertyValue;
        return obj;
    } else {
        // If next directory doesn't exist, create it
        typeof obj[nextDir] !== 'object' ? obj[nextDir] = {} : null;

        // New prefix
        const newPrefix = prefix.concat(nextDir);

        // Send "probe" to next directory to run again
        setProperty(obj[nextDir], propertyKey, propertyValue, newPrefix);

        return obj;
    }
}

const getProperty = (obj, propertyKey, prefix = []) => {
    const nextDir = propertyKey.slice(0, -1)[prefix.length];
    if (nextDir === undefined) {
        return obj[propertyKey.slice(-1)[0]];
    } else {
        const newPrefix = prefix.concat(nextDir);
        return getProperty(obj[nextDir], propertyKey, newPrefix);
    }
}

const listProperties = (obj, prefix = []) => {
    let list = [];
    for (let property in obj) {
        const currentPropertyKey = prefix.concat(property);
        if (typeof obj[property] === "object" &&
            obj[property] != undefined &&
            !(Array.isArray(obj[property])) &&
            obj[property].nodeType == undefined) {
            list = list.concat(listProperties(
                obj[property], currentPropertyKey
            ))
        } else {
            list.push(currentPropertyKey)
        }
    }
    list.length === 0 ? list = [prefix] : null;
    return list;
}