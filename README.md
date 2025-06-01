# bomberman-dom
A simple Bomberman game made with DOM.

## Features

- Classic Bomberman gameplay in the browser
- Built using the Apex JavaScript framework
- Responsive DOM-based rendering
- Keyboard controls for player movement and bomb placement

## Getting Started

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/aouchcha/bomberman.git
    cd bomberman
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

### Running the Game

Start the development server:
```bash
cd /server
node index.js
```
Then open your browser and navigate to `http://localhost:8080` (or the URL shown in your terminal).

## How to Play

- **Move:** Use the arrow keys (↑, ↓, ←, →) to move your character.
- **Place Bomb:** Press the spacebar to drop a bomb.
- **Catch Power-ups:** Collect power-ups to enhance your character's abilities (speed, bombs, etc.).
- **Goal:** Eliminate all enemies and avoid getting caught in explosions.

## Using `renderApp()` and DOM Structure

The game UI is rendered using the `renderApp()` function, which is responsible for updating the DOM based on the current game state. This function expects a root DOM element—typically a `<div id="app"></div>` in your `index.html` file—where the game will be mounted.

**Example `index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <!-- <link rel="stylesheet" href="./style.css" /> --> 
   <!-- this line if you have a CSS file -->
  <title>Bomberman DOM</title>
</head>
<body>
  <div id="app"></div>
  <script src="./Apex/core.js"></script>
</body>
</html>
```

**How `renderApp()` Works:**

- It takes the root element (e.g., `document.getElementById('app')`) and a virtual DOM object describing the UI.
- The virtual DOM object follows this structure:
    ```js
    {
      tag: 'div', // HTML tag name as a string
      attrs: { class: 'game-board' }, // Optional: attributes as an object
      children: [ /* Array of child elements or strings */ ]
    }
    ```
- `render()` recursively creates and updates real DOM nodes based on this object, ensuring efficient updates.

**Example usage:**
```js
const root = document.getElementById('app');
function renderApp(){
    return {
        tag: 'div',
        attrs: { class: 'game-container' },
        children: [
          { tag: 'h1', children: ['Bomberman'] },
          // ...more elements
        ]
    }
};
render(renderApp(), root);
```

## About Apex

This project is built with Apex, a lightweight JavaScript framework for building fast, modular web applications. Apex provides a simple API for managing state and rendering UI components using the DOM, making it easy to structure your application and keep the UI in sync with the game state.

## License

This project was made by [Aouchcha](https://github.com/aouchcha), [Iichi](https://github.com/ItCHIRO29),[Ikazbat](https://github.com/kazbatdriss1) and [Amazighi](https://github.com/Amazighii).