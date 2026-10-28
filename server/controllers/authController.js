const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authModel = require("../models/authModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const login = async (req, res, next) => {

    try {

        const { email, password } = req.body || {};

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {

            throw new ApiError(
                400,
                "Email and password are required."
            );

        }

        const admin = await authModel.getAdminByEmail(email.trim().toLowerCase());

        if (!admin) {

            throw new ApiError(
                401,
                "Invalid email or password."
            );

        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password_hash
        );

        if (!passwordMatch) {

            throw new ApiError(
                401,
                "Invalid email or password."
            );

        }

        const token = jwt.sign(

            {
                id: admin.id,
                email: admin.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "24h"
            }

        );

        const administrator = {

            id: admin.id,
            full_name: admin.full_name,
            email: admin.email

        };

        return res.status(200).json({

            ...new ApiResponse(

                true,

                "Login successful."

            ),

            token,

            administrator,

            admin: administrator

        });

    }

    catch (error) {

        next(error);

    }

};

// GET /api/auth/me - confirms the token is valid and the admin still exists
const getCurrentAdmin = async (req, res, next) => {
    try {
        const admin = await authModel.getAdminById(req.admin.id);

        if (!admin) {
            throw new ApiError(401, "Administrator account no longer exists.");
        }

        return res.status(200).json(
            new ApiResponse(true, "Administrator retrieved successfully.", admin)
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    getCurrentAdmin
};