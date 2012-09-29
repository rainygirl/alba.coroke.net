alba.coroke.net
===============

What is alba.coroke.net?
------------------------
alba.coroke.net 은 트위터에서 같은 글을 여러 계정에 반복해 게시하는 '트위터 알바' (이른바 '십알단') 을 '색출'해내기 위해, 누구나 키워드를 등록하고 알바계정이름을 등록하면 키워드별 알바계정들의 글을 가로스크롤로 한눈에 볼 수 있도록 만든 간단한 서비스입니다.

사실 이 솔루션은 이미 모든 선거캠프와 기업SNS모니터링팀에서 비싼돈을 들여 사용하고 있기도 합니다. 그러지 말고 이거 고쳐쓰세요.

Can I run it?
-------------
node.js 개발자이고, Twitter Developer API token 을 발급받았다면 누구나 개인 머신 또는 서버에서 가동 및 개발이 가능합니다.

Are there any prerequisites to run this?
----------------------------------------
alba.coroke.net 은 mongoDB 를 사용합니다. 각 머신에 맞게 구글링하여 mongoDB를 설치하고, 'coroke_db' 라는 collection을 만들면 됩니다.

credentials.js 에 Twitter Consumer Key와 OAuth Token 등을 기재해야 합니다. dev.twitter.com 에서 발급받으면 됩니다.
참고로 첫 배포버전은 Streaming API를 사용하고 있지 않으며, 특정 트위터 계정이 알바계정을 follow한 뒤 자신의 Timeline 에서 수집토록 하고 있습니다. 

package.json 에 의존성 정보를 적어두었습니다. npm install 명령어로 패키지를 설치하면 됩니다.

```
$ npm install
```

How to run?
-----------
node app.js 로 가동하거나 forever start app.js 로 가동하면 http://localhost:8124 로 열람 가능합니다.

```
$ node app.js
```

License
-------
각 패키지는 각 패키지 라이센스를 따릅니다.
alba.coroke.net 소스는 GPL 라이센스 하에 누구나 수정 재배포 가능하며, 참여자에 대한 밥 또는 맥주 Donation을 환영합니다.

Who is Dojisa. Kim?
-------------------
alba.coroke.net 은 2012년 7월 경 트위터에 도지사 알바 계정이 다수 발견되면서 시작된 프로젝트입니다. 이 소스코드를 고귀한 그분께도 헌정합니다.
