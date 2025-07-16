# QuiltGraph

A JavaScript class for visually arranging and linking “passage” cards on a pannable & zoomable canvas modeled on the twine/twinery app. It's used specifically for creating "quilt" files, but is also compatible with "twee" files. Source code can be found in [/js/quilt-graph.js](../js/quilt-graph.js)

- [Setup](#setup)
- [CSS Requirements](#css-req)
- [Event API](#event-api)
- [Graph Methods](#methods)

## <span id="setup"><span>Setup

QuiltGraph depends on the [extwee](https://github.com/videlais/extwee) library for parsing historic and current Twine formats, as well as the [panzoom](https://github.com/anvaka/panzoom) library for panning/zooming around the graph.

```html
<!-- element that will contain the graph -->
<div id="work-area" style="width:100%;height:600px"></div>

<!-- load the libraries -->
<script src="path/to/panzoom.min.js"></script>
<script src="path/to/extwee.min.js"></script>
<script src="path/to/quilt-graph.js"></script>

<!-- then instantiate the graph in your JavaScript code -->
<script>

  const graph = new QuiltGraph('#work-area')

</script>
```

You can optionally create a few interface elements:
```html
<!-- some optional elements for user interface -->
<input id="zoomSlider" type="range">
<button id="btnNew">New</button>
<button id="btnDelete">Delete</button>
<button id="btnOpen">Open</button>
<button id="btnSave">Save</button>
```

And then instantiate the graph this way:
```js
const graph = new QuiltGraph({
  container: '#work-area',
  menu: {
    zoom: '#zoomSlider',
    new: '#btnNew',
    delete: '#btnDelete',
    open: '#btnOpen',
    save: '#btnSave'
  }
})
```

A few other optional parameters include:
```js
const graph = new QuiltGraph({
  container: '#work-area',
  menu: {
    zoom: '#zoomSlider',
    new: '#btnNew',
    delete: '#btnDelete',
    open: '#btnOpen',
    save: '#btnSave'
  },
  data: [ // Passages to include in the graph as soon as it loads
    { id: 1, name: 'Start', text: '[[Next]]', x: 50, y: 50 },
    { id: 2, name: 'Next', text: '', x: 200, y: 150 }
  ],
  cardSize: 97, // size of passage cards in pixels
  minCardSize: 8, // minimum zoomed card size
  maxCardSize: 97, // maximum zoomed card size
  stepSize: 25, // size of grid step (when moving a card) in pixels
  gridColor: 212, // color hue (in degrees) of the grid lines
  curveIntensity: 0.15, // intensity of the curve on connection arrows, 0-1
  connectionColor: '#666', // color of the connection arrows
})
```

The grid color could be set with just a hue value (degree on the color wheel) as seen above, or with an object for setting hue, saturation, lightness and alpha like this:
```js
const graph = new QuiltGraph({
  container: '#work-area',
  gridColor: {
    hue: 212,
    saturation: 90,
    lightness: 90,
    alpha: 1
  }
})
```

## <span id="css-req"><span>CSS Requirements

The systems requires that you create a few specific CSS classes to style your cards and their different states, below is how you might style them to resemble the style of cards in the twine editor.

```CSS
* { box-sizing: border-box; }

:root {
  --gray: hsl(0, 0%, 60%);
  --off-white: #fafafa;
  --light-gray: hsl(0, 0%, 85%);
  --blue: hsl(212, 90%, 60%);
  --light-blue: hsl(212, 90%, 90%);
  --shadow-small: 0 1px 1px var(--light-gray);
}

/* default style for a passage's card */
.quilt-card {
  position: absolute;
  z-index: 1;

  width: var(--card-size); /* defined in QuiltGraph */
  height: var(--card-size); /* defined in QuiltGraph */

  background: var(--off-white);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 5px;
  overflow: hidden;

  font-size: 0.7em;

  cursor: move;
  user-select: none;
}

.quilt-card p {
  color: var(--gray);
  margin: 0;
}

/* style when a card is selected */
.quilt-card.selected {
  background: var(--light-blue);
  box-shadow: var(--shadow-small),inset 0 0 0 1px var(--blue);
}

/* style for a new card that doesn't have any text content yet */
.quilt-card.temp-card {
  opacity: 0.5;
  border: 2px dashed var(--gray);
}

.quilt-card.temp-card::after {
  content: "double-click to edit it";
  position: absolute;
  left: 11px;
  top: 34px;
  font-style: italic;
}
```

## <span id="event-api"><span>Event API

There is an event API you can use to register listeners on specific events. Each callback receives a single passage object or, in the case of the  "open" event an object with `{ type, passages }`, where "type" is either "json" or "twee" (depending on the type of file that was opened) and "passages" is an array of all the passage objects in that file.

```js

graph.on('new', (passage) => {
  // do something with the newly created passage
})

graph.on('delete', (passage) => {
  // do something with the recently deleted passage
})

graph.on('selected', (passage) => {
  // do something with the selected passage
})

graph.on('unselected', (passage) => {
  // do something with the unselected passage
})

graph.on('dblclick', (passage) => {
  // do something with the double-clicked passage
  // perhaps display it's content in some sort of editor
})

graph.on('open', (file) => {
  // access to file.type and file.passages
})
```

## <span id="methods"><span>Methods API

### Zoom

- `setZoom(z)` Clamp & apply absolute zoom scale z, update slider.

- `zoomToSelected(scaleOverride)` Zoom around the first selected card, keeping it centered. Pass an optional target scale.


### Data Accessors

There are a few methods for accessing specific passages. Each of these returns the passage object `{ id, name, text, x, y, connections }` where the "connections" property is an array of id numbers for other passages this one connects to.

- `getPassageByName(name)` where "name" is the name of the passage you want to get

- `getPassageById(id)` where "id" is the id number of the passage you want to get

- `getPassageByCard(el)` where "el" is a reference to the HTML element of the card representing that passage

- `getSelectedPassages()` Because it's possible to select more than one passage at a time, this method always returns an array of currently selected passages.

### Parsing & Connections

`parsePassageLinks(passage)` This method can be used to parse the text of a passage and return an array of objects with "label" and "target" properties of each link in that passages text, where "label" is the content of the visible link and "target" is the name of the passage it links to.
```js
const p = GRID.getPassageById(1)
const links = GRID.parsePassageLinks(p)
// links is something like [ { label, target }, { label, target }, etc... ]
```

### CRUD Operations

There are a few CRUD (Create, read, update and delete) methods as well.

- `updatePassage(id, { name, text, x, y })` This updates the content of a passage, where the first argument is the id number of the passage you want to update and the second is an object with optional parameters of which properties in that passage you'd like to update. Note that there is no "connections" property here because that gets created dynamically based on the links in the "text" property

- `newPassage(name, text, x, y)` This creates and returns a fresh passage. All the arguments are optional. If no name is passed it is called "untitled" by default, text will be left blank and "reasonable" x,y positions are chosen such that it appears somewhere in the visible part of the graph.

    deletePassage(identifier)
    Remove by name or ID, re-render.

### Import / Export

- `save()` Exports current story to a .json file and downloads it

- `open()` Launches file picker (.json or .twee), then calls "loadJSON" or "loadTwee" internally

- `loadJSON(json)` Loads story from `{ passages: […] }` in a JSON file.

- `loadTwee(txt)` Loads story from Twee files (via Extwee)


### Validation & Utilities

There are also some utility functions for validating the data and making automatic corrections.

- `evaluate()` this method evaluates all the passges and returns the following "report" listing passages linking to missing targets, labels of those bad links, passages with empty text, and ones with placeholder names. This is returned in the form of an object:

```js
{
  deadendPassages: [], // array of passages which contain text linking to missing passages
  deadends: [], // array of passage names that don't exist (but others link to)
  empty: [], // array of passages that contain no text
  badNames: [] // array of passages with placeholder names like "untitled" or "Untitled Passage"
}
```

- `clearEmptyPassages()` Removes temporary cards with no text or links.

- `createMissingPassages(passage)` Automatically creates blank cards for any passsages containing links to passages that don't yet exist. You can pass an optionally parameter (a reference to an existing passage) if you only want to create new linked passages for a specific passage.
