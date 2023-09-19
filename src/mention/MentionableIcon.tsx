import { MdOutlineArticle, MdOutlinePerson, MdOutlineTag } from 'react-icons/md';
import classes from 'src/components/form/richtext/mention/MentionableIcon.module.css';
import { Mentionable } from 'src/components/form/richtext/mention/mentionables';

export function MentionableIcon({ mentionable }: { mentionable: Mentionable }) {
  if (mentionable.iconUrl)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mentionable.iconUrl} className={classes.image} alt="" width={32} height={32} />
    );
  switch (mentionable.targetType) {
    case 'Person':
      return <MdOutlinePerson className={classes.icon} />;
    case 'Chapter':
      return <MdOutlineArticle className={classes.icon} />;
    case 'Term':
      return <MdOutlineTag className={classes.icon} />;
    default:
      return null;
  }
}
