import fs from 'fs';
import path from 'path';
import Link from 'next/link';

const DOCS_ROOT = path.join(process.cwd(), '../packages/os/packages/docs');

interface DocIndexEntry {
  id: string;
  title: string;
  description: string;
  file: string;
  order: number;
}

function getSidebarItems(): DocIndexEntry[] {
  const indexPath = path.join(DOCS_ROOT, 'index.json');
  if (!fs.existsSync(indexPath)) {
    const files = fs.readdirSync(DOCS_ROOT).filter((f) => f.endsWith('.md'));
    return files.map((file, i) => ({
      id: file.replace(/\.md$/, ''),
      title: file.replace(/\.md$/, '').replace(/-/g, ' '),
      description: '',
      file,
      order: i,
    }));
  }
  return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const items = getSidebarItems();

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* 侧边栏 */}
      <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">文档</h2>
        <nav>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/docs/${item.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 返回首页 */}
        <div className="mt-8 border-t border-gray-800 pt-4">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            ← 返回首页
          </Link>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-3xl">{children}</div>
      </main>
    </div>
  );
}
