import { Strapi } from "@strapi/strapi";
import { DateTime, Duration } from "luxon";
import _ from "lodash";

/*
 * Constants.
 */

export const TIMEZONE = "Europe/Paris"; // the session start is set in France

/*
 * Types.
 */

export interface PayloadWithTime {
  time: string;
}

/*
 * Helpers.
 */

export async function getTimeHelpers(strapi: Strapi) {
  const trainingSession = await strapi.entityService.findMany(
    "api::training-session.training-session",
    {
      fields: ["sessionStart"],
    }
  );

  const sessionStart = DateTime.fromISO(
    trainingSession.sessionStart.toString(),
    { zone: TIMEZONE }
  );

  const strapiTimeToDuration = (time: string): Duration => {
    const [hours, minutes, seconds] = time
      .split(":")
      .map((s) => Number.parseInt(s));

    return Duration.fromObject({ hours, minutes, seconds });
  };

  const toPayloadWithDateTime = (payload: PayloadWithTime) => ({
    ...payload,
    time: sessionStart.plus(strapiTimeToDuration(payload.time)),
  });

  return { toPayloadWithDateTime, sessionStart };
}
