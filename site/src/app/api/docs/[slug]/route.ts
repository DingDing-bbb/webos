import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

function mdToHtml(md: string): string {
  let html = md;

  // 标题
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 粗体
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 列表
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // 分割线
  html = html.replace(/^---$/gm, '<hr />');

  // 表格
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter((c) => c.trim());
    if (cells.some((c) => c.match(/^[\s-]+$/))) return '';
    const cellHtml = cells.map((c) => `<td>${c.trim()}</td>`).join('');
    return `<tr>${cellHtml}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table>$&</table>');

  // 段落
  html = html
    .split('\n\n')
    .map((block) => {
      if (block.match(/^<(h[1-6]|ul|ol|pre|table|hr)/)) return block;
      if (block.trim()) return `<p>${block}</p>`;
      return '';
    })
    .join('\n');

  return html;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const docFiles: Record<string, string> = {
    'ui-framework': 'UI-FRAMEWORK.md',
    'third-party-apps': 'THIRD-PARTY-APPS.md',
    'developer-plugin': 'developer-plugin.md',
  };

  const fileName = docFiles[slug];
  if (!fileName) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), '..', 'docs', fileName);
    const content = await readFile(filePath, 'utf-8');
    const html = mdToHtml(content);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
