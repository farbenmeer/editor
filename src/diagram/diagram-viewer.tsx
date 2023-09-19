'use client';

import { useEffect, useMemo, useState } from 'react';
import classes from './diagrams.module.css';
import { DiagramData } from './diagrams';
import { calculatePath, getOrCreateWrappingAnchor, linkUrl } from './util';
import { useRouter } from 'next/navigation';

interface Props {
  diagram: DiagramData;
}

export function DiagramViewer({ diagram }: Props) {
  const [root, setRoot] = useState<SVGSVGElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!root) {
      return;
    }

    const abortController = new AbortController();

    for (const text of root.querySelectorAll('text')) {
      const path = calculatePath(text);
      const url = diagram.links[path];
      if (!url) {
        continue;
      }

      const anchor = getOrCreateWrappingAnchor(text);

      anchor.href.baseVal = linkUrl(url);
      anchor.classList.add(classes.link!);

      if (typeof url === 'object') {
        anchor.addEventListener(
          'click',
          event => {
            event.preventDefault();
            router.push(linkUrl(url));
          },
          { signal: abortController.signal },
        );
      } else {
        anchor.target.baseVal = '_blank';
      }
    }
  }, [diagram, root, router]);

  const diagramHtml = useMemo(() => ({ __html: diagram.svg }), [diagram.svg]);

  return (
    <figure
      className={classes.container}
      ref={figure => setRoot(figure?.querySelector('svg') ?? null)}
      dangerouslySetInnerHTML={diagramHtml}
    />
  );
}
