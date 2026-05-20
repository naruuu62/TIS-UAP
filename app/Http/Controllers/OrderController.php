<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{
    #[OA\Post(
        path: '/api/orders',
        tags: ['Orders'],
        summary: 'Buat order baru',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['user_id', 'items'],
                properties: [
                    new OA\Property(property: 'user_id', type: 'integer', example: 1),
                    new OA\Property(
                        property: 'items',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'product_id', type: 'integer', example: 1),
                                new OA\Property(property: 'quantity', type: 'integer', minimum: 1, example: 2),
                            ]
                        )
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Order berhasil dibuat',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Order berhasil dibuat.'),
                        new OA\Property(property: 'data', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'user_id', type: 'integer', example: 1),
                                new OA\Property(property: 'total_price', type: 'string', example: '25000000.00'),
                                new OA\Property(property: 'order_items', type: 'array', items: new OA\Items(type: 'object')),
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
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $order = DB::transaction(function () use ($validated) {
                $totalPrice = 0;
                $orderItemsData = [];

                foreach ($validated['items'] as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if ($product->stock !== null && $product->stock < $item['quantity']) {
                        throw new \Exception("Stok produk '{$product->name}' tidak mencukupi.");
                    }

                    $itemPrice = $product->price * $item['quantity'];
                    $totalPrice += $itemPrice;

                    $orderItemsData[] = [
                        'product_id' => $product->id,
                        'quantity'   => $item['quantity'],
                        'price'      => $product->price,
                    ];

                    if ($product->stock !== null) {
                        $product->decrement('stock', $item['quantity']);
                    }
                }

                $order = Order::create([
                    'user_id'     => $validated['user_id'],
                    'total_price' => $totalPrice,
                    'status'      => 'completed',
                ]);

                foreach ($orderItemsData as $itemData) {
                    $order->orderItems()->create($itemData);
                }

                return $order->load(['user', 'orderItems.product']);
            });

            return response()->json([
                'success' => true,
                'message' => 'Order berhasil dibuat.',
                'data' => $order,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    #[OA\Get(
        path: '/api/orders',
        tags: ['Orders'],
        summary: 'Ambil semua order',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Daftar order berhasil diambil',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Daftar order berhasil diambil.'),
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            )
        ]
    )]
    public function index(): JsonResponse
    {
        $orders = Order::with(['user', 'orderItems.product'])->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar order berhasil diambil.',
            'data' => $orders,
        ], 200);
    }

    #[OA\Get(
        path: '/api/orders/{id}',
        tags: ['Orders'],
        summary: 'Ambil order berdasarkan ID',
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer', example: 1))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detail order berhasil diambil',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'data', type: 'object'),
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: 'Order tidak ditemukan',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: false),
                        new OA\Property(property: 'message', type: 'string', example: 'Order tidak ditemukan.'),
                    ]
                )
            ),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order tidak ditemukan.'], 404);
        }
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,completed,cancelled',
            ]);
            $order->update($validated);
            return response()->json([
                'success' => true,
                'message' => 'Order berhasil diperbarui.',
                'data'    => $order->load(['user', 'orderItems.product']),
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validasi gagal.', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order tidak ditemukan.'], 404);
        }
        $order->orderItems()->delete();
        $order->delete();
        return response()->json(['success' => true, 'message' => 'Order berhasil dihapus.'], 200);
    }

    public function show(int $id): JsonResponse
    {
        $order = Order::with(['user', 'orderItems.product'])->find($id);

        if (! $order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail order berhasil diambil.',
            'data' => $order,
        ], 200);
    }
}
