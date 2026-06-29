import type { GameKey } from "@/lib/games/config";
import type { Country } from "@/lib/games/location";
import { generatePlayerName } from "@/lib/games/player-name";
import type { createAdminClient } from "@/lib/supabase/admin";

type GameLeaderboardEntry = {
  id: string;
  name: string;
  high_score: number;
  is_new_high_score: boolean;
};

type SubmitGameScoreOptions = {
  country: Country | null;
  gameKey: GameKey;
  playerTokenHash: string;
  score: number;
  supabase: ReturnType<typeof createAdminClient>;
};

type GetPlayerHighScoreOptions = {
  gameKey: GameKey;
  playerTokenHash: string;
  supabase: ReturnType<typeof createAdminClient>;
};

type PlayerHighScoreEntry = {
  high_score: number;
};

export async function getPlayerHighScore({
  gameKey,
  playerTokenHash,
  supabase,
}: GetPlayerHighScoreOptions) {
  const { data, error } = await supabase
    .from("game_leaderboard_entries")
    .select("high_score")
    .eq("game_key", gameKey)
    .eq("player_token_hash", playerTokenHash)
    .maybeSingle<PlayerHighScoreEntry>();

  if (error) return 0;

  return data?.high_score ?? 0;
}

export async function submitGameScore({
  country,
  gameKey,
  playerTokenHash,
  score,
  supabase,
}: SubmitGameScoreOptions) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const name = generatePlayerName(attempt);

    const { data, error } = await supabase
      .rpc("submit_game_score", {
        p_country_code: country?.code ?? null,
        p_country_name: country?.name ?? null,
        p_game_key: gameKey,
        p_name: name,
        p_player_token_hash: playerTokenHash,
        p_score: score,
      })
      .single<GameLeaderboardEntry>();

    if (!error) return data;

    if (error.code !== "23505") {
      if (process.env.NODE_ENV === "development") {
        console.warn("Unable to submit game score", {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message,
        });
      }

      return null;
    }
  }

  return null;
}
