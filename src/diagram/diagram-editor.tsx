'use client';

import { useEffect, useMemo, useState } from 'react';
import { DiagramData } from './diagrams';
import classes from './diagrams.module.css';
import { EditableText, LinkEditDialog } from './link-edit-dialog';
import { calculatePath, getOrCreateWrappingAnchor, linkUrl } from './util';

interface Props {
  diagram: DiagramData;
  onChange(diagram: DiagramData | null): void;
}

export function DiagramEditor({ diagram, onChange }: Props) {
  const [activeElement, setActiveElement] = useState<EditableText | null>(null);
  const [root, setRoot] = useState<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!root) {
      return;
    }

    const abortController = new AbortController();

    for (const text of root.querySelectorAll('text')) {
      const path = calculatePath(text);
      const link = diagram.links[path];
      const anchor = getOrCreateWrappingAnchor(text);

      if (link) {
        anchor.href.baseVal = linkUrl(link);
        anchor.classList.remove(classes.linkable!);
        anchor.classList.add(classes.link!);
      } else {
        anchor.href.baseVal = '###';
        anchor.classList.remove(classes.link!);
        anchor.classList.add(classes.linkable!);
      }

      anchor.addEventListener(
        'click',
        event => {
          event.preventDefault();
          setActiveElement({
            path,
            label: text.textContent ?? '',
            link,
          });
        },
        { signal: abortController.signal },
      );
    }

    return () => {
      abortController.abort();
    };
  }, [root, diagram]);

  const diagramHtml = useMemo(() => ({ __html: diagram.svg }), [diagram.svg]);

  return (
    <div className="relative group">
      <figure
        className={classes.container}
        ref={figure => setRoot(figure?.querySelector('svg') ?? null)}
        dangerouslySetInnerHTML={diagramHtml}
      />
      <LinkEditDialog
        editableText={activeElement}
        onSave={link => {
          onChange({
            svg: diagram.svg,
            links: {
              ...diagram.links,
              [activeElement!.path]: link,
            },
          });
          setActiveElement(null);
        }}
        onRemove={() => {
          const links = { ...diagram.links };
          delete links[activeElement!.path];
          onChange({
            svg: diagram.svg,
            links,
          });
          setActiveElement(null);
        }}
        onCancel={() => {
          setActiveElement(null);
        }}
      />
    </div>
  );
}
