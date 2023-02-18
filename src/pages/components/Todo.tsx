import { type Todo } from "../../types";
import { api } from "../../utils/api";

type TodoProps = {
  todo: Todo;
};
const Todo = ({ todo }: TodoProps) => {
  const { id, note, active } = todo;

  const trpc = api.useContext();

  const { mutate: doneMutation } = api.notes.updateActiveByUserId.useMutation({
    onMutate: async ({ id, active }) => {
      await trpc.notes.getNotesByUserId.cancel();

      const previousTodos = trpc.notes.getNotesByUserId.getData();

      trpc.notes.getNotesByUserId.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              active,
            };
          }
          return t;
        });
      });

      return { previousTodos };
    },
    onSuccess: (err, { active }) => {
      if (active) {
        console.log("Todo completed");
      }
    },
    onError: (err, done, context) => {
      console.error(
        `An error occured when marking todo as ${done ? "done" : "undone"}`,
        err
      );
      if (!context) return;
      trpc.notes.getNotesByUserId.setData(
        undefined,
        () => context.previousTodos
      );
    },
    onSettled: async () => {
      await trpc.notes.getNotesByUserId.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.notes.deleteNoteById.useMutation({
    onMutate: async (deleteId) => {
      await trpc.notes.getNotesByUserId.cancel();

      const previousTodos = trpc.notes.getNotesByUserId.getData();

      trpc.notes.getNotesByUserId.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.filter((t) => t.id !== deleteId);
      });

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      console.error(`An error occured when deleting todo`, err);
      if (!context) return;
      trpc.notes.getNotesByUserId.setData(
        undefined,
        () => context.previousTodos
      );
    },
    onSettled: async () => {
      await trpc.notes.getNotesByUserId.invalidate();
    },
  });

  return (
    <div className="flex gap-2 justify-between text-white items-center">
      <div className="flex gap-2 items-center">
        <input
          className="w-4 h-4 bg-gray-50 rounded border border-gray-300 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:ring-offset-gray-800 focus:ring-blue-300 dark:focus:ring-blue-600 focus:ring-3"
          type="checkbox"
          name="done"
          id={id}
          checked={!active}
          onChange={(e) => {
            doneMutation({ id, active: e.target.checked });
          }}
        />
        <label
          htmlFor={id}
          className={`cursor-pointer ${!active ? "line-through" : ""}`}
        >
          {note}
        </label>
      </div>
      <button
        className="py-1 px-2 w-full text-sm font-medium text-center text-white bg-blue-700 rounded-lg sm:w-auto dark:bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        onClick={() => {
          deleteMutation(id);
        }}
      >
        Delete
      </button>
    </div>
  );
};

export default Todo;
