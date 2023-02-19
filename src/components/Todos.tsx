import { api } from "../utils/api";
import Todo from "./Todo";

const Todos = () => {
  const {
    data: todos,
    isLoading,
    isError,
  } = api.notes.getNotesByUserId.useQuery();

  if (isLoading) return <div className="text-white text-2xl">Loading...</div>;
  if (isError) return <div className="text-rose-500 text-2xl">Error</div>;
  if (!todos.length) return <div className="text-white text-2xl">No Notes</div>;

  return (
    <>
      {todos
        .sort((a, b) =>
          new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
        )
        .map((todo) => (
          <Todo key={todo.id} todo={todo} />
        ))}
    </>
  );
};

export default Todos;
