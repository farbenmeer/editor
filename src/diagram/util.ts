import { Mentionable } from '../mention/mentionables';
import classes from './diagrams.module.css';

export function calculatePath(target: SVGElement) {
  const storedPath = target.getAttribute('data-path');
  if (storedPath) {
    return storedPath;
  }

  const segments = [];
  let cursor = target;
  let iterationCount = 0;
  while (cursor.tagName !== 'svg' && iterationCount < 10_000) {
    let nth = 0;
    const parent = cursor.parentNode as SVGElement;
    for (const child of parent.childNodes) {
      if (child === cursor) {
        segments.push(nth);
        break;
      }
      nth++;
    }
    cursor = parent;
    iterationCount++;
  }
  const path = segments.join('-');
  target.setAttribute('data-path', path);
  return path;
}

function wrap(wrapper: SVGElement, target: SVGElement) {
  const parent = target.parentNode;
  if (!parent) {
    return;
  }

  parent.insertBefore(wrapper, target);

  wrapper.appendChild(target);
}

export function getOrCreateWrappingAnchor(target: SVGElement) {
  const parent = target.parentNode;

  if (
    parent instanceof SVGAElement &&
    (parent.classList.contains(classes.link!) || parent.classList.contains(classes.linkable!))
  ) {
    return parent;
  }

  const anchor = document.createElementNS(svgNamespace, 'a');
  wrap(anchor, target);

  return anchor;
}

const svgNamespace = 'http://www.w3.org/2000/svg';

export function linkUrl(link: string | Mentionable) {
  if (typeof link === 'string') {
    return link;
  }

  switch (link.targetType) {
    case 'Chapter':
      return `/chapters/${link.targetId}`;
    case 'Person':
      return `/people#person-${link.targetId}`;
    case 'Term':
      return `/glossary#term-${link.targetId}`;
  }
}
