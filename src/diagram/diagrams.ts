import { Mentionable } from '../mention/mentionables';

export interface DiagramData {
  svg: string;
  links: Record<string, string | Mentionable>;
}
