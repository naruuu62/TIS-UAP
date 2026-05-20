<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/api/auth/register',
        tags: ['Auth'],
        summary: 'Register user baru',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'role'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Nuril Arifin'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'nuril@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'secret123'),
                    new OA\Property(property: 'role', type: 'string', enum: ['admin', 'seller', 'buyer'], example: 'buyer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Register berhasil',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'message', type: 'string', example: 'Register berhasil.'),
                    new OA\Property(property: 'token', type: 'string'),
                    new OA\Property(property: 'user', type: 'object'),
                ])
            ),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'role'     => 'required|in:admin,seller,buyer',
            ]);

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => $validated['role'],
            ]);

            $token = auth('api')->login($user);

            return response()->json([
                'success' => true,
                'message' => 'Register berhasil.',
                'token'   => $token,
                'user'    => $user,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $e->errors(),
            ], 422);
        }
    }

    #[OA\Post(
        path: '/api/auth/login',
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'nuril@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'secret123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Login berhasil',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'success', type: 'boolean', example: true),
                    new OA\Property(property: 'token', type: 'string'),
                    new OA\Property(property: 'token_type', type: 'string', example: 'bearer'),
                    new OA\Property(property: 'expires_in', type: 'integer', example: 3600),
                    new OA\Property(property: 'user', type: 'object'),
                ])
            ),
            new OA\Response(response: 401, description: 'Email atau password salah'),
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    #[OA\Post(
        path: '/api/auth/logout',
        tags: ['Auth'],
        summary: 'Logout user',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Logout berhasil'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    #[OA\Post(
        path: '/api/auth/refresh',
        tags: ['Auth'],
        summary: 'Refresh JWT token',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Token berhasil diperbarui'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    #[OA\Get(
        path: '/api/auth/me',
        tags: ['Auth'],
        summary: 'Ambil data user yang sedang login',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Data user berhasil diambil'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function me(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => auth('api')->user(),
        ]);
    }

    private function respondWithToken(string $token): JsonResponse
    {
        return response()->json([
            'success'    => true,
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user'       => auth('api')->user(),
        ]);
    }
}
