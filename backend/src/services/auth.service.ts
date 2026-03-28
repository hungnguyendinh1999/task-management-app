import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { generateAccessToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { HttpError } from "../errors/app-error.js";

export async function registerUser(input: unknown) {
    const validation = registerSchema.safeParse(input);

    if (!validation.success) {
        throw new HttpError(400, "VALIDATION_ERROR", "Invalid input", validation.error.issues);
    }

    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new HttpError(409, "USER_EXISTS", "User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

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

    const token = generateAccessToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user,
        token,
    };
}

export async function loginUser(input: unknown) {
    const validation = loginSchema.safeParse(input);

    if (!validation.success) {
        throw new HttpError(400, "VALIDATION_ERROR", "Invalid input", validation.error.issues);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user || user.deletedAt !== null) {
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const token = generateAccessToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
        token,
    };
}
