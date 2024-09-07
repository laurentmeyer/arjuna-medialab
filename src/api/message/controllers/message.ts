import { factories } from "@strapi/strapi";
import { getTimeHelpers } from "../../../helpers/timeHelpers";
import { DateTime, Duration } from "luxon";
import { errors } from "@strapi/utils";

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_CLIENTKEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export default factories.createCoreController(
  "api::message.message",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { id } = ctx.params;

      const fetchResult = await strapi.entityService.findOne(
        "api::message.message",
        id,
        {
          fields: ["id", "text", "time", "likesCount"],
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
            author: {
              fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
              },
            },
            replyTo: true,
            replies: {
              fields: ["id", "text", "time", "likesCount"],
              populate: {
                replyTo: true,
                retweets: true,
                image: {
                  fields: ["url", "alternativeText"],
                },
                author: {
                  fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                  },
                },
              },
            },
            retweets: {
              fields: ["id", "text", "time", "likesCount"],
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
                author: {
                  fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                  },
                },
              },
            },
            isRetweetOf: {
              fields: ["id", "text", "time", "likesCount"],
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
                author: {
                  fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                  },
                },
              },
            },
          },
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
        "api::message.message",
        {
          ...sanitizedQueryParams,
          fields: ["id", "text", "time", "likesCount"],
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
            author: {
              fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
              populate: {
                image: {
                  fields: ["url", "alternativeText"],
                },
              },
            },
            replyTo: true,
            replies: {
              fields: ["id", "text", "time", "likesCount"],
              populate: {
                replyTo: true,
                retweets: true,
                image: {
                  fields: ["url", "alternativeText"],
                },
                author: {
                  fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
                    },
                  },
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
                  fields: ["id", "handle", "firstName", "lastName", "imageUrl"],
                  populate: {
                    image: {
                      fields: ["url", "alternativeText"],
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

      return fetchResult
        .map(toPayloadWithDateTime)
        .filter(({ time }) => time.valueOf() < now);
    },

    async create(ctx) {
      const { sessionStart } = await getTimeHelpers(strapi);
      const duration = DateTime.now()
        .diff(sessionStart)
        .shiftTo("days", "hours", "minutes", "seconds", "milliseconds");

      // Remove extra days, or else the hours in the time prop will be >= 24 and won't pass validation
      const { hours, minutes, seconds } = duration;
      const time = Duration.fromObject({ hours, minutes, seconds }).toFormat(
        "hh:mm:ss.SSS"
      );
      const data = JSON.parse(ctx.request.body.data);
      ctx.request.body.data = JSON.stringify({
        ...data,
        time,
      });

      const response = await super.create(ctx);

      await pusher.trigger("messages", "post", "invalidate");

      return response;
    },
  })
);
