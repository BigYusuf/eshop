"use client";

import React, { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const quillRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;
    }

    setTimeout(() => {
      document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
        if (index > 0) {
          toolbar.remove();
        }
      });
    }, 100);
  }, []);

  return (
    <div className="relative">
      {/* No duplicate Quill instance */}
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }], // font picker
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // headers
            [{ size: ["small", false, "large", "huge"] }], // font sizes
            ["bold", "italic", "underline", "strike"], // basic text styling
            [{ color: [] }, { background: [] }], //font and bg color
            [{ script: "sub" }, { script: "super" }], // subscript & superscript
            [{ list: "ordered" }, { list: "bullet" }], // list
            [{ indent: "-1" }, { indent: "+1" }], // indent
            [{ align: [] }], // text alignment
            ["blockquote", "code-block"],
            ["link", "image", "video"], // insert link, img, video
            ["clean"], // iremove formatting
          ],
        }}
        placeholder="Write a detailed product description here..."
        className="input-2"
        style={{ minHeight: "250px" }}
      />

      <style>
        {`
            .ql-toolbar {
              background: transparent;
              border-color: #444;
            }
            .ql-container {
              background: transparent !important;
              border-color: #444;
              color: white;
            }
            .ql-picker {
              color: 200px;
            }
            .ql-editor {
              min-height: white !important;
            }
            .ql-snow {
              border-color: #444 !important;
            }
            .ql-editor .ql-blank::before{
              color: #aaa !important;
              }
              .ql-picker-options {
                background: #333 !important;
                color: white !important;
              }
              .ql-picker-item {
                color: white !important;
              }
              .ql-stroke {
                stroke: white !important;
              }
            `}
      </style>
    </div>
  );
};

export default RichTextEditor;
