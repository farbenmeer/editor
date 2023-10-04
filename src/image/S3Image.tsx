import clsx from "clsx";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageMeta, generateImageMetadata } from "./meta";

export interface GetObjectUrl {
  (key: string): Promise<{ url: string }>;
}

export interface PutObjectUrl {
  (fileName: string, fileType: string): Promise<{ url: string; key: string }>;
}

export function S3Image({
  src,
  objectKey,
  placeholder,
  alt = "",
  className,
  editable = false,
  onChange,
  blurDataURL,
  getObjectUrl,
  putObjectUrl,
  ...nextImageProps
}: {
  src: string | null;
  objectKey: string | null;
  placeholder?: string;
  alt?: string;
  className?: string;
  editable?: boolean;
  onChange?(objectKey: string, meta: ImageMeta): void;
  sizes?: string;
  blurDataURL?: string;
  getObjectUrl: GetObjectUrl;
  putObjectUrl: PutObjectUrl;
} & ({ fill: true } | { width: number; height: number })) {
  const [url, setUrl] = useState(src ?? placeholder);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!objectKey) return;
    setBusy(true);
    getObjectUrl(objectKey).then((data) => {
      setUrl(data.url);
      setBusy(false);
    });
  }, [objectKey]);

  async function onFileChange(file?: File) {
    if (!file) return;
    setBusy(true);
    const signedUrl = await putObjectUrl(file.name, file.type);
    const [meta] = await Promise.all([
      generateImageMetadata(file),
      fetch(signedUrl.url, { method: "PUT", body: file }),
    ]);
    onChange?.(signedUrl.key, meta);
  }

  function openFileDialog() {
    ref.current!.click();
  }

  return (
    <div className={className}>
      {editable && (
        <input
          ref={ref}
          style={{ display: "none" }}
          type="file"
          datatype="image"
          onChange={(ev) =>
            onFileChange(ev.currentTarget.files?.item(0) ?? undefined)
          }
        />
      )}
      {(url ?? blurDataURL) && (
        <Image
          src={url ?? blurDataURL!}
          unoptimized={!url}
          alt={alt}
          blurDataURL={blurDataURL}
          className={clsx("object-cover bg-zinc-400", busy && "animate-pulse")}
          {...nextImageProps}
          placeholder={blurDataURL ? "blur" : "empty"}
        />
      )}
      {editable && (
        <button
          onClick={openFileDialog}
          className={clsx(
            "h-full w-full absolute flex items-center justify-center bg-zinc-900/25 top-0 transition text-slate-100 drop-shadow font-semibold",
            url && "opacity-0 hover:opacity-100"
          )}
          contentEditable={false}
        >
          <span>Bild Hochladen</span>
        </button>
      )}
    </div>
  );
}
