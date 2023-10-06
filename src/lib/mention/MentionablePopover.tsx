import clsx from "clsx";
import { Mentionable, SuggestionGroup } from "./mention-richtext-support";

export interface MentionablePopoverProps {
  mentionables: SuggestionGroup<Mentionable>[];
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
  selected?: boolean;
  onSelect(mentionable: Mentionable): void;
}) {
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
      role="option"
      aria-selected={selected}
      tabIndex={0}
      className={clsx({
        "fm-editor-mentionable-popover-entry": true,
        "fm-editor-mentionable-popover-selected": selected,
      })}
      onClick={(ev) => {
        ev.preventDefault();
        onSelect(mentionable);
      }}
    >
      <span className="fm-editor-mentionable-popover-title">
        {mentionable.title}
      </span>
    </div>
  );
}

function MentionableGroup({
  group,
  selected,
  onSelect,
}: {
  group: SuggestionGroup<Mentionable>;
  selected?: Mentionable;
  onSelect(mentionable: Mentionable): void;
}) {
  if (!group.suggestions.length) return null;
  return (
    <div className="fm-editor-mentionable-popover-group">
      <h3 className="fm-editor-mentionable-popover-heading">{group.title}</h3>
      <div>
        {group.suggestions.map((entry) => (
          <MentionableEntry
            mentionable={entry}
            selected={selected === entry}
            key={entry.title}
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
        "fm-editor-mentionable-popover": true,
        "fm-editor-mentionable-popover-busy": busy,
      })}
    >
      {mentionables.map((group) => (
        <MentionableGroup
          key={group.title}
          group={group}
          onSelect={onSelect}
          selected={selected}
        />
      ))}
    </div>
  );
}
