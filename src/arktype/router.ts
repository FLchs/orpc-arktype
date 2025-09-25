import { os } from "@orpc/server";
import { type } from "arktype";

const PlanetSchema = type({
  id: "number > 0",
  name: "string",
  description: "string?",
});

export const listPlanet = os
  .route({ method: "GET", path: "/planets" })
  .input(type({ limit: "0 < number < 100", cursor: "number >= 0 = 0" }))
  .output(type([PlanetSchema]))
  .handler(async ({ input }) => {
    // your list code here
    return [{ id: 1, name: "name" }];
  });

export const findPlanet = os
  .route({ method: "GET", path: "/planets/{id}" })
  .input(type({ id: "string.numeric.parse" }).pipe((v) => v.id > 0))
  .output(PlanetSchema)
  .handler(async ({ input }) => {
    // your find code here
    return { id: 1, name: "name" };
  });

export const createPlanet = os
  .route({ method: "POST", path: "/planets" })
  .input(PlanetSchema.omit("id"))
  .output(PlanetSchema)
  .handler(async ({ input, context }) => {
    // your create code here
    return { id: 1, name: "name" };
  });

export const router = {
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
};
