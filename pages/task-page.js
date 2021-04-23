import { useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getAllTasksData } from '../lib/tasks';
import Task from '../components/Task';
import useSWR from 'swr';
import StateContextProvider from '../context/StateContext';
import TaskForm from '../components/TaskForm';

// UseSWRのやつ,受け取ったデータを最終的にジェイソンのフォーマットに変更して返す
const fetcher = (url) => fetch(url).then((res) => res.json());
// APIのエンドポイント
const apiUrl = `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/list-task/`;

export default function TaskPage({ staticfilterdTasks }) {
  // useSWR(クライアントサイトからフェッチしたいエンドポイントのパス、ジェイソンデータを返す関数、ビルド時に取得したイニシャルデータ)
  // tasks=クライアントからフェッチされた最新のデータを格納する、mutateはデータのキャッシュを最新のものにしてくれる
  const { data: tasks, mutate } = useSWR(apiUrl, fetcher, {
    // ユーザーにまず表示される部分
    initialData: staticfilterdTasks,
  });
  // sortで新しい順に更新
  const filteredTasks = tasks?.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  // マウントされたら一回だけ実行
  useEffect(() => {
    mutate();
  }, []);
  return (
    <StateContextProvider>
      <Layout title="Task page">
        <TaskForm taskCreated={mutate} />
        <ul>
          {filteredTasks &&
            filteredTasks.map((task) => (
              <Task key={task.id} task={task} taskDeleted={mutate} />
            ))}
        </ul>
        <Link href="/main-page">
          <div className="flex cursor-pointer mt-12">
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            <span>Back to main page</span>
          </div>
        </Link>
      </Layout>
    </StateContextProvider>
  );
}
// ビルド時に呼ばれる
export async function getStaticProps() {
  const staticfilterdTasks = await getAllTasksData();

  return {
    props: { staticfilterdTasks },
    // ISRの実行でリアルタイムにデータを取得する
    revalidate: 3,
  };
}
