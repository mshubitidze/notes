import { useSession } from "next-auth/react";
import { useState } from "react";
import { type Todo, todoInput } from "../../types";
import { api } from "../../utils/api";
import { v4 as uuidv4 } from 'uuid';

const CreateTodo = () => {
  const [newTodo, setNewTodo] = useState("");
  const { data: sessionData } = useSession();

  const trpc = api.useContext();

  const { mutate } = api.notes.createNote.useMutation({
    onMutate: async (newTodo) => {
      if (!sessionData) return;

      await trpc.notes.getNotesByUserId.cancel();

      const previousTodos = trpc.notes.getNotesByUserId.getData();

      // Optimistically update to the new value
      trpc.notes.getNotesByUserId.setData(undefined, (prev) => {
        const optimisticTodo: Todo = {
          id: uuidv4(),
          note: newTodo,
          active: true,
          createdAt: new Date()
        };
        if (!prev) return [optimisticTodo];
        return [...prev, optimisticTodo];
      });

      // Clear input
      setNewTodo("");

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      if (!sessionData) return;
      console.error("An error occured when creating todo", err);
      // Clear input
      setNewTodo(newTodo);
      if (!context) return;
      trpc.notes.getNotesByUserId.setData(
        undefined,
        () => context.previousTodos
      );
    },
    onSettled: async () => {
      console.log("SETTLED");
      await trpc.notes.getNotesByUserId.invalidate();
    },
  });

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();

    const result = todoInput.safeParse(newTodo);
    if (!result.success) {
      console.error(result.error.format()._errors.join("\n"));
      return;
    }

    mutate(newTodo);
  }

  return (
    <form
      className="flex flex-col gap-4 justify-center items-center w-full text-lg md:flex-row md:text-xl"
      onSubmit={handleAddNote}
      autoComplete="off"
    >
      <fieldset className="flex flex-col gap-1 w-full text-white">
        <label htmlFor="note-input" className="text-lg md:text-2xl">
          Add Note
        </label>
        <input
          className="py-2 px-4 rounded-lg border outline-none md:py-4 md:px-8 border-white/10 bg-white/10 hover:border-white/20"
          value={newTodo}
          onChange={(e) => setNewTodo(e.currentTarget.value)}
          type="text"
          id="note-input"
        />
      </fieldset>

      <button
        disabled={!newTodo.length}
        type="submit"
        className="flex flex-row gap-2 justify-center items-center py-2 px-4 text-white rounded-lg border md:self-end md:py-4 md:px-8 disabled:border border-white/10 bg-white/10 hover:bg-white/20 disabled:border-white/10 disabled:bg-white/0"
      >
        Return
      </button>
    </form>
  );
};

export default CreateTodo;
