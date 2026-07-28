const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authModel = require("../models/authModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            throw new ApiError(
                400,
                "Email and password are required."
            );

        }

        const admin = await authModel.getAdminByEmail(email);

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

module.exports = {
    login
};