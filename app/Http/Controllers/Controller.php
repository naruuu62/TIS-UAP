<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: 'Marketplace UTP API',
    version: '1.0.0',
    description: 'API Documentation untuk Marketplace UTP. Mencakup modul Users, Profiles, Products, Categories, Tags, dan Orders.'
)]
#[OA\Server(url: 'http://127.0.0.1:8000', description: 'Local Development Server')]
#[OA\Tag(name: 'Users', description: 'Manajemen data user')]
#[OA\Tag(name: 'Profiles', description: 'Manajemen profil user')]
#[OA\Tag(name: 'Products', description: 'Manajemen produk')]
#[OA\Tag(name: 'Categories', description: 'Manajemen kategori produk')]
#[OA\Tag(name: 'Tags', description: 'Manajemen tag produk')]
#[OA\Tag(name: 'Orders', description: 'Manajemen pesanan')]
abstract class Controller
{
    //
}
