import { BaseEditor, BaseRange, Descendant, Element, Range } from 'slate';
import { HistoryEditor } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { PluginElement } from './richtext-support';

export type SharedElementProperties = {
  align?: 'left' | 'center' | 'right' | 'justify';
};

export type BlockQuoteElement = {
  type: 'block-quote';
  align?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  align?: string;
  children: Descendant[];
};

export type NumberedListElement = {
  type: 'numbered-list';
  align?: string;
  children: Descendant[];
};

export type EditableVoidElement = {
  type: 'editable-void';
  children: EmptyText[];
};

export type HeadingElement = {
  type: 'heading';
  align?: string;
  children: Descendant[];
};

export type HeadingTwoElement = {
  type: 'heading-two';
  align?: string;
  children: Descendant[];
};

export type ImageElement = {
  type: 'image';
  url: string;
  children: EmptyText[];
};

export type ListItemElement = { type: 'list-item'; children: Descendant[] };

export type ParagraphElement = {
  type: 'paragraph';
  align?: string;
  children: Descendant[];
};

export type TitleElement = { type: 'title'; children: Descendant[] };

type CustomElement = SharedElementProperties &
  (
    | BlockQuoteElement
    | BulletedListElement
    | NumberedListElement
    | EditableVoidElement
    | HeadingElement
    | HeadingTwoElement
    | ImageElement
    | ListItemElement
    | ParagraphElement
    | TitleElement
    | PluginElement
  );

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  text: string;
};

export type EmptyText = {
  text: string;
};

export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor & {
    nodeToDecorations?: Map<Element, Range[]>;
  };

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText | EmptyText;
    Range: BaseRange & {
      [key: string]: unknown;
    };
  }
}
