/**
 *  training-session controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::training-session.training-session",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;

      return await strapi.entityService.findOne(
        "api::training-session.training-session",
        id,
        {
          fields: ["sessionStart"],
          populate: {
            clientLogo: {
              fields: ["url", "alternativeText"],
            },
          },
        }
      );
    },

    async find(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      return await strapi.entityService.findMany(
        "api::training-session.training-session",
        {
          ...sanitizedQueryParams,
          fields: ["sessionStart"],
          populate: {
            clientLogo: {
              fields: ["url", "alternativeText"],
            },
          },
        }
      );
    },
  })
);
