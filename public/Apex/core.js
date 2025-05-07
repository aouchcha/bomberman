import { renderApp } from '../main.js';
import { update, render } from './dom.js'
export const root = document.getElementById('app');
let currentVNode = null;
let states = [];
let currentIndex = 0

export function useState(initialValue) {
  const index = currentIndex;
  states[index] = states[index] !== undefined ? states[index] : initialValue !== undefined ? initialValue : null

  function setState(newValue) {
    if (typeof newValue === 'function') {
      states[index] = newValue(states[index])
    } else {
      states[index] = newValue
    }

    currentIndex = 0;
    mount(renderApp(), root)
  }
  currentIndex++;
  return [states[index], setState];
}

export function mount(newVNode, container) {

  currentIndex = 0
  const prevVNode = currentVNode;
  currentVNode = newVNode;
  if (container.firstChild) {

    currentVNode = update(prevVNode, currentVNode, container.firstChild);
  } else {
    container.appendChild(render(currentVNode));
  }
}

let effetcs = []
let effetcsIndex = []
export function useEffect(func, deps) {
  const oldDeps = effetcs[effetcsIndex]
  let hasChanged = true
  if (oldDeps) {
    hasChanged = deps.some((dep, i) => !Object.is(dep, oldDeps[i]))
  }
  if (hasChanged) {
    const final = (...args) => {

      func(...args)
    }
    final()
  }
  effetcs[effetcsIndex] = deps
  effetcsIndex++
}

mount(renderApp(), root);
