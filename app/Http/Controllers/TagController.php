<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class TagController extends Controller
{
    #[OA\Get(
        path: '/api/tags',
        tags: ['Tags'],
        summary: 'Ambil semua tag',
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Daftar tag berhasil diambil')
        ]
    )]
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => Tag::withCount('products')->get(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $tag = Tag::withCount('products')->find($id);
        if (!$tag) return response()->json(['success' => false, 'message' => 'Tag tidak ditemukan.'], 404);
        return response()->json(['success' => true, 'data' => $tag]);
    }

    #[OA\Post(
        path: '/api/tags',
        tags: ['Tags'],
        summary: 'Buat tag baru (admin)',
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 100, example: 'elektronik'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Tag berhasil dibuat'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:100|unique:tags,name']);
        $tag = Tag::create(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Tag berhasil dibuat.', 'data' => $tag], 201);
    }

    #[OA\Put(
        path: '/api/tags/{id}',
        tags: ['Tags'],
        summary: 'Update tag (admin)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [new OA\Property(property: 'name', type: 'string', example: 'gadget')]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Tag berhasil diupdate'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $tag = Tag::find($id);
        if (!$tag) return response()->json(['success' => false, 'message' => 'Tag tidak ditemukan.'], 404);

        $request->validate(['name' => 'required|string|max:100|unique:tags,name,' . $id]);
        $tag->update(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Tag berhasil diupdate.', 'data' => $tag]);
    }

    #[OA\Delete(
        path: '/api/tags/{id}',
        tags: ['Tags'],
        summary: 'Hapus tag (admin)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tag berhasil dihapus'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $tag = Tag::find($id);
        if (!$tag) return response()->json(['success' => false, 'message' => 'Tag tidak ditemukan.'], 404);
        $tag->products()->detach();
        $tag->delete();
        return response()->json(['success' => true, 'message' => 'Tag berhasil dihapus.']);
    }

    #[OA\Put(
        path: '/api/products/{id}/tag/{tagId}',
        tags: ['Tags'],
        summary: 'Attach tag ke produk (admin)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id',    in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'tagId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tag berhasil ditambahkan ke produk'),
        ]
    )]
    public function attachTag(int $productId, int $tagId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        Tag::findOrFail($tagId);

        if (!$product->tags()->where('tag_id', $tagId)->exists()) {
            $product->tags()->attach($tagId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil ditambahkan ke produk.',
            'data'    => $product->load('tags'),
        ]);
    }

    #[OA\Delete(
        path: '/api/products/{id}/tag/{tagId}',
        tags: ['Tags'],
        summary: 'Detach tag dari produk (admin)',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id',    in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'tagId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tag berhasil dilepas dari produk'),
        ]
    )]
    public function detachTag(int $productId, int $tagId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $product->tags()->detach($tagId);

        return response()->json([
            'success' => true,
            'message' => 'Tag berhasil dilepas dari produk.',
            'data'    => $product->load('tags'),
        ]);
    }

    #[OA\Get(
        path: '/api/products/{id}',
        tags: ['Products'],
        summary: 'Ambil produk beserta tags & categories',
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detail produk'),
        ]
    )]
    public function showProduct(int $id): JsonResponse
    {
        $product = Product::with(['tags', 'categories', 'user'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $product]);
    }
}
