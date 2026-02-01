// Base de datos temporal de usuarios (solo desarrollo)
// TODO: Reemplazar con base de datos real (Prisma + PostgreSQL/MongoDB)

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "users.json");

export interface UserDB {
  id: string;
  email: string;
  password: string; // hash
  nombre: string;
  apellido: string;
  rol: "estudiante" | "profesor";
  createdAt: string;
}

function getUsers(): UserDB[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveUsers(users: UserDB[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

export async function createUser(data: {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: "estudiante" | "profesor";
}): Promise<UserDB | null> {
  const users = getUsers();
  
  // Verificar si ya existe
  if (users.find(u => u.email === data.email)) {
    return null;
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser: UserDB = {
    id: crypto.randomUUID(),
    email: data.email,
    password: hashedPassword,
    nombre: data.nombre,
    apellido: data.apellido,
    rol: data.rol,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export async function verifyUser(
  email: string,
  password: string
): Promise<UserDB | null> {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

export function getUserByEmail(email: string): UserDB | null {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}
