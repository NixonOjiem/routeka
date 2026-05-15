<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    // Keep both api/* for your JWT routes and sanctum for potential CSRF needs
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'broadcasting/*'],

    'allowed_methods' => ['*'],

    // For production, replace '*' with your actual frontend URL
    //'allowed_origins' => [env('FRONTEND_URL', 'http://192.168.100.249:3000/'), 'https://routeka-ride.duckdns.org/rides'],
    'allowed_origins' => ['https://routeka-ride.duckdns.org'],
    // 'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    // Critical for JWT: Must allow 'Authorization' and 'Content-Type'
    'allowed_headers' => ['*'],

    // If you want the frontend to read the token from a header instead of a body
    'exposed_headers' => ['Authorization'],

    'max_age' => 86400, // Cache preflight for 24 hours to improve performance

    // Set to true if using Sanctum cookies or sending 'Authorization' via cookies
    'supports_credentials' => true,

];
