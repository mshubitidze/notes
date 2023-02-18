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
    return todos.map(({ id, note, active, createdAt }) => ({ id, note, active, createdAt }));
  }),
  updateActiveByUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        active: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, active } = input;
      return ctx.prisma.note.update({
        where: {
          id,
        },
        data: {
          active,
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
