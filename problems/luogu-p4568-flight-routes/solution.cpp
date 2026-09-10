#include <bits/stdc++.h>
using namespace std;

#define ull unsigned long long
#define ll long long
#define edl '\n'

const int N = 1e5 + 10;
const ll INF = 1e18;

ll n, m, k;
ll s, t;

vector<pair<ll, ll>> g[N];

struct QWQ {
    ll x, w, used;

    bool operator<(const QWQ& other) const {
        if (w != other.w) return w > other.w;
        return used > other.used;
    }
};

ll ck[N][20];
ll dp[N][20];

void solve() {
    cin >> n >> m >> k;
    cin >> s >> t;
    for (int i = 1; i <= m; i++) {
        ll u, v, w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }

    for (int i = 0; i < n; i++) {
        for (int j = 0; j <= k; j++) {
            dp[i][j] = INF;
        }
    }

    priority_queue<QWQ> q;
    q.push({s, 0, 0});
    dp[s][0] = 0;

    while (!q.empty()) {
        auto [x, w, used] = q.top();
        q.pop();
        if (ck[x][used]) continue;
        ck[x][used] = 1;

        for (auto [u, v] : g[x]) {
            if (used < k && dp[u][used + 1] > w) {
                dp[u][used + 1] = w;
                q.push({u, w, used + 1});
            }
            if (dp[u][used] > w + v) {
                dp[u][used] = w + v;
                q.push({u, w + v, used});
            }
        }
    }

    ll ans = INF;
    for (int i = 0; i <= k; i++) ans = min(ans, dp[t][i]);
    cout << ans << edl;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int test_cases = 1;
    while (test_cases--) solve();
    return 0;
}
