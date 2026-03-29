"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Minus,
  Pilcrow,
  WrapText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

interface ToolbarButton {
  icon: React.ReactNode;
  mobileLabel?: string;
  label: string;
  action: () => void;
  separator?: false;
}

interface ToolbarSeparator {
  separator: true;
}

type ToolbarItem = ToolbarButton | ToolbarSeparator;

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content...",
  required = false,
  rows = 18,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: "" };
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      text: value.slice(textarea.selectionStart, textarea.selectionEnd),
    };
  }, [value]);

  const replaceSelection = useCallback(
    (before: string, after: string, defaultText = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { start, end, text } = getSelection();
      const selected = text || defaultText;
      const newValue =
        value.slice(0, start) + before + selected + after + value.slice(end);
      onChange(newValue);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + before.length + selected.length;
        textarea.setSelectionRange(
          start + before.length,
          cursorPos
        );
      });
    },
    [value, onChange, getSelection]
  );

  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { start, end } = getSelection();
      const newValue = value.slice(0, start) + text + value.slice(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + text.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange, getSelection]
  );

  const wrapLine = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { start } = getSelection();
      // Find the beginning of the current line
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", start);
      const actualEnd = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, actualEnd);

      // Toggle: if line already starts with prefix, remove it
      let newValue: string;
      if (line.startsWith(prefix)) {
        newValue = value.slice(0, lineStart) + line.slice(prefix.length) + value.slice(actualEnd);
      } else {
        newValue = value.slice(0, lineStart) + prefix + line + value.slice(actualEnd);
      }
      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
      });
    },
    [value, onChange, getSelection]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Only intercept Tab on desktop — mobile keyboards don't have Tab
      if (!isMobile && e.key === "Tab") {
        e.preventDefault();
        insertAtCursor("  ");
      }
    },
    [insertAtCursor, isMobile]
  );

  const iconClass = "h-5 w-5 sm:h-4 sm:w-4";

  const toolbarItems: ToolbarItem[] = [
    {
      icon: <Bold className={iconClass} />,
      label: "Bold",
      mobileLabel: "B",
      action: () => replaceSelection("<strong>", "</strong>", "bold text"),
    },
    {
      icon: <Italic className={iconClass} />,
      label: "Italic",
      mobileLabel: "I",
      action: () => replaceSelection("<em>", "</em>", "italic text"),
    },
    { separator: true },
    {
      icon: <Heading2 className={iconClass} />,
      label: "Heading 2",
      action: () => replaceSelection("<h2>", "</h2>", "Heading"),
    },
    {
      icon: <Heading3 className={iconClass} />,
      label: "Heading 3",
      action: () => replaceSelection("<h3>", "</h3>", "Subheading"),
    },
    {
      icon: <Pilcrow className={iconClass} />,
      label: "Paragraph",
      action: () => replaceSelection("<p>", "</p>", "Paragraph text"),
    },
    { separator: true },
    {
      icon: <List className={iconClass} />,
      label: "Bullet List",
      action: () =>
        insertAtCursor("\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n"),
    },
    {
      icon: <ListOrdered className={iconClass} />,
      label: "Numbered List",
      action: () =>
        insertAtCursor("\n<ol>\n  <li>First</li>\n  <li>Second</li>\n  <li>Third</li>\n</ol>\n"),
    },
    { separator: true },
    {
      icon: <Quote className={iconClass} />,
      label: "Blockquote",
      action: () => replaceSelection("<blockquote>", "</blockquote>", "Quote text"),
    },
    {
      icon: <Code className={iconClass} />,
      label: "Code Block",
      action: () => replaceSelection("<pre><code>", "</code></pre>", "code here"),
    },
    {
      icon: <Link2 className={iconClass} />,
      label: "Link",
      action: () => {
        const { text } = getSelection();
        const linkText = text || "link text";
        replaceSelection('<a href="', `">${linkText}</a>`, "https://example.com");
      },
    },
    { separator: true },
    {
      icon: <Minus className={iconClass} />,
      label: "Horizontal Rule",
      action: () => insertAtCursor("\n<hr />\n"),
    },
    {
      icon: <WrapText className={iconClass} />,
      label: "Line Break / Spacing",
      action: () => insertAtCursor("<br />\n"),
    },
  ];

  // On mobile, split toolbar into primary (first 5 buttons: B, I, H2, H3, P) and secondary
  const primaryCount = 6; // 5 buttons + 1 separator
  const primaryItems = isMobile ? toolbarItems.slice(0, primaryCount) : toolbarItems;
  const secondaryItems = isMobile ? toolbarItems.slice(primaryCount) : [];

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-gray-900">
      {/* Toolbar — sticky so it stays visible while scrolling long content */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1 sm:gap-0.5 px-2 py-2 sm:py-1.5">
          {primaryItems.map((item, i) => {
            if ("separator" in item && item.separator) {
              return (
                <div
                  key={`sep-${i}`}
                  className="mx-0.5 sm:mx-1 h-5 w-px bg-white/10 hidden sm:block"
                />
              );
            }
            const btn = item as ToolbarButton;
            return (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                title={btn.label}
                aria-label={btn.label}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded p-2.5 sm:p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20"
              >
                {btn.icon}
              </button>
            );
          })}

          {/* Mobile: expand/collapse toggle for secondary tools */}
          {isMobile && secondaryItems.length > 0 && (
            <button
              type="button"
              onClick={() => setToolbarExpanded(!toolbarExpanded)}
              aria-label={toolbarExpanded ? "Collapse toolbar" : "Expand toolbar"}
              className="ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-2.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20"
            >
              {toolbarExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Mobile: secondary toolbar row */}
        {isMobile && toolbarExpanded && secondaryItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-t border-white/10 px-2 py-2">
            {secondaryItems.map((item, i) => {
              if ("separator" in item && item.separator) {
                return null; // Hide separators in mobile secondary row
              }
              const btn = item as ToolbarButton;
              return (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.action}
                  title={btn.label}
                  aria-label={btn.label}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded p-2.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20"
                >
                  {btn.icon}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        required={required}
        rows={isMobile ? Math.min(rows, 12) : rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full resize-y border-0 bg-transparent px-3 sm:px-4 py-3 font-mono text-base sm:text-sm leading-relaxed text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-0"
        placeholder={placeholder}
        style={{ minHeight: isMobile ? "12rem" : `${rows * 1.5}rem` }}
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck
      />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 px-3 py-1.5 text-xs text-gray-500">
        <span className="hidden sm:inline">HTML supported · Tab for indent</span>
        <span className="sm:hidden">HTML supported</span>
        <span>{value.length} chars</span>
      </div>
    </div>
  );
}
