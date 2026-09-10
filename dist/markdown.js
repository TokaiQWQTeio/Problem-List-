(function () {
  "use strict";

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function safeLink(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function renderInline(value) {
    const tokens = [];
    const store = (html) => {
      const token = `\u0000${tokens.length}\u0000`;
      tokens.push(html);
      return token;
    };

    let text = String(value ?? "")
      .replace(/`([^`\n]+)`/g, (_, code) => store(`<code>${escapeHtml(code)}</code>`))
      .replace(/\[([^\]]+)]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g, (_, label, href) => {
        const url = safeLink(href);
        return url
          ? store(`<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`)
          : escapeHtml(label);
      });

    text = escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

    return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
  }

  function tableCells(line) {
    return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  }

  function isTableDivider(line) {
    const cells = tableCells(line);
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown ?? "").replace(/\r\n?/g, "\n").split("\n");
    const html = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = line.match(/^\s*```([\w+-]*)\s*$/);
      if (fence) {
        const code = [];
        index += 1;
        while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
          code.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        const language = fence[1] ? ` data-language="${escapeHtml(fence[1])}"` : "";
        html.push(`<pre class="markdown-code"><code${language}>${escapeHtml(code.join("\n"))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        html.push("<hr>");
        index += 1;
        continue;
      }

      if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
        const headings = tableCells(line);
        index += 2;
        const rows = [];
        while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
          rows.push(tableCells(lines[index]));
          index += 1;
        }
        html.push(`<div class="markdown-table-wrap"><table><thead><tr>${headings.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
        continue;
      }

      const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (unordered || ordered) {
        const tag = ordered ? "ol" : "ul";
        const items = [];
        while (index < lines.length) {
          const match = tag === "ol"
            ? lines[index].match(/^\s*\d+[.)]\s+(.+)$/)
            : lines[index].match(/^\s*[-+*]\s+(.+)$/);
          if (!match) break;
          items.push(`<li>${renderInline(match[1])}</li>`);
          index += 1;
        }
        html.push(`<${tag}>${items.join("")}</${tag}>`);
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quote = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) {
          quote.push(lines[index].replace(/^\s*>\s?/, ""));
          index += 1;
        }
        html.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
        continue;
      }

      const paragraph = [line.trim()];
      index += 1;
      while (index < lines.length && lines[index].trim()
        && !/^\s*```/.test(lines[index])
        && !/^#{1,6}\s+/.test(lines[index])
        && !/^\s*(?:[-+*]\s+|\d+[.)]\s+|>)/.test(lines[index])
        && !(lines[index].includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1]))) {
        paragraph.push(lines[index].trim());
        index += 1;
      }
      html.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    }

    return html.join("\n");
  }

  globalThis.renderMarkdown = renderMarkdown;
})();
