# better-turtle

A TypeScript port of the famous Turtle JS project.

## 🐢 What is BetterTurtle ?

Turtle JS is a **graphic library** based on the [LOGO](<https://en.wikipedia.org/wiki/Logo_(programming_language)>) programming language aimed towards education.
It allows JavaScript beginners to handle programming in a very graphic way,
**every action is rendered visually**,
making it easy to understand the principles of programming.
BetterTurtle is an improved version of the many existing ones into TypeScript.

## 📥 Installation

### Option 1 - Install from NPM

```sh
npm install --save better-turtle
```

### Option 2 - Clone and build from source

```sh
# Clone the repo in your project directory
git clone https://github.com/Caesarovich/better-turtle

# Build the library
cd "better-turtle" && npm run build && cd ../

# Then install it to your project
npm install better-turtle
```

## ⌛ Quickstart

### In browser

```js
// Get an HTML Canvas element
const canvas = document.getElementById('my-canvas-element-id');
const ctx = canvas.getContext('2d');

// Instanciate a new Turtle
const tur = new turtlets.Turtle(ctx);

tur.goto(-350, 0).forward(60).left(50).forward(300);
```

### NodeJS

```js
import { createCanvas } from 'canvas';
import { Turtle } from 'better-turtle';

const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

const turtle = new Turtle(ctx);

turtle.forward(100).right(90).forward(50);
```

## 🔗 Exposing methods

Using the `.expose` method, it is possible to **expose a Turtle instance's methods onto a JavaScript Object**. It is particularly useful when using it with a **global object** such as the `window` object in browsers.

> **Note:** It is possible to remap the methods with the optionnal parameter. Further details in the docs 📔

```js
const turtle = new Turtle(ctx);

turtle.expose(window);

// ...

forward(50);
right(120);
setColor('red');
forward(150);
hide();
```
