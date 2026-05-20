<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Users;
use App\Models\Profiles;
use OpenApi\Attributes as OA;

class ProfilesController extends Controller
{
    #[OA\Post(
        path: '/api/profiles',
        tags: ['Profiles'],
        summary: 'Buat profil baru',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['user_id', 'name', 'address', 'phone'],
                properties: [
                    new OA\Property(property: 'user_id', type: 'integer', example: 1),
                    new OA\Property(property: 'name', type: 'string', example: 'Nuril Arifin'),
                    new OA\Property(property: 'address', type: 'string', example: 'Jl. Contoh No. 1, Jakarta'),
                    new OA\Property(property: 'phone', type: 'string', example: '081234567890'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Profile berhasil ditambahkan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Profile berhasil ditambahkan'),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            )
        ]
    )]
    public function createProfiles(Request $request)
    {
        $profiles = Profiles::create([
            'user_id' => $request->user_id,
            'name' => $request->name,
            'address' => $request->address,
            'phone' => $request->phone,
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil ditambahkan',
            'data' => $profiles
        ]);
    }

    #[OA\Get(
        path: '/api/profiles/users',
        tags: ['Profiles'],
        summary: 'Ambil semua user beserta profilnya',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data user dengan profil berhasil diambil',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'User berhasil diambil'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            )
        ]
    )]
    public function getUsersWithProfiles()
    {
        $users = Users::with('profiles')->get();
        return response()->json([
            'success' => true,
            'message' => 'User berhasil diambil',
            'data' => $users
        ]);
    }

    #[OA\Get(
        path: '/api/profiles',
        tags: ['Profiles'],
        summary: 'Ambil semua profil',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar profil berhasil ditampilkan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Profile berhasil ditampilkan'),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            )
        ]
    )]
    public function getProfiles()
    {
        $profiles = Profiles::all();
        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil ditampilkan',
            'data' => [
                'data' => $profiles
            ]
        ]);
    }

    #[OA\Get(
        path: '/api/profiles/{id}',
        tags: ['Profiles'],
        summary: 'Ambil profil berdasarkan ID',
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Data profil ditemukan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            )
        ]
    )]
    public function getProfilesById($id)
    {
        $profiles = Profiles::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $profiles
        ]);
    }
}
