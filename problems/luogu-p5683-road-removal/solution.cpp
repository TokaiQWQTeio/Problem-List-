#include<bits/stdc++.h>
using namespace std;

#define ull unsigned long long
#define ll long long
#define edl '\n'

const int N = 1e6 + 10;
const int M = 1e3 + 10;

const int mod = 1e9 + 7;
ll n,m,u,v,an1,an2,s2,t1,s1,t2;
string s;

ll a[N];
ll dp[N],dp1[N];
ll ck[N];
vector<ll>g[N];

void bfs(){
	deque<ll>q;
	q.push_back(1);
	while(!q.empty()){
		int x = q.front();
		q.pop_front();
		if(ck[x]) continue;
		ck[x] = 1;
		for(auto it : g[x]){
			if(!ck[it]){
				q.push_back(it);
				dp[it] = min(dp[x] + 1,dp[it]);
			}
		}
	}
}

void bbf(int i){
	deque<ll>q;
	q.push_back(i);
	while(!q.empty()){
		int x = q.front();
		q.pop_front();
		if(ck[x]) continue;
		ck[x] = 1;
		for(auto it : g[x]){
			if(!ck[it]){
				q.push_back(it);
				dp1[it] = min(dp1[x] + 1,dp1[it]);
			}
		}
	}
	if(dp1[s1] + dp[i] <= t1) an1 = dp1[s1];
	if(dp1[s2] + dp[i] <= t2) an2 = dp1[s2];
}

void solve()
{
	cin >> n >> m;
	for(int i = 1; i <= m; i ++ ){
		cin >> u >> v;
		g[u].push_back(v);
		g[v].push_back(u);
	}
	cin >> s1 >> t1 >> s2 >> t2;
	for(int i = 1; i <= n; i ++ ) dp[i] = 1e18;
	dp[1] = 0;
	bfs();
	ll ans = 1e18;
	for(int i = 1; i <= n; i ++ ){
		for(int j = 1; j <= n; j ++ ) ck[j] = 0,dp1[j] = 1e18;
		dp1[i] = 0;
		an1 = an2 = 1e18;
		bbf(i);
		ans = min(ans,dp[i] + an1 + an2);
	}
	if(ans == 1e18) cout << -1 << edl;
	else cout << m - ans << edl;
}

int main()
{
	std::ios::sync_with_stdio(false);
	std::cin.tie(nullptr);
	int t = 1;
//	cin >> t;
	while(t -- ) solve();
	return 0;
}