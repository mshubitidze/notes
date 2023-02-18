import { api } from "../utils/api";
import Todo from "./Todo";

const Todos = () => {
  const {
    data: todos,
    isLoading,
    isError,
  } = api.notes.getNotesByUserId.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;
  if (!todos.length) return <div>No Notes</div>;

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
