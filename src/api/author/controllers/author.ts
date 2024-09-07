import { factories } from "@strapi/strapi";
import { PayloadWithTime, getTimeHelpers } from "../../../helpers/timeHelpers";
import { DateTime } from "luxon";

interface Author {
  messages?: ReadonlyArray<PayloadWithTime>;
}

export default factories.createCoreController(
  "api::author.author",
  ({ strapi }) => ({
    async find(ctx) {
      await this.validateQuery(ctx);
      const sanitizedQueryParams = await this.sanitizeQuery(ctx);

      const fetchResult = await strapi.entityService.findMany(
        "api::author.author",
        {
          ...sanitizedQueryParams,
          fields: [
            "id",
            "handle",
            "firstName",
            "lastName",
            "description",
            "followersCount",
            "imageUrl",
          ],
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
            background: {
              fields: ["url", "alternativeText"],
            },
            messages: {
              sort: { time: "desc" },
              fields: ["id", "text", "time", "likesCount"],
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
                replyTo: true,
                replies: {
                  fields: ["id", "text", "time", "likesCount"],
                  populate: {
                    replyTo: true,
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                  },
                },
                retweets: true,
                isRetweetOf: {
                  fields: ["id", "text", "time", "likesCount"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                    author: {
                      fields: [
                        "id",
                        "handle",
                        "firstName",
                        "lastName",
                        "imageUrl",
                      ],
                      populate: {
                        image: {
                          fields: ["url", "alternativeText"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );

      const { toPayloadWithDateTime } = await getTimeHelpers(strapi);

      const now = DateTime.now().valueOf();

      return fetchResult.map((res) => ({
        ...fetchResult,
        messages:
          (res as Author).messages
            ?.map(toPayloadWithDateTime)
            .filter(({ time }) => time.valueOf() < now) ?? [],
      }));
    },

    async findOne(ctx) {
      const { id } = ctx.params;

      const fetchResult: Author = await strapi.entityService.findOne(
        "api::author.author",
        id,
        {
          fields: [
            "id",
            "handle",
            "firstName",
            "lastName",
            "description",
            "followersCount",
            "imageUrl",
          ],
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
            background: {
              fields: ["url", "alternativeText"],
            },
            messages: {
              sort: { time: "desc" },
              fields: ["id", "text", "time", "likesCount"],
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
                replyTo: true,
                replies: {
                  fields: ["id", "text", "time", "likesCount"],
                  populate: {
                    replyTo: true,
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                  },
                },
                retweets: true,
                isRetweetOf: {
                  fields: ["id", "text", "time", "likesCount"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                    author: {
                      fields: [
                        "id",
                        "handle",
                        "firstName",
                        "lastName",
                        "imageUrl",
                      ],
                      populate: {
                        image: {
                          fields: ["url", "alternativeText"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );

      const { toPayloadWithDateTime } = await getTimeHelpers(strapi);

      const now = DateTime.now().valueOf();

      return {
        ...fetchResult,
        messages:
          fetchResult.messages
            ?.map(toPayloadWithDateTime)
            .filter(({ time }) => time.valueOf() < now) ?? [],
      };
    },
  })
);
