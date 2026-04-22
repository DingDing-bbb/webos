import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import 'highlight.js/styles/github-dark.css';

// 文档根目录
const DOCS_ROOT = path.join(process.cwd(), '../packages/os/packages/docs');

// 获取所有文档 slug
export async function generateStaticParams() {
  const files = fs.readdirSync(DOCS_ROOT).filter((f) => f.endsWith('.md'));
  return files.map((file) => ({ slug: file.replace(/\.md$/, '') }));
}

// 获取文档内容
function getDocContent(slug: string) {
  const filePath = path.join(DOCS_ROOT, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// 生成元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const indexRaw = fs.readFileSync(path.join(DOCS_ROOT, 'index.json'), 'utf-8');
  const index = JSON.parse(indexRaw) as Array<{ id: string; title: string; description: string }>;
  const entry = index.find((e) => e.id === slug);
  return {
    title: entry ? `${entry.title} - WebOS Docs` : 'WebOS Docs',
    description: entry?.description || 'WebOS Documentation',
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = getDocContent(slug);
  if (!content) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h1 className="text-2xl font-bold mb-2">文档不存在</h1>
        <p>找不到 {slug} 对应的文档。</p>
      </div>
    );
  }

  return (
    <article
      className="prose prose-invert prose-blue max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-p:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
      prose-code:text-pink-400 prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg
      prose-strong:text-white prose-li:text-gray-300
      prose-table:border-collapse prose-th:bg-gray-800 prose-th:text-white prose-th:p-2 prose-th:border prose-th:border-gray-700
      prose-td:p-2 prose-td:border prose-td:border-gray-700
      prose-blockquote:border-l-blue-500 prose-blockquote:text-gray-400"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
