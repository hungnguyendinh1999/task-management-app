import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { generateAccessToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

export async function registerUser(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid input",
                    details: validation.error.issues,
                },
            });
            return;
        }

        const { name, email, password } = validation.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(409).json({
                error: {
                    code: "USER_EXISTS",
                    message: "User with this email already exists",
                },
            });
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const token = generateAccessToken({
            userId: user.id,
            email: user.email,
        });

        res.status(201).json({
            data: {
                user,
                token,
            },
        });
        return;
    } catch (error) {
        next(error);
    }
}

export async function loginUser(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Invalid input",
                    details: validation.error.issues,
                },
            });
            return;
        }

        const { email, password } = validation.data;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.deletedAt !== null) {
            res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                },
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            res.status(401).json({
                error: {
                    code: "INVALID_CREDENTIALS",
                    message: "Invalid email or password",
                },
            });
            return;
        }

        // Generate JWT token
        const token = generateAccessToken({
            userId: user.id,
            email: user.email,
        });

        res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                },
                token,
            },
        });
        return;
    } catch (error) {
        next(error);
    }
}
