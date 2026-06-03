/**
 * 开源产品 GitHub Star 数获取与排序
 *
 * 页面加载后拉取各仓库 star 数，渲染到标题旁，并按 star 降序重排卡片。
 * - ant-design 链接指向组织主页，star 取该组织所有仓库之和。
 * - 使用 localStorage 缓存（6 小时）缓解 GitHub 匿名 API 限流（60 次/小时）。
 * - API 限流或请求失败时，回退到写死的兜底值，保证显示与排序稳定。
 */
(function () {
  const CACHE_KEY = 'afx-gh-stars';
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时

  // 链接指向组织主页（无具体仓库名）时，按组织聚合所有仓库 star
  const ORG_AGGREGATE = { 'ant-design': true };

  // 写死兜底值：API 限流或失败时使用。数值会随时间略有偏差，定期更新即可。
  const FALLBACK = {
    'ant-design': 192115,
    'eggjs/egg': 18995,
    'umijs/qiankun': 16612,
    'umijs/umi': 16031,
    'umijs/dumi': 3794,
    'neovateai/neovate-code': 1538,
    'afx-team/petercat': 1489,
    'utooland/utoo': 2490,
    'cnpm/cnpm': 2098,
    'galacean/effects-runtime': 611,
    'afx-team/UI-UG': 86,
    'unieojs/unieo': 32,
    'afx-team/evjs': 13,
    'afx-team/WhiskerRAG': 11,
    'afx-team/hebb-mind': 6,
  };

  /** 从卡片内的 GitHub 链接解析出 owner/repo，或组织名（组织主页链接） */
  function parseTarget(article) {
    const link = article.querySelector('a[href*="github.com"]');
    if (!link) return null;
    const m = link.href.match(/github\.com\/([^/]+)(?:\/([^/?#]+))?/);
    if (!m) return null;
    const [, owner, name] = m;
    if (!name) return ORG_AGGREGATE[owner] ? owner : null; // 组织主页
    return `${owner}/${name}`;
  }

  /** 1234 → 1.2k */
  function formatStars(n) {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
  }

  function loadCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveCache(cache) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* localStorage 不可用时忽略 */
    }
  }

  /** 拉取单仓库 star */
  async function fetchRepoStars(repo) {
    const res = await fetch(`https://api.github.com/repos/${repo}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    return data.stargazers_count;
  }

  /** 聚合组织所有仓库 star（分页累加） */
  async function fetchOrgStars(org) {
    let total = 0;
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(
        `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`
      );
      if (!res.ok) throw new Error(res.status);
      const repos = await res.json();
      total += repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      if (repos.length < 100) break;
    }
    return total;
  }

  /** 取 star：优先缓存，其次 API，最后回退写死兜底值 */
  async function getStars(target, cache) {
    const cached = cache[target];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return cached.stars;
    }
    try {
      const stars = ORG_AGGREGATE[target]
        ? await fetchOrgStars(target)
        : await fetchRepoStars(target);
      cache[target] = { stars, ts: Date.now() };
      return stars;
    } catch {
      // 过期缓存 > 写死兜底
      if (cached) return cached.stars;
      return FALLBACK[target] != null ? FALLBACK[target] : null;
    }
  }

  function renderStar(article, stars) {
    const h3 = article.querySelector('h3');
    if (!h3) return;
    let badge = h3.querySelector('.repo-stars');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'repo-stars text-xs text-gray-600 tracking-wide';
      badge.setAttribute('aria-label', `${stars} stars`);
      h3.appendChild(badge);
    }
    badge.textContent = `★ ${formatStars(stars)}`;
  }

  async function init() {
    const section = document.getElementById('products');
    if (!section) return;
    const list = section.querySelector('[role="list"]');
    if (!list) return;

    const articles = Array.from(list.querySelectorAll('article[role="listitem"]'));
    const cache = loadCache();

    const entries = await Promise.all(
      articles.map(async (article) => {
        const target = parseTarget(article);
        const stars = target ? await getStars(target, cache) : null;
        if (stars != null) renderStar(article, stars);
        return { article, stars: stars == null ? -1 : stars };
      })
    );
    saveCache(cache);

    // 按 star 降序重排，无数据（-1）排到最后
    entries.sort((a, b) => b.stars - a.stars);
    entries.forEach((entry) => list.appendChild(entry.article));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
