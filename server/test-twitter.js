const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: 'nxI1zkZ6mQlkMc8deqs03fn1U',
  appSecret: 'GAy49cvWDBAaqXaMHpR7dqGAUNizDjm6I4ZjrBSmbtB2KDNJDP',
  accessToken: '1487440188913905665-zvtLM3yU7udVc0nw36TisVR6v7InCL',
  accessSecret: 'sa7EnfsqsKPUVneVIWg8obb2QT0EUX39Lwq5SKg3E5Wjn',
});

(async () => {
  try {
    console.log('Testing authentication...');
    const me = await client.v2.me();
    console.log('✅ Authenticated as:', me.data.username);
    
    console.log('Testing tweet posting...');
    const tweet = await client.v2.tweet('Test tweet from Auto-Tweet system! 🚀 #CryptoAirdrop');
    console.log('✅ Tweet posted successfully! ID:', tweet.data.id);
    
  } catch (err) {
    console.error('❌ Error:', err.code, err.data);
  }
})();
