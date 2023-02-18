import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notesRouter = createTRPCRouter({
  createNote: protectedProcedure
    .input(
      z.object({
        note: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.prisma.note.create({
        data: {
          note: input.note,
          userId: input.userId,
        },
      });
      return note;
    }),
  getNotesByUserId: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.note.findMany({
        where: {
          userId: input.userId,
        },
      });
    }),
  updateActiveByUserId: protectedProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.update({
      where: {
        id: input.id
      },
      data: {
        active: !input.active
      } 
    })
    }),
  deleteNoteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
