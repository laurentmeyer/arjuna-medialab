import { PayloadWithTime, getTimeHelpers } from "../../../helpers/timeHelpers";
import { factories } from "@strapi/strapi";
import { DateTime } from "luxon";
import { errors } from "@strapi/utils";

export default factories.createCoreController(
  "api::article.article",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;

      const fetchResult = await strapi.entityService.findOne(
        "api::article.article",
        id,
        {
          fields: ["id", "title", "content", "time"],
          populate: {
            thumbnail: {
              fields: ["url", "alternativeText"],
            },
            source: {
              fields: ["id", "name"],
              populate: {
                logo: {
                  fields: ["url", "alternativeText"],
                },
                icon: {
                  fields: ["url", "alternativeText"],
                },
              },
            },
          },
          publicationState: "live",
        }
      );

      const { toPayloadWithDateTime } = await getTimeHelpers(strapi);

      const payloadWithDateTime = toPayloadWithDateTime(fetchResult);

      if (payloadWithDateTime.time.valueOf() > DateTime.now().valueOf())
        throw new errors.NotFoundError();

      return payloadWithDateTime;
    },

    async find(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const fetchResult = await strapi.entityService.findMany(
        "api::article.article",
        {
          ...sanitizedQueryParams,
          fields: ["id", "title", "content", "time"],
          populate: {
            thumbnail: {
              fields: ["url", "alternativeText"],
            },
            source: {
              fields: ["id", "name"],
              populate: {
                logo: {
                  fields: ["url", "alternativeText"],
                },
                icon: {
                  fields: ["url", "alternativeText"],
                },
              },
            },
          },
          publicationState: "live",
          sort: { time: "desc" },
        }
      );

      const { toPayloadWithDateTime } = await getTimeHelpers(strapi);

      const now = DateTime.now().valueOf();

      return (fetchResult as ReadonlyArray<PayloadWithTime>)
        .map(toPayloadWithDateTime)
        .filter(({ time }) => time.valueOf() < now);
    },
  })
);
