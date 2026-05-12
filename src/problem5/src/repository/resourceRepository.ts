import { getDb } from "../db";
import { CreateResourceInput, ListFilters, Resource, UpdateResourceInput } from "../types";

interface ResourceRow {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function mapRowToResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.run(
    `
      INSERT INTO resources (name, description, category, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    input.name,
    input.description ?? null,
    input.category ?? null,
    input.isActive === false ? 0 : 1,
    now,
    now
  );

  const created = await db.get<ResourceRow>(`SELECT * FROM resources WHERE id = ?`, result.lastID);
  if (!created) {
    throw new Error("Resource creation failed.");
  }

  return mapRowToResource(created);
}

export async function listResources(filters: ListFilters): Promise<Resource[]> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: Array<string | number> = [];

  if (filters.search) {
    clauses.push("name LIKE ?");
    params.push(`%${filters.search}%`);
  }

  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }

  if (typeof filters.isActive === "boolean") {
    clauses.push("is_active = ?");
    params.push(filters.isActive ? 1 : 0);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  const rows = await db.all<ResourceRow[]>(
    `
      SELECT * FROM resources
      ${whereClause}
      ORDER BY id DESC
      LIMIT ?
      OFFSET ?
    `,
    ...params,
    filters.limit,
    filters.offset
  );

  return rows.map(mapRowToResource);
}

export async function getResourceById(id: number): Promise<Resource | null> {
  const db = await getDb();
  const row = await db.get<ResourceRow>(`SELECT * FROM resources WHERE id = ?`, id);

  if (!row) {
    return null;
  }

  return mapRowToResource(row);
}

export async function updateResourceById(
  id: number,
  input: UpdateResourceInput
): Promise<Resource | null> {
  const db = await getDb();
  const updates: string[] = [];
  const values: Array<string | number | null> = [];

  if (typeof input.name !== "undefined") {
    updates.push("name = ?");
    values.push(input.name);
  }

  if (typeof input.description !== "undefined") {
    updates.push("description = ?");
    values.push(input.description);
  }

  if (typeof input.category !== "undefined") {
    updates.push("category = ?");
    values.push(input.category);
  }

  if (typeof input.isActive !== "undefined") {
    updates.push("is_active = ?");
    values.push(input.isActive ? 1 : 0);
  }

  if (updates.length === 0) {
    return getResourceById(id);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());

  const result = await db.run(
    `
      UPDATE resources
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
    ...values,
    id
  );

  if ((result.changes ?? 0) === 0) {
    return null;
  }

  return getResourceById(id);
}

export async function deleteResourceById(id: number): Promise<boolean> {
  const db = await getDb();
  const result = await db.run(`DELETE FROM resources WHERE id = ?`, id);
  return (result.changes ?? 0) > 0;
}
