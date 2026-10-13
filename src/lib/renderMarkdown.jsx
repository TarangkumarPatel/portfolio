import React from 'react';

// Minimal, dependency-free Markdown renderer for Writings posts. Produces React elements
// directly (no innerHTML), so admin-authored content can't inject markup.
// Supports: # headings, paragraphs, - / 1. lists, > quotes, ``` code fences, ---, ![img](url),
// and inline **bold**, *italic*, `code`, [links](url).

const SAFE_URL = /^(https?:\/\/|mailto:|\/|#)/i;
const safeUrl = (url) => (SAFE_URL.test(url.trim()) ? url.trim() : '#');

const INLINE_PATTERN = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text, keyPrefix) {
  const nodes = [];
  let last = 0;
  let match;
  let i = 0;
  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (match[1]) {
      nodes.push(<code key={key} className="px-1.5 py-0.5 rounded bg-white/10 text-orange-300 font-mono text-[0.9em]">{token.slice(1, -1)}</code>);
    } else if (match[2]) {
      nodes.push(<strong key={key} className="text-white font-semibold">{renderInline(token.slice(2, -2), key)}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    } else if (match[4]) {
      const [, label, url] = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      nodes.push(
        <a key={key} href={safeUrl(url)} target="_blank" rel="noreferrer" className="text-orange-400 underline decoration-orange-400/40 underline-offset-4 hover:decoration-orange-400">
          {renderInline(label, key)}
        </a>
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdown(source = '') {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  const isBlockStart = (line) =>
    /^(#{1,4}\s|```|>\s?|[-*]\s|\d+\.\s|---\s*$|!\[)/.test(line);

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${blocks.length}`;

    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      i++;
      blocks.push(
        <div key={key} className="my-6 rounded-xl border border-white/10 bg-black/60 overflow-hidden">
          {lang && <div className="px-4 py-2 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-gray-500">{lang}</div>}
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-gray-200 font-mono"><code>{code.join('\n')}</code></pre>
        </div>
      );
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const cls = {
        1: 'font-display text-3xl md:text-4xl font-bold text-white mt-12 mb-5',
        2: 'font-display text-2xl md:text-3xl font-bold text-white mt-10 mb-4',
        3: 'font-display text-xl md:text-2xl font-semibold text-white mt-8 mb-3',
        4: 'font-display text-lg font-semibold text-white mt-6 mb-2',
      }[level];
      const Tag = `h${Math.min(level + 1, 6)}`;
      blocks.push(<Tag key={key} className={cls}>{renderInline(heading[2], key)}</Tag>);
      i++;
      continue;
    }

    if (/^---\s*$/.test(line)) {
      blocks.push(<hr key={key} className="my-10 border-white/10" />);
      i++;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
    if (image) {
      blocks.push(
        <figure key={key} className="my-8">
          <img src={safeUrl(image[2])} alt={image[1]} className="w-full rounded-xl border border-white/10" />
          {image[1] && <figcaption className="mt-2 text-center text-xs text-gray-500">{image[1]}</figcaption>}
        </figure>
      );
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(
        <blockquote key={key} className="my-6 border-l-2 border-orange-500 pl-5 text-gray-300 italic">
          {renderInline(quote.join(' '), key)}
        </blockquote>
      );
      continue;
    }

    if (/^([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const itemPattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
      const items = [];
      while (i < lines.length && itemPattern.test(lines[i])) items.push(lines[i++].replace(itemPattern, ''));
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={key} className={`my-5 pl-6 space-y-2 text-gray-300 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-orange-400`}>
          {items.map((item, j) => <li key={j} className="leading-relaxed">{renderInline(item, `${key}-${j}`)}</li>)}
        </ListTag>
      );
      continue;
    }

    const para = [lines[i++]];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={key} className="my-5 text-gray-300 leading-[1.85]">{renderInline(para.join(' '), key)}</p>);
  }

  return blocks;
}

export function readingTime(source = '') {
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
