import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const users = [
  {
    id: 1,
    email: "admin@dhl.com",
    password: bcrypt.hashSync("1234", 10),
    role: "admin",
  },
];

export const login = (req: Request, res: Response) => {
  const { email, password: inputPassword } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isPasswordValid = bcrypt.compareSync(
    inputPassword,
    user.password
  );

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    "SECRET_KEY",
    { expiresIn: "1h" }
  );

  const { password, ...safeUser } = user;

  res.json({ token, user: safeUser });
};