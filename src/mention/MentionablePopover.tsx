import clsx from 'clsx';
import { MentionableIcon } from 'src/components/form/richtext/mention/MentionableIcon';
import {
  Mentionable,
  MentionableByType,
  mentionMatches,
} from 'src/components/form/richtext/mention/mentionables';
import classes from './MentionablePopover.module.css';

export interface MentionablePopoverProps {
  mentionables: MentionableByType;
  selected?: Mentionable;
  busy?: boolean;
  onSelect(mentionable: Mentionable): void;
  className?: string;
}

function MentionableEntry({
  mentionable,
  selected,
  onSelect,
}: {
  mentionable: Mentionable;
  selected?: Mentionable;
  onSelect(mentionable: Mentionable): void;
}) {
  const isSelected = mentionMatches(mentionable, selected);
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      className={clsx({
        [classes.entry!]: true,
        [classes.selected!]: isSelected,
      })}
      onClick={ev => {
        ev.preventDefault();
        onSelect(mentionable);
      }}>
      <MentionableIcon mentionable={mentionable} />
      <span className={classes.title}>{mentionable.name}</span>
    </div>
  );
}

function MentionableCategory({
  heading,
  entries,
  selected,
  onSelect,
}: {
  heading: string;
  entries?: Mentionable[];
  selected?: Mentionable;
  onSelect(mentionable: Mentionable): void;
}) {
  if (!entries?.length) return null;
  return (
    <div className={classes.category}>
      <h3 className={classes.heading}>{heading}</h3>
      <div>
        {entries.map(entry => (
          <MentionableEntry
            mentionable={entry}
            selected={selected}
            key={entry.targetId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function MentionablePopover({
  mentionables,
  selected,
  busy,
  onSelect,
  className,
}: MentionablePopoverProps) {
  return (
    <div
      role="group"
      className={clsx(className, {
        [classes.container!]: true,
        [classes.busy!]: busy,
      })}>
      <MentionableCategory
        heading="Kapitel"
        entries={mentionables.chapters}
        onSelect={onSelect}
        selected={selected}
      />
      <MentionableCategory
        heading="Personen"
        entries={mentionables.people}
        onSelect={onSelect}
        selected={selected}
      />
      <MentionableCategory
        heading="Begriffe"
        entries={mentionables.terms}
        onSelect={onSelect}
        selected={selected}
      />
    </div>
  );
}
