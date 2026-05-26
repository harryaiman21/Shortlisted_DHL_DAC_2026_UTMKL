<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GenerateBotToken extends Command
{
    // This is the command you'll type in the terminal
    protected $signature = 'bot:generate-token {name=UiPathBot}';
    protected $description = 'Generate a Sanctum token for an RPA or System Bot';

    public function handle()
    {
        $name = $this->argument('name');

        // 1. Find or create the bot user
        $user = User::firstOrCreate(
            ['email' => Str::slug($name) . '@system.local'],
            [
                'name' => $name,
                'password' => Hash::make(Str::random(32)),
            ]
        );

        // 2. Generate the token
        $token = $user->createToken($name)->plainTextToken;

        $this->info("Successfully generated token for: {$name}");
        $this->line("Token: <options=bold>{$token}</>");
        $this->warn("Copy this now! You won't be able to see the full key again.");
    }
}