import { type Todo } from "../types";
import { api } from "../utils/api";

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
    onError: (err, active, context) => {
      console.error(
        `An error occured when marking todo as ${active ? "done" : "undone"}`,
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
    <div className={"flex w-full items-center justify-between text-white"}>
      <div className="flex items-center w-full">
        <input
          className="hidden bg-gray-50 rounded border border-gray-300 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:ring-offset-gray-800 focus:ring-blue-300 peer dark:focus:ring-blue-600 focus:ring-3"
          type="checkbox"
          name="done"
          id={id}
          checked={active}
          onChange={(e) => {
            doneMutation({ id, active: e.target.checked });
          }}
        />
        <label
          htmlFor={id}
          className={`text-md flex h-full w-full cursor-pointer items-center justify-start gap-2 rounded-l-lg px-3 py-3 md:gap-6 md:py-6 md:text-xl ${
            !active ? "" : "line-through"
          } ${
            !active
              ? "bg-green-500/10 transition ease-in hover:bg-green-500/20"
              : "bg-stone-500/10 transition ease-in hover:bg-stone-500/20"
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-full border-2 ${
              !active ? "border-green-500" : "border-stone-500"
            } min-h-[1.8rem] min-w-[1.8rem] md:min-h-[2.5rem] md:min-w-[2.5rem]`}
          >
            <div
              className={`rounded-full ${
                !active ? "hidden bg-green-500" : "absolute bg-stone-500"
              } min-h-[1.3rem] min-w-[1.3rem] md:min-h-[2rem] md:min-w-[2rem]`}
            ></div>
          </div>
          {note}
        </label>
      </div>
      <button
        className="px-1.5 h-full text-white rounded-r-lg transition ease-in md:px-3 hover:bg-rose-700 bg-rose-500/70"
        onClick={() => {
          deleteMutation(id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="min-h-[1.8rem] min-w-[1.8rem] md:min-h-[2.5rem] md:min-w-[2.5rem]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default Todo;
