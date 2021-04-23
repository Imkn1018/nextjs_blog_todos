import { useContext } from "react";
import { StateContext } from "../context/StateContext";
import Cookie from "universal-cookie";
// クッキーのインスタンスを作成
const cookie = new Cookie();

export default function TaskForm({ taskCreated }) {
  const { selectedTask, setSelectedTask } = useContext(StateContext);
  // 新規作成
  const create = async (e) => {
    e.preventDefault();
    await fetch(`${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/`, {
      method: "POST",
      body: JSON.stringify({ title: selectedTask.title }),
      headers: {
        "Content-Type": "application/json",
        // 新規作成する場合にはクッキーからの認証が必要→アクセストークンを取得する
        Authorization: `JWT ${cookie.get("access_token")}`,
      },
    }).then((res) => {
      if (res.status === 401) {
        alert("JWT Token not valid");
      }
    });
    // 終了後の処理：stateの初期化
    setSelectedTask({ id: 0, title: "" });
    taskCreated();
  };
  const update = async (e) => {
    e.preventDefault();
    await fetch(
      `${process.env.NEXT_PUBLIC_RESTAPI_URL}api/tasks/${selectedTask.id}/`,
      {
        method: "PUT",
        body: JSON.stringify({ title: selectedTask.title }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${cookie.get("access_token")}`,
        },
      }
    ).then((res) => {
      if (res.status === 401) {
        alert("JWT Token not valid");
      }
    });
    setSelectedTask({ id: 0, title: "" });
    taskCreated();
  };
  return (
    <div>
      {/* 新規作成の場合と更新の場合とで場合分 */}
      <form onSubmit={selectedTask.id !== 0 ? update : create}>
        <input
          className="text-black mb-8 px-2 py-1"
          type="text"
          value={selectedTask.title}
          onChange={(e) =>
            setSelectedTask({ ...selectedTask, title: e.target.value })
          }
        />
        <button
          type="submit"
          className="bg-gray-500 ml-2 hover:bg-gray-600 text-sm px-2 py-1 rounded uppercase"
        >
          {selectedTask.id !== 0 ? "update" : "create"}
        </button>
      </form>
    </div>
  );
}