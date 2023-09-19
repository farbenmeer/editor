'use client';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { popoverPreviewData } from 'src/app/[locale]/actions';
import { RichtextEditor } from 'src/components/form/richtext/RichtextEditor';
import { Mentionable } from 'src/components/form/richtext/mention/mentionables';
import classes from './MentionPopover.module.css';

export interface MentionPopoverProps {
  mention: Mentionable;
}

export function MentionPopover({ mention }: MentionPopoverProps) {
  const [busy, setBusy] = useState(false);
  const { targetType } = mention;
  const [data, setData] = useState<Mentionable | null>(null);

  useEffect(() => {
    const { targetType, targetId } = mention;
    setBusy(true);
    popoverPreviewData(targetId, targetType)
      .then(data => setData(data ?? null))
      .finally(() => setBusy(false));
  }, [mention]);

  if (!data) return null;

  return (
    <div
      id="mention-popover"
      className={clsx({
        [classes.busy!]: busy,
        [classes.popover!]: true,
        [(classes as any)[targetType.toLowerCase()]]: true,
      })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {data.iconUrl && <img src={data.iconUrl} alt="" className={classes.image} />}
      <div className={classes.textContent}>
        <strong className={classes.heading}>{data.name}</strong>
        <RichtextEditor readOnly value={[data.desc ?? { text: '' }]} noPad />
      </div>
    </div>
  );
}
