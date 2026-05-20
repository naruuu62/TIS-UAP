<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Post(
        path: '/api/products',
        tags: ['Products'],
        summary: 'Buat produk baru',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['user_id', 'name', 'price', 'stock'],
                properties: [
                    new OA\Property(property: 'user_id', type: 'integer', example: 1),
                    new OA\Property(property: 'name', type: 'string', maxLength: 150, example: 'Laptop Gaming ASUS'),
                    new OA\Property(property: 'price', type: 'number', minimum: 0, example: 12500000),
                    new OA\Property(property: 'stock', type: 'integer', minimum: 0, example: 10),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Product berhasil dibuat',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Product berhasil dibuat.'),
                        new OA\Property(property: 'data', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'name', type: 'string', example: 'Laptop Gaming ASUS'),
                                new OA\Property(property: 'price', type: 'string', example: '12500000.00'),
                                new OA\Property(property: 'stock', type: 'integer', example: 10),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'name'    => 'required|string|max:150',
                'price'   => 'required|numeric|min:0',
                'stock'   => 'required|integer|min:0',
            ]);

            $product = Product::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Product berhasil dibuat.',
                'data'    => $product->load(['user', 'tags', 'categories']),
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $e->errors(),
            ], 422);
        }
    }

    #[OA\Get(
        path: '/api/products',
        tags: ['Products'],
        summary: 'Ambil semua produk',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar produk berhasil diambil',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Daftar produk berhasil diambil.'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            )
        ]
    )]
    public function index(): JsonResponse
    {
        $products = Product::with(['user', 'tags', 'categories'])->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk berhasil diambil.',
            'data'    => $products,
        ], 200);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan.'], 404);
        }
        try {
            $validated = $request->validate([
                'name'        => 'sometimes|string|max:150',
                'description' => 'sometimes|nullable|string',
                'price'       => 'sometimes|numeric|min:0',
                'stock'       => 'sometimes|integer|min:0',
            ]);
            $product->update($validated);
            return response()->json(['success' => true, 'message' => 'Produk berhasil diperbarui.', 'data' => $product], 200);
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan.'], 404);
        }
        $product->delete();
        return response()->json(['success' => true, 'message' => 'Produk berhasil dihapus.'], 200);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('user')->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail produk berhasil diambil.',
            'data'    => $product,
        ], 200);
    }
}
