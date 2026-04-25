import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import 'highlight.js/styles/github-dark.css';
import DocsLayout from '../layout';

// 文档根目录
const DOCS_ROOT = path.join(process.cwd(), '../packages/os/packages/docs');

// 获取所有文档 slug（仍需用于静态参数生成）
export function generateStaticParams() {
  const files = fs.readdirSync(DOCS_ROOT).filter((f) => f.endsWith('.md'));
  return files.map((file) => ({ slug: file.replace(/\.md$/, '') }));
}

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const indexPath = path.join(DOCS_ROOT, 'index.json');
  if (!fs.existsSync(indexPath)) {
    return { title: 'WebOS Docs', description: 'WebOS Documentation' };
  }
  const indexRaw = fs.readFileSync(indexPath, 'utf-8');
  const index = JSON.parse(indexRaw) as Array<{ id: string; title: string; description: string }>;
  const entry = index.find((e) => e.id === slug);
  return {
    title: entry ? `${entry.title} - WebOS Docs` : 'WebOS Docs',
    description: entry?.description || 'WebOS Documentation',
  };
}

// 获取文档内容
function getDocContent(slug: string) {
  const filePath = path.join(DOCS_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// 获取文档索引
function getDocIndex() {
  const indexPath = path.join(DOCS_ROOT, 'index.json');
  if (!fs.existsSync(indexPath)) return [];
  const indexRaw = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(indexRaw) as Array<{
    id: string;
    title: string;
    description: string;
    order: number;
  }>;
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getDocContent(slug);
  const docIndex = getDocIndex();

  // 计算导航
  const currentIndex = docIndex.findIndex((e) => e.id === slug);
  const prevDoc = currentIndex > 0 ? docIndex[currentIndex - 1] : null;
  const nextDoc = currentIndex < docIndex.length - 1 ? docIndex[currentIndex + 1] : null;

  if (!content) {
    return (
      <DocsLayout>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <h2>文档不存在</h2>
          <p>找不到 {slug} 对应的文档。</p>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout>
      <div className="doc-content markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSlug]}>
          {content}
        </ReactMarkdown>
      </div>

      {/* 上下篇导航 */}
      {(prevDoc || nextDoc) && (
        <div className="article-nav">
          {prevDoc ? (
            <a href={`/docs/${prevDoc.id}`} className="nav-btn prev">
              <span className="label">← 上一篇</span>
              <span className="title">{prevDoc.title}</span>
            </a>
          ) : (
            <div />
          )}
          {nextDoc ? (
            <a href={`/docs/${nextDoc.id}`} className="nav-btn next">
              <span className="label">下一篇 →</span>
              <span className="title">{nextDoc.title}</span>
            </a>
          ) : (
            <div />
          )}
        </div>
      )}
    </DocsLayout>
  );
}
