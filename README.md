# TiHouseworkServer, 티집살림 서버


## About The Project
### Notion Page : https://msukim.notion.site/Back-end-9de21a7f4b864ed1af9a9e3ba6d3d335
### Developemnt Log Page : https://msukim.notion.site/Back-end-9de21a7f4b864ed1af9a9e3ba6d3d335
Serverless stack : Gateway API(+websocket) + Lmabda + dynamoDB <br>

---
**NOTE**

Due to backend architecture changes, Login and Register lambda functions are only in use. other functions are deprecated.

---


## Getting Started / 어떻게 시작하나요?
### Prerequisites / 선행 조건
- SAM CLI
- Docker

### Installation / 설치
```
git clone
npm install

* 1. credentials.js을 각 lambda function directory(package.json파일이 있는 선상)에 추가하기
* 2. firebase admin credential file 을 src/main 안에 넣기
두 파일을 얻으려면 성언한테 연락!
```

### Running / 실행
start server locally
1. start local dynamodb
```
docker pull amazon/dynamodb-local
docker run -d -p 8000:8000 amazon/dynamodb-local

// local dynamodb gui
export DYNAMO_ENDPOINT=http://localhost:8000
dynamodb-admin
```
2. start server locally.
```
sam build
sam local start-api
```
## Deployment / 배포

Add additional notes about how to deploy this on a live system / 라이브 시스템을 배포하는 방법
```
sam deploy --guided
```

## Built With / 누구랑 만들었나요?

* [이름](링크) - 무엇 무엇을 했어요
* [Name](Link) - Create README.md

## Contributiong / 기여

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us. / [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) 를 읽고 이에 맞추어 pull request 를 해주세요.

## License / 라이센스

This project is licensed under the MIT License - see the [LICENSE.md](https://gist.github.com/PurpleBooth/LICENSE.md) file for details / 이 프로젝트는 MIT 라이센스로 라이센스가 부여되어 있습니다. 자세한 내용은 LICENSE.md 파일을 참고하세요.

## Acknowledgments / 감사의 말

* Hat tip to anyone whose code was used / 코드를 사용한 모든 사용자들에게 팁
* Inspiration / 영감
* etc / 기타
