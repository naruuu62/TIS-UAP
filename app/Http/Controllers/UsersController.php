<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Users;
use OpenApi\Attributes as OA;

class UsersController extends Controller
{
    #[OA\Post(
        path: '/api/users',
        tags: ['Users'],
        summary: 'Buat user baru',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'role'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Nuril Arifin'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'nuril@example.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'secret123'),
                    new OA\Property(property: 'role', type: 'string', example: 'buyer'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'User berhasil ditambahkan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'User berhasil ditambahkan'),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            )
        ]
    )]
    public function createUsers(Request $request)
    {
        $users = Users::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
        ]);
        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'data' => [
                'data' => $users
            ]
        ]);
    }

    #[OA\Get(
        path: '/api/users',
        tags: ['Users'],
        summary: 'Ambil semua user',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar user berhasil ditampilkan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'User berhasil ditampilkan'),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            )
        ]
    )]
    public function getUsers()
    {
        $users = Users::all();
        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditampilkan',
            'data' => [
                'data' => $users
            ]
        ]);
    }

    #[OA\Get(
        path: '/api/users/{id}',
        tags: ['Users'],
        summary: 'Ambil user berdasarkan ID',
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data user ditemukan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            )
        ]
    )]
    public function getUsersById($id)
    {
        $users = Users::find($id);
        if (!$users) {
            return response()->json([
                'success' => false,
                'message' => 'user tidak ditemukan'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}
