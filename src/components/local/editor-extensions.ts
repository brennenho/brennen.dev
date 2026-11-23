import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

export const localEditorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: {
      autolink: true,
      defaultProtocol: "https",
      linkOnPaste: true,
      openOnClick: true,
    },
  }),
  Placeholder.configure({
    placeholder: "Start writing… try #, >, bold, or a list",
  }),
];
