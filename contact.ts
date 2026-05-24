import { Router } from "express";
import { db, contactSubmissionsTable } from "@workspace/db";
import { SubmitContactBody } from "@workspace/api-zod";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.issues }, "Contact form validation failed");
    res.status(400).json({ error: "Invalid form data. Please check all fields." });
    return;
  }

  const { name, email, service, message } = parsed.data;

  try {
    const [submission] = await db
      .insert(contactSubmissionsTable)
      .values({ name, email, service, message })
      .returning();

    req.log.info({ id: submission.id, service }, "Contact form submission saved");

    res.status(201).json({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      service: submission.service,
      message: submission.message,
      createdAt: submission.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save contact submission");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
