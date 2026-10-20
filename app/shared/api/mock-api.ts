// 假的 /auth 和 /trades：MOCK_API=true 時 apiFetch 不打 Render，改走這裡。
// 資料放在記憶體，dev server 重啟就回到初始狀態。
// 等 pokemon-api 把 API_TODO.md 的端點做好，把 .env.local 的 MOCK_API 拿掉、這個檔案刪掉就好。
// 行為照 API_TODO.md 的規格：狀態碼、錯誤格式、密語只回給雙方、認領只能成功一次

type MockPokemon = {
  id: number;
  name: string;
  image: string;
  types: string[];
  generation: number;
};

type MockTrade = {
  id: number;
  status: "open" | "claimed" | "completed" | "cancelled";
  createdAt: string;
  creator: string;
  claimer: string | null;
  offered: MockPokemon;
  wanted: MockPokemon;
  linkCode: string;
};

const artwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const mon = (
  id: number,
  name: string,
  types: string[],
  generation: number,
): MockPokemon => ({ id, name, image: artwork(id), types, generation });

const P = {
  bulbasaur: mon(1, "bulbasaur", ["grass", "poison"], 1),
  charmander: mon(4, "charmander", ["fire"], 1),
  squirtle: mon(7, "squirtle", ["water"], 1),
  pikachu: mon(25, "pikachu", ["electric"], 1),
  gengar: mon(94, "gengar", ["ghost", "poison"], 1),
  eevee: mon(133, "eevee", ["normal"], 1),
  dragonite: mon(149, "dragonite", ["dragon", "flying"], 1),
  gardevoir: mon(282, "gardevoir", ["psychic", "fairy"], 3),
  lucario: mon(448, "lucario", ["fighting", "steel"], 4),
  greninja: mon(658, "greninja", ["water", "dark"], 6),
};

const PER_PAGE = 8;
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

let nextId = 1;
const trade = (
  creator: string,
  offered: MockPokemon,
  wanted: MockPokemon,
  minutes: number,
  extra: Partial<MockTrade> = {},
): MockTrade => ({
  id: nextId++,
  status: "open",
  createdAt: minutesAgo(minutes),
  creator,
  claimer: null,
  offered,
  wanted,
  linkCode: String(10000000 + nextId * 1234567).slice(0, 8),
  ...extra,
});

// 預設登入帳號是 ryan，密碼隨便打。mei、ken、yu 是其他玩家
const users = new Set(["ryan", "mei", "ken", "yu"]);

const trades: MockTrade[] = [
  trade("mei", P.charmander, P.squirtle, 120),
  trade("ken", P.pikachu, P.eevee, 300),
  trade("yu", P.gengar, P.dragonite, 60 * 24),
  trade("mei", P.bulbasaur, P.pikachu, 60 * 48),
  trade("ryan", P.lucario, P.gardevoir, 30), // 自己發的：看得到密語、可以下架
  trade("ken", P.greninja, P.charmander, 60 * 72),
  trade("yu", P.eevee, P.bulbasaur, 20),
  trade("mei", P.dragonite, P.lucario, 360),
  trade("ken", P.gardevoir, P.gengar, 60 * 96),
  trade("yu", P.pikachu, P.greninja, 60 * 24 * 8),
  // 下面三張不在公開列表，只會出現在 /profile
  trade("ryan", P.squirtle, P.pikachu, 60 * 5, { status: "claimed", claimer: "mei" }),
  trade("yu", P.pikachu, P.greninja, 60 * 30, { status: "claimed", claimer: "ryan" }),
  trade("ryan", P.eevee, P.gengar, 60 * 24 * 10, { status: "completed", claimer: "ken" }),
];

type Reply = { status: number; json: unknown };
const ok = (json: unknown, status = 200): Reply => ({ status, json });
const fail = (status: number, error: string): Reply => ({ status, json: { error } });

// 密語只給發文者和認領者；generation 是假資料自己篩選用的，不回給前端
function serialize(t: MockTrade, me: string | null) {
  const { linkCode, offered, wanted, ...rest } = t;
  const strip = ({ id, name, image, types }: MockPokemon) => ({ id, name, image, types });
  const canSeeCode = me !== null && (t.creator === me || t.claimer === me);
  return {
    ...rest,
    offered: strip(offered),
    wanted: strip(wanted),
    ...(canSeeCode ? { linkCode } : {}),
  };
}

const userOf = (username: string) => ({
  id: [...users].indexOf(username) + 1,
  username,
});

export function isMockApi() {
  return process.env.MOCK_API === "true";
}

export async function mockApi({
  method,
  path,
  body,
  token,
}: {
  method: string;
  path: string;
  body?: unknown;
  token?: string | null;
}): Promise<Reply> {
  const url = new URL(path, "http://mock");
  const segments = url.pathname.split("/").filter(Boolean);
  const me = token?.startsWith("mock:") ? token.slice("mock:".length) : null;
  const input = (body ?? {}) as Record<string, unknown>;

  // ---- auth ----
  if (segments[0] === "auth") {
    if (method === "POST" && (segments[1] === "login" || segments[1] === "register")) {
      const username = String(input.username ?? "").trim();
      const password = String(input.password ?? "");
      if (!username || !password) return fail(400, "請輸入帳號和密碼");
      if (segments[1] === "register" && users.has(username)) {
        return fail(409, "這個帳號已經有人用了");
      }
      if (segments[1] === "login" && !users.has(username)) {
        return fail(401, "帳號或密碼錯誤");
      }
      users.add(username);
      return ok({ token: `mock:${username}`, user: userOf(username) }, segments[1] === "register" ? 201 : 200);
    }
    if (method === "GET" && segments[1] === "me") {
      return me ? ok(userOf(me)) : fail(401, "請先登入");
    }
  }

  // ---- trades ----
  if (segments[0] === "trades") {
    if (segments.length === 1 && method === "GET") {
      const search = url.searchParams.get("search")?.toLowerCase() ?? "";
      const type = url.searchParams.get("type") ?? "";
      const generation = Number(url.searchParams.get("generation") ?? 0);
      const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
      // side 決定條件套在哪一邊：offered（預設，我想要 X → 找誰拿出 X）或 wanted（我拿出 X → 找誰想要 X）
      const side = url.searchParams.get("side") === "wanted" ? "wanted" : "offered";

      const matched = trades
        .filter((t) => t.status === "open")
        .filter((t) => !search || t[side].name.startsWith(search))
        .filter((t) => !type || t[side].types.includes(type))
        .filter((t) => !generation || t[side].generation === generation)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      const total = matched.length;
      const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
      const items = matched
        .slice((page - 1) * PER_PAGE, page * PER_PAGE)
        .map((t) => serialize(t, me));
      return ok({ items, page, perPage: PER_PAGE, total, totalPages });
    }

    if (!me) return fail(401, "請先登入");

    if (segments[1] === "mine" && method === "GET") {
      const mine = trades
        .filter((t) => t.creator === me || t.claimer === me)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((t) => serialize(t, me));
      return ok(mine);
    }

    if (segments.length === 1 && method === "POST") {
      const offered = Object.values(P).find((p) => p.id === Number(input.offeredPokemonId));
      const wanted = Object.values(P).find((p) => p.id === Number(input.wantedPokemonId));
      const linkCode = String(input.linkCode ?? "");
      // 假資料只認得上面那十隻，選別的就用問號卡代替，讓流程能走完
      const fallback = (id: number, name: string): MockPokemon => ({
        id,
        name,
        image: artwork(id),
        types: [],
        generation: 0,
      });
      const o = offered ?? fallback(Number(input.offeredPokemonId), `#${input.offeredPokemonId}`);
      const w = wanted ?? fallback(Number(input.wantedPokemonId), `#${input.wantedPokemonId}`);
      if (o.id === w.id) return fail(400, "拿出和想要的不能是同一隻");
      if (!/^\d{8}$/.test(linkCode)) return fail(400, "連線密語要 8 個數字");
      const created = trade(me, o, w, 0, { linkCode });
      trades.unshift(created);
      return ok(serialize(created, me), 201);
    }

    if (segments.length === 3 && method === "POST") {
      const target = trades.find((t) => t.id === Number(segments[1]));
      if (!target) return fail(404, "找不到這張交換單");
      const action = segments[2];

      if (action === "claim") {
        if (target.creator === me) return fail(400, "不能認領自己的單");
        if (target.status !== "open") return fail(409, "這張單已經有人認領了");
        target.status = "claimed";
        target.claimer = me;
        return ok(serialize(target, me));
      }
      if (action === "complete" || action === "cancel") {
        if (target.creator !== me) return fail(403, "只有發文者可以這麼做");
        if (action === "complete" && target.status !== "claimed") {
          return fail(409, "還沒有人認領，不能標成完成");
        }
        if (action === "cancel" && target.status !== "open" && target.status !== "claimed") {
          return fail(409, "這張單已經結束了");
        }
        target.status = action === "complete" ? "completed" : "cancelled";
        return ok(serialize(target, me));
      }
    }
  }

  return fail(404, "Not Found");
}
