"use client";
import { useState } from "react";
import { RichtextEditor, linkPlugin, mentionPlugin } from "../lib";

export default function DemoPage() {
  const [content, setContent] = useState<any>(null);
  const [readonly, setReadonly] = useState(false);

  return (
    <>
      <h1 style={{ fontSize: "3rem" }}>Richtext Editor Test Page</h1>
      <p style={{ fontSize: "2rem" }}>Type Below:</p>
      <p>
        <label>
          <input
            type="checkbox"
            onChange={(event) => setReadonly(event.target.checked)}
            style={{ marginRight: "0.25rem" }}
          />
          Readonly
        </label>
      </p>
      <main>
        <RichtextEditor
          style={{ border: "solid black 2px" }}
          onChange={setContent}
          plugins={[
            linkPlugin(),
            mentionPlugin({
              component: Mention,
              suggest,
            }),
          ]}
          readOnly={readonly}
        />

        <pre style={{ marginTop: "2rem" }}>
          {JSON.stringify(content, undefined, 2)}
        </pre>
      </main>
    </>
  );
}

type Mentionable = {
  title: string;
  href: string;
};

function Mention({ mentionable }: { mentionable: Mentionable }) {
  return (
    <a href={mentionable.href} style={{ color: "green" }}>
      Mentioned: {mentionable.title}
    </a>
  );
}

async function suggest() {
  return [
    {
      title: "letters",
      suggestions: [
        { title: "a", href: "a" },
        { title: "b", href: "b" },
      ],
    },
    {
      title: "numbers",
      suggestions: [
        { title: "1", href: "1" },
        { title: "2", href: "2" },
      ],
    },
  ];
}
