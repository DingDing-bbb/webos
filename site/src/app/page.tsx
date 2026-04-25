import { redirect } from 'next/navigation';

// 根路由服务端重定向到 /intro
export default function Home() {
  redirect('/intro');
}
