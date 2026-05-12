import { Router } from "express";
import {
  createResource,
  deleteResourceById,
  getResourceById,
  listResources,
  updateResourceById
} from "../repository/resourceRepository";
import { CreateResourceInput, UpdateResourceInput } from "../types";

const router = Router();

function parseId(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseBooleanFilter(value: string | undefined): boolean | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

router.post("/", async (req, res, next) => {
  try {
    const body = req.body as CreateResourceInput;

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return res.status(400).json({ message: "Field 'name' is required." });
    }

    const created = await createResource({
      name: body.name.trim(),
      description: body.description ?? null,
      category: body.category ?? null,
      isActive: body.isActive
    });

    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ message: "Query 'limit' must be an integer between 1 and 100." });
    }

    if (!Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({ message: "Query 'offset' must be a non-negative integer." });
    }

    const resources = await listResources({
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      isActive: parseBooleanFilter(
        typeof req.query.isActive === "string" ? req.query.isActive : undefined
      ),
      limit,
      offset
    });

    return res.json(resources);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid resource id." });
    }

    const resource = await getResourceById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    return res.json(resource);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid resource id." });
    }

    const body = req.body as UpdateResourceInput;
    if (typeof body.name !== "undefined" && body.name.trim().length === 0) {
      return res.status(400).json({ message: "Field 'name' cannot be empty." });
    }

    const updated = await updateResourceById(id, {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      description: body.description,
      category: body.category,
      isActive: body.isActive
    });

    if (!updated) {
      return res.status(404).json({ message: "Resource not found." });
    }

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid resource id." });
    }

    const deleted = await deleteResourceById(id);
    if (!deleted) {
      return res.status(404).json({ message: "Resource not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
