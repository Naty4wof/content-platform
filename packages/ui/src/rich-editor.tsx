import React, { useRef, useState } from "react";
import { Button } from "./button";
import { uploadImage } from "../../api/media";

export interface RichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function RichEditor({
  value = "",
  onChange,
  placeholder,
}: RichEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [uploading, setUploading] = useState(false);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    notifyChange();
  }

  function notifyChange() {
    if (!ref.current) return;
    onChange?.(ref.current.innerHTML);
  }

  async function handleInsertImage(file: File) {
    setUploading(true);
    try {
      const reader = new FileReader();
      const data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // data is like data:image/png;base64,....
      const parts = data.split(",");
      const b64 = parts[1];
      if (!b64) {
        throw new Error("Unable to read image data");
      }
      const res = await uploadImage(b64, file.name);
      const url = res.url;
      exec("insertImage", url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rich-editor">
      <div className="mb-2 flex gap-2">
        <Button size="sm" variant="ghost" onClick={() => exec("bold")}>
          Bold
        </Button>
        <Button size="sm" variant="ghost" onClick={() => exec("italic")}>
          Italic
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => document.getElementById("_re_file")?.click()}
        >
          {uploading ? "Uploading…" : "Insert image"}
        </Button>
        <input
          id="_re_file"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleInsertImage(f);
          }}
        />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={notifyChange}
        className="min-h-[120px] rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800"
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

export default RichEditor;
