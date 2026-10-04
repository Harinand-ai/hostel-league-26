import { Team, Match, Goal, Assist, ManOfTheMatch, Player, TeamStanding, PlayerStatEntry } from '../types/tournament';

export function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  // Initialize standings for every team
  const standingsMap = new Map<string, {
    team: Team;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goals_for: number;
    goals_against: number;
    goal_difference: number;
    points: number;
    form: ('W' | 'D' | 'L')[];
  }>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      form: [],
    });
  });

  // Sort matches by round and match_number to get accurate form sequence
  const completedMatches = matches
    .filter(m => m.status === 'COMPLETED' && m.home_score !== null && m.away_score !== null)
    .sort((a, b) => a.round_number - b.round_number || a.match_number - b.match_number);

  completedMatches.forEach(match => {
    const home = standingsMap.get(match.home_team_id);
    const away = standingsMap.get(match.away_team_id);

    if (!home || !away) return;

    const hScore = match.home_score ?? 0;
    const aScore = match.away_score ?? 0;

    home.played += 1;
    away.played += 1;

    home.goals_for += hScore;
    home.goals_against += aScore;
    away.goals_for += aScore;
    away.goals_against += hScore;

    if (hScore > aScore) {
      home.won += 1;
      home.points += 3;
      home.form.push('W');

      away.lost += 1;
      away.form.push('L');
    } else if (hScore < aScore) {
      away.won += 1;
      away.points += 3;
      away.form.push('W');

      home.lost += 1;
      home.form.push('L');
    } else {
      home.drawn += 1;
      home.points += 1;
      home.form.push('D');

      away.drawn += 1;
      away.points += 1;
      away.form.push('D');
    }

    home.goal_difference = home.goals_for - home.goals_against;
    away.goal_difference = away.goals_for - away.goals_against;
  });

  const standingsList = Array.from(standingsMap.values());

  // Sort: 1. Points, 2. GD, 3. GF, 4. Team Name
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for;
    return a.team.name.localeCompare(b.team.name);
  });

  return standingsList.map((entry, index) => ({
    position: index + 1,
    ...entry,
  }));
}

export function getTopScorers(goals: Goal[], players: Player[], teams: Team[]): PlayerStatEntry[] {
  if (goals.length === 0) return [];

  const goalCounts = new Map<string, number>();
  goals.forEach(g => {
    goalCounts.set(g.player_id, (goalCounts.get(g.player_id) || 0) + 1);
  });

  const playersMap = new Map(players.map(p => [p.id, p]));
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  const results: PlayerStatEntry[] = [];
  goalCounts.forEach((count, playerId) => {
    const player = playersMap.get(playerId);
    if (player) {
      const team = teamsMap.get(player.team_id);
      if (team) {
        results.push({
          player_id: player.id,
          player_name: player.name,
          team,
          value: count,
        });
      }
    }
  });

  return results.sort((a, b) => b.value - a.value || a.player_name.localeCompare(b.player_name));
}

export function getTopAssists(assists: Assist[], players: Player[], teams: Team[]): PlayerStatEntry[] {
  if (assists.length === 0) return [];

  const counts = new Map<string, number>();
  assists.forEach(a => {
    counts.set(a.player_id, (counts.get(a.player_id) || 0) + 1);
  });

  const playersMap = new Map(players.map(p => [p.id, p]));
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  const results: PlayerStatEntry[] = [];
  counts.forEach((count, playerId) => {
    const player = playersMap.get(playerId);
    if (player) {
      const team = teamsMap.get(player.team_id);
      if (team) {
        results.push({
          player_id: player.id,
          player_name: player.name,
          team,
          value: count,
        });
      }
    }
  });

  return results.sort((a, b) => b.value - a.value || a.player_name.localeCompare(b.player_name));
}

export function getMotmLeaderboard(motms: ManOfTheMatch[], players: Player[], teams: Team[]): PlayerStatEntry[] {
  if (motms.length === 0) return [];

  const counts = new Map<string, number>();
  motms.forEach(m => {
    counts.set(m.player_id, (counts.get(m.player_id) || 0) + 1);
  });

  const playersMap = new Map(players.map(p => [p.id, p]));
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  const results: PlayerStatEntry[] = [];
  counts.forEach((count, playerId) => {
    const player = playersMap.get(playerId);
    if (player) {
      const team = teamsMap.get(player.team_id);
      if (team) {
        results.push({
          player_id: player.id,
          player_name: player.name,
          team,
          value: count,
        });
      }
    }
  });

  return results.sort((a, b) => b.value - a.value || a.player_name.localeCompare(b.player_name));
}

export function getCleanSheets(matches: Match[], players: Player[], teams: Team[]): PlayerStatEntry[] {
  // Clean sheets count for Goalkeepers of teams that conceded 0 in completed matches
  const completed = matches.filter(m => m.status === 'COMPLETED' && m.home_score !== null && m.away_score !== null);
  if (completed.length === 0) return [];

  const teamCleanSheets = new Map<string, number>();
  completed.forEach(m => {
    if (m.away_score === 0) {
      teamCleanSheets.set(m.home_team_id, (teamCleanSheets.get(m.home_team_id) || 0) + 1);
    }
    if (m.home_score === 0) {
      teamCleanSheets.set(m.away_team_id, (teamCleanSheets.get(m.away_team_id) || 0) + 1);
    }
  });

  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const gks = players.filter(p => p.position === 'GK');

  const results: PlayerStatEntry[] = [];
  gks.forEach(gk => {
    const cs = teamCleanSheets.get(gk.team_id) || 0;
    if (cs > 0) {
      const team = teamsMap.get(gk.team_id);
      if (team) {
        results.push({
          player_id: gk.id,
          player_name: gk.name,
          team,
          value: cs,
        });
      }
    }
  });

  return results.sort((a, b) => b.value - a.value || a.player_name.localeCompare(b.player_name));
}
