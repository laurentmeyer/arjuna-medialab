/**
 * training-session router.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::training-session.training-session",
  {
    only: ["find"],
  }
);
