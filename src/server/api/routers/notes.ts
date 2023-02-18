import { z } from "zod";
import { todoInput } from "../../../types";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notesRouter = createTRPCRouter({
  createNote: protectedProcedure
    .input(todoInput)
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.create({
        data: {
          note: input,
          User: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  getNotesByUserId: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.prisma.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return todos.map(({ id, note, active }) => ({ id, note, active }));
  }),
  updateActiveByUserId: protectedProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: {
          active: !input.active,
        },
      });
    }),
  deleteNoteById: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.delete({
        where: {
          id: input,
        },
      });
    }),
});
