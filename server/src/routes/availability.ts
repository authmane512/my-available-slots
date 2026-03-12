import { Router, type Request, type Response } from "express";

const router = Router();

interface EventType {
  slug: string;
  title: string;
  lengthInMinutes: number;
}

interface CalSlot {
  time: string;
}

function getEventTypes(): EventType[] {
  const raw = process.env.CAL_EVENT_TYPES ?? "";
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [slug, title, duration] = entry.split(":");
      return { slug, title: title || slug, lengthInMinutes: Number(duration) || 0 };
    });
}

async function fetchSlots(
  slug: string,
  username: string,
  startTime: string,
  endTime: string,
  timeZone?: string
): Promise<Record<string, CalSlot[]>> {
  const params = new URLSearchParams({
    startTime,
    endTime,
    eventTypeSlug: slug,
  });
  params.append("usernameList[]", username);

  if (timeZone) {
    params.set("timeZone", timeZone);
  }

  const res = await fetch(
    `https://api.cal.com/v2/slots/available?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
        "cal-api-version": process.env.CAL_API_VERSION!,
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`Cal.com slots error for "${slug}" (${res.status}): ${body}`);
    return {};
  }

  const json = (await res.json()) as { data?: { slots?: Record<string, CalSlot[]> } };
  return json?.data?.slots ?? {};
}

router.get("/", async (req: Request, res: Response) => {
  const { start, end, timeZone } = req.query as Record<string, string | undefined>;

  if (!start || !end) {
    res.status(400).json({ error: "start and end dates are required" });
    return;
  }

  if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
    res.status(400).json({ error: "Invalid date format" });
    return;
  }

  const username = process.env.CAL_USERNAME;
  if (!username) {
    res.status(500).json({ error: "CAL_USERNAME not configured" });
    return;
  }

  const eventTypes = getEventTypes();
  if (eventTypes.length === 0) {
    res.status(500).json({ error: "CAL_EVENT_TYPES not configured" });
    return;
  }

  try {
    const results = await Promise.all(
      eventTypes.map(async (et) => {
        const slots = await fetchSlots(et.slug, username, start, end, timeZone);
        return {
          title: et.title,
          slug: et.slug,
          lengthInMinutes: et.lengthInMinutes,
          slots,
        };
      })
    );

    res.json({ data: results });
  } catch (err) {
    console.error("Failed to fetch from Cal.com:", err);
    res.status(500).json({ error: "Failed to fetch from Cal.com" });
  }
});

export { router as availabilityRouter };
