<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class CategoryController extends Controller
{
    #[OA\Get(
        path: '/api/categories',
        tags: ['Categories'],
        summary: 'Ambil semua kategori',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Daftar kategori')
        ]
    )]
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => Category::withCount('products')->get(),
        ]);
    }

    #[OA\Post(
        path: '/api/categories',
        tags: ['Categories'],
        summary: 'Buat kategori baru (admin)',
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Elektronik'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Kategori berhasil dibuat'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:100|unique:categories,name']);
        $category = Category::create(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dibuat.', 'data' => $category], 201);
    }

    #[OA\Get(
        path: '/api/categories/{id}',
        tags: ['Categories'],
        summary: 'Detail kategori',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Data kategori'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function show($id): JsonResponse
    {
        $category = Category::withCount('products')->find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan.'], 404);
        return response()->json(['success' => true, 'data' => $category]);
    }

    #[OA\Put(
        path: '/api/categories/{id}',
        tags: ['Categories'],
        summary: 'Update kategori (admin)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [new OA\Property(property: 'name', type: 'string', example: 'Elektronik Baru')]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Kategori berhasil diupdate'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan.'], 404);

        $request->validate(['name' => 'required|string|max:100|unique:categories,name,' . $id]);
        $category->update(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Kategori berhasil diupdate.', 'data' => $category]);
    }

    #[OA\Delete(
        path: '/api/categories/{id}',
        tags: ['Categories'],
        summary: 'Hapus kategori (admin)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Kategori berhasil dihapus'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function destroy($id): JsonResponse
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['success' => false, 'message' => 'Kategori tidak ditemukan.'], 404);
        $category->products()->detach();
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Kategori berhasil dihapus.']);
    }
}
