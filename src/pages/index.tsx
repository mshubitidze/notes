import { type Note } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect } from "react";

import { useSession } from "next-auth/react";

import { api } from "../utils/api";
import Auth from "./components/Auth";
import Footer from "./components/Footer";

const Home: NextPage = () => {
  const createNoteMutation = api.notes.createNote.useMutation();
  const deleteNoteMutation = api.notes.deleteNoteById.useMutation();
  const updateActiveNoteMutation = api.notes.updateActiveById.useMutation();
  const [note, setNote] = useState<string>("");
  const [fetchedUserNotes, setFetchedUserNotes] = useState<Note[] | undefined>(
    []
  );

  const { data: sessionData } = useSession();

  // const notes = api.notes.getAllNotes.useQuery();

  const userNotes = api.notes.getNotesByUserId.useQuery(
    {
      userId: sessionData?.user.id || "",
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: sessionData?.user !== undefined,
    }
  );

  useEffect(() => {
    const sortedUserNotes = userNotes.data?.sort((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
    );
    setFetchedUserNotes(sortedUserNotes);
  }, [userNotes.data]);

  async function handleAddNewNote(e: React.FormEvent) {
    e.preventDefault();
    if (!fetchedUserNotes) return;
    setNote("");
    setFetchedUserNotes([
      {
        id: "tempNoteId",
        note: note,
        active: true,
        createdAt: new Date(),
        userId: "",
      },
      ...fetchedUserNotes,
    ]);
    const newNote = await createNoteMutation.mutateAsync({
      note,
      userId: sessionData?.user.id || "",
    });
    setFetchedUserNotes([newNote, ...fetchedUserNotes]);
    // await userNotes.refetch();
  }

  async function handleNoteDelete(id: string) {
    if (!fetchedUserNotes) return;
    setFetchedUserNotes(fetchedUserNotes.filter((note) => note.id !== id));
    await deleteNoteMutation.mutateAsync({
      id,
    });
    // await userNotes.refetch();
  }

  async function handleNoteToggleActive(id: string, active: boolean) {
    if (!fetchedUserNotes) return;
    setFetchedUserNotes(
      fetchedUserNotes.map((note) => {
        if (note.id === id) {
          note.active = !note.active;
        }
        return note;
      })
    );
    await updateActiveNoteMutation.mutateAsync({
      id,
      active,
    });
    // await userNotes.refetch();
  }

  return (
    <>
      <Head>
        <title>Todo App - Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col gap-10 justify-between items-center w-full min-h-screen">
        <Auth />
        {sessionData?.user.name && (
          <div className="flex flex-col gap-10 justify-center items-center w-full">
            <form
              className="flex flex-col gap-4 justify-center items-center w-3/4 text-lg md:flex-row md:text-xl"
              onSubmit={handleAddNewNote}
              autoComplete="off"
            >
              <fieldset className="flex flex-col gap-1 w-full text-white">
                <label htmlFor="note-input" className="text-lg md:text-2xl">
                  Add Note
                </label>
                <input
                  className="py-2 px-4 rounded-lg border outline-none md:py-4 md:px-8 border-white/10 bg-white/10 hover:border-white/20"
                  value={note}
                  onChange={(e) => setNote(e.currentTarget.value)}
                  type="text"
                  id="note-input"
                />
              </fieldset>

              <button
                disabled={!note}
                type="submit"
                className="flex flex-row gap-2 justify-center items-center py-2 px-4 text-white rounded-lg border md:self-end md:py-4 md:px-8 disabled:border border-white/10 bg-white/10 hover:bg-white/20 disabled:border-white/10 disabled:bg-white/0"
              >
                Return
              </button>
            </form>

            <div className="flex flex-col gap-4 w-3/4 rounded-lg select-none">
              <h1 className="text-lg text-white md:text-2xl">Notes</h1>
              <div className="flex flex-col text-white">
                {fetchedUserNotes?.length ? (
                  fetchedUserNotes?.map((note) => (
                    <div
                      className="flex flex-row gap-2 justify-between items-center border border-transparent border-b-slate-500/50 first:border-t-slate-500/50"
                      key={note.id}
                    >
                      <div
                        onClick={() =>
                          handleNoteToggleActive(note.id, note.active)
                        }
                        className="flex flex-row gap-4 items-center self-start p-4 w-full cursor-pointer"
                      >
                        {note.active ? (
                          <>
                            <div className="rounded-full border border-green-500 min-h-[2.5rem] min-w-[2.5rem]"></div>
                            <p className="text-xl">{note.note}</p>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-center items-center rounded-full border min-h-[2.5rem] min-w-[2.5rem] border-slate-500">
                              <div className="rounded-full min-h-[2rem] min-w-[2rem] bg-slate-500"></div>
                            </div>
                            <p className="text-xl line-through text-slate-500">
                              {note.note}
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleNoteDelete(note.id)}
                        type="button"
                        className="mr-2 text-pink-500 rounded-lg min-h-[2rem] min-w-[2rem] hover:bg-white/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-8 h-8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : userNotes.status === "loading" ? (
                  <div>Loading...</div>
                ) : (
                  <div>No Notes</div>
                )}
              </div>
            </div>
          </div>
        )}
        <Footer />
      </main>
    </>
  );
};

export default Home;
