import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const notesRouter = createTRPCRouter({
  createNote: publicProcedure
    .input(
      z.object({
        note: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.prisma.note.create({
        data: {
          note: input.note,
        },
      });
      return note;
    }),
  getAllNotes: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany();
  }),
  updateActiveById: publicProcedure
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
  deleteNoteById: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.note.delete({
        where: {
          id: input.id,
        },
      });
    }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
